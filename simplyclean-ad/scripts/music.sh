#!/usr/bin/env bash
#
# music.sh — produce `public/music/track.mp3`: exactly 60.0 s, 48 kHz stereo,
#            mastered to -14 LUFS integrated / -1 dBTP.
#
# Source selection:
#   1. If a real track exists in `assets/music/` (mp3/wav/m4a/flac/aac/ogg), use it.
#   2. Otherwise synthesise a quiet ambient pad so the project always has audio.
#      Remotion tolerates a MISSING audio file by rendering silent — which is exactly
#      why this script insists on always producing a file. A silent ad is a bug that
#      does not announce itself.
#
# Env vars:
#   FORCE=1        regenerate even if the output looks current
#   MUSIC_SRC=...  use a specific source file
#
# Idempotent: skips when the output is already newer than its source.

set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT/public/music"
OUT="$OUT_DIR/track.mp3"
SRC_DIR="$ROOT/assets/music"

DUR=60.0
TARGET_I=-14
TARGET_TP=-1
TARGET_LRA=11
FORCE="${FORCE:-0}"

log() { printf '[music] %s\n' "$*" >&2; }
warn() { printf '[music] WARNING: %s\n' "$*" >&2; }
die() { printf '[music] ERROR: %s\n' "$*" >&2; exit 1; }

command -v ffmpeg >/dev/null 2>&1 || die "ffmpeg not found"
command -v ffprobe >/dev/null 2>&1 || die "ffprobe not found"

mkdir -p "$OUT_DIR" "$SRC_DIR"

# ── pick a source ──────────────────────────────────────────────────────────────
src=""
if [[ -n "${MUSIC_SRC:-}" ]]; then
  [[ -f "$MUSIC_SRC" ]] || die "MUSIC_SRC is set but not a file: $MUSIC_SRC"
  src="$MUSIC_SRC"
else
  src="$(find "$SRC_DIR" -maxdepth 1 -type f \
    \( -iname '*.mp3' -o -iname '*.wav' -o -iname '*.m4a' \
       -o -iname '*.flac' -o -iname '*.aac' -o -iname '*.ogg' \) \
    2>/dev/null | sort | head -n1 || true)"
fi

# ── idempotency ────────────────────────────────────────────────────────────────
if [[ "$FORCE" != "1" && -f "$OUT" ]]; then
  if [[ -n "$src" && "$OUT" -nt "$src" ]]; then
    log "up to date: ${OUT#$ROOT/} (newer than ${src#$ROOT/})"
    exit 0
  fi
  if [[ -z "$src" && "$OUT" -nt "$ROOT/scripts/music.sh" ]]; then
    log "up to date: ${OUT#$ROOT/} (placeholder, newer than music.sh)"
    exit 0
  fi
fi

# ── resolve the input ──────────────────────────────────────────────────────────
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

if [[ -n "$src" ]]; then
  log "source: ${src#$ROOT/}"
  input="$src"

  src_dur="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src" 2>/dev/null || echo 0)"
  src_has_audio="$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$src" 2>/dev/null | wc -l)"
  [[ "$src_has_audio" -gt 0 ]] || die "supplied track has no audio stream: $src"

  # awk rather than bc, so this works on a minimal system
  if awk -v a="$src_dur" -v b="$DUR" 'BEGIN{exit !(a+0 < b+0)}'; then
    warn "supplied track is only ${src_dur}s — it will be padded with ${DUR}s of silence to reach 60s."
    warn "a track shorter than the runtime will feel like the music stopped early. Send a longer one."
  fi
else
  log "no track in assets/music/ — synthesising a placeholder ambient bed"
  log "  (drop a licensed track into assets/music/ and re-run to replace it)"
  input="$tmp/bed.wav"

  # A soft A-major pad: A2 + E3 + A3 + C#4, slow tremolo, dark low-pass, a little
  # space. Deliberately calm and unobtrusive — it must sit under text, not compete.
  ffmpeg -y -hide_banner -loglevel error \
    -f lavfi -i "sine=frequency=110.00:duration=$DUR" \
    -f lavfi -i "sine=frequency=164.81:duration=$DUR" \
    -f lavfi -i "sine=frequency=220.00:duration=$DUR" \
    -f lavfi -i "sine=frequency=277.18:duration=$DUR" \
    -filter_complex "\
[0:a]volume=0.34[a0];\
[1:a]volume=0.22[a1];\
[2:a]volume=0.15[a2];\
[3:a]volume=0.09[a3];\
[a0][a1][a2][a3]amix=inputs=4:duration=longest:normalize=0[mix];\
[mix]tremolo=f=0.13:d=0.30,\
lowpass=f=850,\
aecho=0.8:0.9:190|410:0.30|0.18,\
afade=t=in:st=0:d=3.5,\
afade=t=out:st=53.5:d=6.5,\
aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[out]" \
    -map "[out]" -c:a pcm_s16le "$input" \
    || die "failed to synthesise the placeholder bed"
