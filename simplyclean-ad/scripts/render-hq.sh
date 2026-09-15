#!/usr/bin/env bash
#
# render-hq.sh — the high-quality master.
#
#   bash scripts/render-hq.sh          (or: npm run build:hq)
#
# Why this exists as a separate path from assemble.sh:
#
#   Remotion's own quality guidance notes that a native 1920x1080 render is soft on HiDPI
#   displays, and that the fix is to raise pixel density via Output Scaling. Rendering the
#   composition at 2x and downscaling to 1080p is supersampling: every hairline, 1px divider
#   and 13px UI label in the mock product interface is resolved with real pixel information
#   instead of being guessed by the rasteriser. This is the single biggest perceived-quality
#   jump available for a UI-heavy ad, and it is what a shipped production Remotion film does.
#
#   It costs roughly 4x the render time of the 1x pass, which is why `assemble.sh` stays the
#   fast iteration path and this is the "final delivery" path.
#
# Produces:
#   out/final-1080p.mp4   the deliverable — supersampled 2x, downscaled with lanczos
#   out/final-4k.mp4      3840x2160 for platforms that accept it
#   out/final-1080p.jpg   poster frame
#
# Prerequisites: `assemble.sh` (or conform.sh + music.sh) must have run, so that the
# conformed footage and the mastered music exist.
#
# Env:
#   SCALE=2            render scale (2 = 4K source for a 1080p comp)
#   IMAGE_FORMAT=png   png | jpeg. png is better for fine UI; jpeg is much faster.
#   CRF=14             x264 quality for the intermediate render
#   PRESET=slow        x264 preset
#   KEEP_INTERMEDIATE=1  keep the 4K intermediate even after downscaling

set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/out"
FOOT="$ROOT/public/footage"
MUSIC="$ROOT/public/music/track.mp3"

SCALE="${SCALE:-2}"
IMAGE_FORMAT="${IMAGE_FORMAT:-png}"
CRF="${CRF:-14}"
PRESET="${PRESET:-slow}"
KEEP_INTERMEDIATE="${KEEP_INTERMEDIATE:-1}"

TOTAL_SECONDS=60.0
WIDTH=1920
HEIGHT=1080
FPS=30

MASTER_4K="$OUT/ad-4k.mp4"
FINAL="$OUT/final-1080p.mp4"
DELIVERY_4K="$OUT/final-4k.mp4"
POSTER="$OUT/final-1080p.jpg"

log()  { printf '\n[hq] %s\n' "$*" >&2; }
ok()   { printf '[hq] ✓ %s\n' "$*" >&2; }
warn() { printf '[hq] WARNING: %s\n' "$*" >&2; }
die()  { printf '\n[hq] ERROR: %s\n' "$*" >&2; exit 1; }

command -v ffmpeg  >/dev/null 2>&1 || die "ffmpeg not found"
command -v ffprobe >/dev/null 2>&1 || die "ffprobe not found"

