#!/usr/bin/env bash
#
# assemble.sh — the one command. Footage in → finished ad out.
#
#   npm run build:final      (or: bash scripts/assemble.sh)
#
# Pipeline:
#   1. conform.sh   originals → 1920x1080 / 30fps CFR / Rec.709 / graded / no audio
#                   (and generates placeholder slates for any slot with no original)
#   2. music.sh     60.0 s music bed at -14 LUFS / -1 dBTP
#   3. remotion     render the Ad composition → out/ad-1080p.mp4
#   4. ffmpeg       deliver: final-1080p.mp4, final-master.mov, poster jpg
#   5. verify       duration, resolution, and — critically — that audio exists
#
# Step 5 checks for audio explicitly because Remotion will happily render a SILENT
# video when the audio file is missing rather than failing. A silent ad is a bug that
# does not announce itself, so we assert on it here.
#
# Env: passes through to the stages — MESSY_START, CLEAN_START, RELAXED_START,
#      SKIP_GRADE, FORCE.

set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPTS="$ROOT/scripts"
OUT="$ROOT/out"
FOOT="$ROOT/public/footage"
MUSIC="$ROOT/public/music/track.mp3"

TOTAL_SECONDS=60.0
WIDTH=1920
HEIGHT=1080
FPS=30

RENDERED="$OUT/ad-1080p.mp4"
FINAL="$OUT/final-1080p.mp4"
MASTER="$OUT/final-master.mov"
POSTER="$OUT/final-1080p.jpg"

log()  { printf '\n[assemble] %s\n' "$*" >&2; }
ok()   { printf '[assemble] ✓ %s\n' "$*" >&2; }
warn() { printf '[assemble] WARNING: %s\n' "$*" >&2; }
die()  { printf '\n[assemble] ERROR: %s\n' "$*" >&2; exit 1; }

command -v ffmpeg  >/dev/null 2>&1 || die "ffmpeg not found"
command -v ffprobe >/dev/null 2>&1 || die "ffprobe not found"
[[ -f "$ROOT/package.json" ]] || die "package.json not found — is the project root correct?"

mkdir -p "$OUT"