fi

# ── two-pass loudness normalisation ────────────────────────────────────────────
# Pass 1 measures. Pass 2 applies the measurement with linear=true, which preserves
# the dynamics rather than compressing them the way a single-pass loudnorm would.
log "pass 1/2: measuring loudness"
# Measure only the 60s EXCERPT we actually use, not the whole source file. Measuring the
# full source and then trimming produced a master ~2 LU quieter than target, because the
# loudness of the first minute is not the loudness of the whole track.
ffmpeg -hide_banner -nostats -t "$DUR" -i "$input" \
  -af "loudnorm=I=$TARGET_I:TP=$TARGET_TP:LRA=$TARGET_LRA:print_format=json" \
  -f null - 2>"$tmp/measure.log" || die "loudness measurement failed"

json="$(sed -n '/^{/,/^}/p' "$tmp/measure.log" || true)"
[[ -n "$json" ]] || die "could not parse loudnorm output; see $tmp/measure.log"

get() {
  printf '%s' "$json" \
    | grep -o "\"$1\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" \
    | head -n1 | sed 's/.*:[[:space:]]*"//; s/"$//'
}

m_i="$(get input_i)"; m_tp="$(get input_tp)"; m_lra="$(get input_lra)"
m_th="$(get input_thresh)"; m_off="$(get target_offset)"

for pair in "input_i:$m_i" "input_tp:$m_tp" "input_lra:$m_lra" "input_thresh:$m_th" "target_offset:$m_off"; do
  name="${pair%%:*}"; val="${pair#*:}"
  [[ -n "$val" ]] || die "loudnorm measurement missing '$name'"
done

log "  measured: I=$m_i LUFS  TP=$m_tp dBTP  LRA=$m_lra"

log "pass 2/2: rendering master to -${TARGET_I#-} LUFS / ${TARGET_TP} dBTP"

# A real track almost never ends exactly on our 60s mark, so trimming it mid-phrase leaves
# an abrupt cut. The ad holds its last frame without fading, so the music needs to arrive
# at silence rather than just stop. The synthesised bed already fades in its own chain.
FADE=""
if [[ -n "$src" ]]; then
  FADE=",afade=t=out:st=$(awk -v d="$DUR" 'BEGIN{printf "%.2f", d-1.6}'):d=1.6"
  log "  applying a 1.6s fade-out so the trim does not land on a hard cut"
fi

ffmpeg -y -hide_banner -loglevel error -i "$input" \
  -af "loudnorm=I=$TARGET_I:TP=$TARGET_TP:LRA=$TARGET_LRA:measured_I=$m_i:measured_TP=$m_tp:measured_LRA=$m_lra:measured_thresh=$m_th:offset=$m_off:linear=true,aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,apad=whole_dur=$DUR,atrim=0:$DUR${FADE}" \
  -c:a libmp3lame -b:a 192k -ar 48000 -ac 2 "$OUT" \
  || die "failed to write $OUT"

# ── verify ─────────────────────────────────────────────────────────────────────
dur="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")"
rate="$(ffprobe -v error -select_streams a:0 -show_entries stream=sample_rate -of csv=p=0 "$OUT")"
ch="$(ffprobe -v error -select_streams a:0 -show_entries stream=channels -of csv=p=0 "$OUT")"

log "wrote ${OUT#$ROOT/}"
log "  duration    : ${dur}s (want $DUR)"
log "  sample rate : ${rate} Hz   channels: $ch"
log "  size        : $(du -h "$OUT" | cut -f1)"

# MP3 carries encoder delay, so a few tens of ms of slack is expected and harmless.
if ! awk -v d="$dur" -v w="$DUR" 'BEGIN{exit !(d > w-0.2 && d < w+0.2)}'; then
  die "output duration ${dur}s is not ~${DUR}s"
fi

log "verify integrated loudness:"
ffmpeg -hide_banner -nostats -i "$OUT" \
  -af "loudnorm=I=$TARGET_I:TP=$TARGET_TP:LRA=$TARGET_LRA:print_format=summary" \
  -f null - 2>&1 | grep -E "Input Integrated|Input True Peak" | sed 's/^/[music]   /' >&2 || true

if [[ -z "$src" ]]; then
  log ""
  log "NOTE: this is a SYNTHESISED placeholder bed, not a real music track."
  log "      See the music brief in docs/SCRIPT.md, then drop the real track into"
  log "      assets/music/ and re-run: npm run music"
fi