probe()   { ffprobe -v error -select_streams "$1" -show_entries "$2" -of default=noprint_wrappers=1:nokey=1 "$3" 2>/dev/null | head -n1 | tr -d '[:space:],'; }
dur_of()  { ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$1" 2>/dev/null | head -n1 | tr -d '[:space:],'; }
n_audio() { ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$1" 2>/dev/null | grep -c . || true; }

mkdir -p "$OUT"

# ── pre-flight ────────────────────────────────────────────────────────────────
log "pre-flight"
for slot in messy-room clean-room relaxed; do
  [[ -f "$FOOT/$slot.mp4" ]] || die "missing $FOOT/$slot.mp4 — run: npm run build:final (or npm run conform)"
done
[[ -f "$MUSIC" ]] || die "missing $MUSIC — run: npm run music"
ok "conformed footage and mastered music present"

[[ "$SCALE" =~ ^[0-9]+$ ]] || die "SCALE must be an integer, got '$SCALE'"

RENDER_W=$((WIDTH * SCALE))
RENDER_H=$((HEIGHT * SCALE))

log "rendering the Ad composition at ${SCALE}x → ${RENDER_W}x${RENDER_H}"
log "  image-format=$IMAGE_FORMAT  crf=$CRF  preset=$PRESET"
log "  this is the slow step — roughly $((SCALE * SCALE))x the pixels of a 1x pass"

if ! (cd "$ROOT" && npx remotion render src/index.ts Ad "$MASTER_4K" \
    --scale="$SCALE" \
    --image-format="$IMAGE_FORMAT" \
    --crf="$CRF" \
    --x264-preset="$PRESET" \
    --color-space=bt709 \
    --pixel-format=yuv420p); then
  die "the Remotion render failed. Nothing was overwritten.
       Check with:  cd $ROOT && npm run typecheck
       Preview with: npm run studio"
fi

[[ -f "$MASTER_4K" ]] || die "render reported success but $MASTER_4K does not exist"

mw="$(probe v:0 stream=width "$MASTER_4K")"
mh="$(probe v:0 stream=height "$MASTER_4K")"
md="$(dur_of "$MASTER_4K")"
ma="$(n_audio "$MASTER_4K")"

[[ "$mw" == "$RENDER_W" && "$mh" == "$RENDER_H" ]] \
  || die "intermediate rendered at ${mw}x${mh}, expected ${RENDER_W}x${RENDER_H}"
awk -v d="$md" -v w="$TOTAL_SECONDS" 'BEGIN{exit !(d > w-0.15 && d < w+0.15)}' \
  || die "intermediate duration is ${md}s, expected ~${TOTAL_SECONDS}s"
[[ "$ma" -gt 0 ]] || die "the render has NO AUDIO STREAM.
       Remotion renders silent rather than failing when audio is missing.
       Check: ffprobe '$MUSIC'"

ok "intermediate verified: ${mw}x${mh}, ${md}s, $ma audio stream(s)"

# ── downscale to the delivery master ──────────────────────────────────────────
log "downscaling ${RENDER_W}x${RENDER_H} → ${WIDTH}x${HEIGHT} with lanczos (this is the supersample)"
ffmpeg -y -hide_banner -loglevel error -i "$MASTER_4K" \
  -vf "scale=${WIDTH}:${HEIGHT}:flags=lanczos" \
  -c:v libx264 -profile:v high -level 4.1 -preset "$PRESET" -crf 18 -pix_fmt yuv420p \
  -r "$FPS" -fps_mode cfr \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -movflags +faststart \
  "$FINAL" || die "failed to write $FINAL"

# ── optional 4K delivery ──────────────────────────────────────────────────────
log "writing a 4K delivery copy"
if ffmpeg -y -hide_banner -loglevel error -i "$MASTER_4K" \
  -c:v libx264 -profile:v high -level 5.1 -preset medium -crf 18 -pix_fmt yuv420p \
  -r "$FPS" -fps_mode cfr \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -movflags +faststart \
  "$DELIVERY_4K"; then
  ok "4K delivery written"
else
  warn "could not write the 4K delivery — the 1080p master is unaffected"
fi

# ── poster ────────────────────────────────────────────────────────────────────
# 2.5 s lands on the opening notification stack: a strong thumbnail, and it is entirely
# Remotion-rendered so it does not depend on the live-action footage.
ffmpeg -y -hide_banner -loglevel error -ss 2.5 -i "$MASTER_4K" \
  -frames:v 1 -q:v 2 -vf "scale=${WIDTH}:${HEIGHT}:flags=lanczos" "$POSTER" \
  || warn "could not write the poster frame"

if [[ "$KEEP_INTERMEDIATE" != "1" && -f "$MASTER_4K" ]]; then
  rm -f "$MASTER_4K"
  log "removed the intermediate (KEEP_INTERMEDIATE=0)"
fi

fd="$(dur_of "$FINAL")"
fa="$(n_audio "$FINAL")"
fw="$(probe v:0 stream=width "$FINAL")"
fh="$(probe v:0 stream=height "$FINAL")"

printf '\n' >&2
printf '════════════════════════════════════════════════════════════════════\n' >&2
printf ' HQ MASTER DONE  (%sx supersampled)\n' "$SCALE" >&2
printf '════════════════════════════════════════════════════════════════════\n' >&2
printf '  deliverable     %s  (%s, %sx%s, %ss, %s audio)\n' \
  "${FINAL#$ROOT/}" "$(du -h "$FINAL" | cut -f1)" "$fw" "$fh" "$fd" "$fa" >&2
[[ -f "$DELIVERY_4K" ]] && printf '  4K delivery     %s  (%s)\n' "${DELIVERY_4K#$ROOT/}" "$(du -h "$DELIVERY_4K" | cut -f1)" >&2
printf '  poster frame    %s\n' "${POSTER#$ROOT/}" >&2
printf '  intermediate    %s  (%s)\n' "${MASTER_4K#$ROOT/}" "$(du -h "$MASTER_4K" | cut -f1)" >&2
printf '════════════════════════════════════════════════════════════════════\n' >&2