# `csv=p=0` can emit trailing delimiters depending on which entries exist, which broke
# a `== "1920"` comparison and aborted a good render. `default=noprint_wrappers=1:nokey=1`
# plus an explicit strip is unambiguous; use `probe` for every scalar read.
probe()   { ffprobe -v error -select_streams "$1" -show_entries "$2" -of default=noprint_wrappers=1:nokey=1 "$3" 2>/dev/null | head -n1 | tr -d '[:space:],'; }
dur_of()  { ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$1" 2>/dev/null | head -n1 | tr -d '[:space:],'; }
n_audio() { ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$1" 2>/dev/null | grep -c . || true; }

# ── 1. conform (also fills any missing slot with a placeholder) ────────────────
log "1/5  conforming footage"
bash "$SCRIPTS/conform.sh"

# ── 2. music ───────────────────────────────────────────────────────────────────
log "2/5  preparing the music bed"
bash "$SCRIPTS/music.sh"

# ── 3. pre-flight: never start a 4-minute render on broken inputs ──────────────
log "3/5  pre-flight checks"
for slot in messy-room clean-room relaxed; do
  f="$FOOT/$slot.mp4"
  [[ -f "$f" ]] || die "missing $f — conform.sh should have created this"
  d="$(dur_of "$f")"
  a="$(n_audio "$f")"
  [[ "$a" -eq 0 ]] || warn "$slot.mp4 has an audio stream; it will be ignored by the composition"
  ok "$slot.mp4 present (${d}s)"
done
[[ -f "$MUSIC" ]] || die "missing $MUSIC — run: npm run music"
ok "music bed present ($(dur_of "$MUSIC")s)"

# ── 4. render ─────────────────────────────────────────────────────────────────
log "4/5  rendering the Ad composition (this is the slow step — a few minutes)"
log "     1920x1080 · 30fps · 1800 frames · crf 16 from remotion.config.ts"

if ! (cd "$ROOT" && npx remotion render src/index.ts Ad "$RENDERED"); then
  die "the Remotion render failed. Nothing was overwritten.
       Most common cause: the 'Ad' composition or its imports have an error.
       Check with:  cd $ROOT && npm run typecheck
       Preview with: npm run studio"
fi

[[ -f "$RENDERED" ]] || die "render reported success but $RENDERED does not exist"

# ── 5. verify the render, then deliver ────────────────────────────────────────
log "5/5  verifying and packaging"

rd="$(dur_of "$RENDERED")"
rw="$(probe v:0 stream=width "$RENDERED")"
rh="$(probe v:0 stream=height "$RENDERED")"
ra="$(n_audio "$RENDERED")"

if ! awk -v d="$rd" -v w="$TOTAL_SECONDS" 'BEGIN{exit !(d > w-0.1 && d < w+0.1)}'; then
  die "rendered duration is ${rd}s, expected ~${TOTAL_SECONDS}s.
       The beat boundaries in src/timeline.ts may not add up to TOTAL_FRAMES."
fi
[[ "$rw" == "$WIDTH" && "$rh" == "$HEIGHT" ]] || die "rendered at ${rw}x${rh}, expected ${WIDTH}x${HEIGHT}"

if [[ "$ra" -eq 0 ]]; then
  die "the render has NO AUDIO STREAM.
       Remotion renders silent rather than failing when an audio file is missing.
       Check that $MUSIC exists and is a valid audio file:
         ffprobe '$MUSIC'
         npm run music"
fi

ok "render verified: ${rw}x${rh}, ${rd}s, $ra audio stream(s)"

log "packaging deliveries"

# Delivery master for web/social
ffmpeg -y -hide_banner -loglevel error -i "$RENDERED" \
  -c:v libx264 -profile:v high -level 4.1 -preset slow -crf 18 -pix_fmt yuv420p \
  -r "$FPS" -fps_mode cfr \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -movflags +faststart \
  "$FINAL" || die "failed to write $FINAL"

# Visually lossless archival master
ffmpeg -y -hide_banner -loglevel error -i "$RENDERED" \
  -c:v prores_ks -profile:v 3 -pix_fmt yuv422p10le \
  -c:a pcm_s16le -ar 48000 -ac 2 \
  "$MASTER" || die "failed to write $MASTER"

# Poster frame for a video thumbnail.
# 2.5 s is chosen deliberately: it lands on the opening notification stack, which is a
# strong, intriguing thumbnail AND is fully Remotion-rendered — so the poster is usable
# today rather than being a shot of a placeholder slate. Revisit once real footage lands.
ffmpeg -y -hide_banner -loglevel error -ss 2.5 -i "$RENDERED" \
  -frames:v 1 -q:v 2 "$POSTER" || warn "could not write the poster frame"

fd="$(dur_of "$FINAL")"
fa="$(n_audio "$FINAL")"
fsize="$(du -h "$FINAL" | cut -f1)"
msize="$(du -h "$MASTER" | cut -f1)"

printf '\n' >&2
printf '════════════════════════════════════════════════════════════════════\n' >&2
printf ' DONE\n' >&2
printf '════════════════════════════════════════════════════════════════════\n' >&2
printf '  delivery master   %s\n' "${FINAL#$ROOT/}   ($fsize, ${fd}s, $fa audio stream(s))" >&2
printf '  archival master   %s\n' "${MASTER#$ROOT/}   ($msize, ProRes 422 HQ)" >&2
printf '  poster frame      %s\n' "${POSTER#$ROOT/}" >&2
printf '  render            %s\n' "${RENDERED#$ROOT/}   (crf 16, from Remotion)" >&2
printf '\n' >&2
printf '  %s\n' "Duration ${fd}s · ${WIDTH}x${HEIGHT} · ${FPS}fps · audio at -14 LUFS" >&2
printf '════════════════════════════════════════════════════════════════════\n' >&2
