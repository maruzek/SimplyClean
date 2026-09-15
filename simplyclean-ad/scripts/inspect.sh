#!/usr/bin/env bash
#
# inspect.sh — human-readable technical report on media files.
#
# Usage:
#   bash scripts/inspect.sh                    # everything in footage/
#   bash scripts/inspect.sh file1.mp4 file2    # specific files
#
# This is the first thing to run when your friend's footage arrives. It answers the
# questions that decide whether the clips will cut together: resolution, frame rate,
# duration, colour tagging, and whether a variable frame rate or a rotation flag is
# going to bite us.

set -uo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ $# -gt 0 ]]; then
  files=("$@")
else
  shopt -s nullglob
  files=("$ROOT"/footage/*)
  shopt -u nullglob
fi

if [[ ${#files[@]} -eq 0 ]]; then
  echo "No files to inspect."
  echo
  echo "  footage/ is empty — waiting for the live-action clips."
  echo "  See docs/FOOTAGE-SPEC.md for what to ask for."
  echo
  echo "  The conformed placeholders currently in public/footage/ will be used"
  echo "  until real footage arrives."
  exit 0
fi

if ! command -v ffprobe >/dev/null 2>&1; then
  echo "ffprobe not found" >&2
  exit 1
fi

field() { # <file> <stream-spec> <entry> [stream-index]
  ffprobe -v error -select_streams "${2}" -show_entries "${3}" -of csv=p=0 "${1}" 2>/dev/null | head -n1
}

human_dur() { # seconds -> H:MM:SS.mmm
  awk -v s="$1" 'BEGIN{
    if (s == "") { print "unknown"; exit }
    h = int(s/3600); m = int((s%3600)/60); sec = s - h*3600 - m*60
    printf "%d:%02d:%06.3f", h, m, sec
  }'
}

printf '\n'
printf '════════════════════════════════════════════════════════════════════\n'
printf ' MEDIA REPORT\n'
printf '════════════════════════════════════════════════════════════════════\n'

for f in "${files[@]}"; do
  if [[ ! -f "$f" ]]; then
    printf '\n▸ %s\n  !! not a file\n' "$f"
    continue
  fi

  name="$(basename "$f")"
  size="$(du -h "$f" | cut -f1)"
  dur="$(field "$f" v:0 format=duration)"
  w="$(field "$f" v:0 stream=width)"
  h="$(field "$f" v:0 stream=height)"
  codec="$(field "$f" v:0 stream=codec_name)"
  pix="$(field "$f" v:0 stream=pix_fmt)"
  rfr="$(field "$f" v:0 stream=r_frame_rate)"
  afr="$(field "$f" v:0 stream=avg_frame_rate)"
  prim="$(field "$f" v:0 stream=color_primaries)"
  trc="$(field "$f" v:0 stream=color_transfer)"
  spc="$(field "$f" v:0 stream=color_space)"
  nbf="$(field "$f" v:0 stream=nb_frames)"
  abitrate="$(field "$f" a:0 stream=bit_rate)"
  asr="$(field "$f" a:0 stream=sample_rate)"
  ach="$(field "$f" a:0 stream=channels)"

  printf '\n▸ %s\n' "$name"
  printf '  %-14s %s  (%s)\n' "size" "$size" "$f"
  printf '  %-14s %s  [%s]\n' "duration" "$(human_dur "$dur")" "${dur}s"
  printf '  %-14s %sx%s   codec %s   pix_fmt %s\n' "video" "$w" "$h" "$codec" "$pix"
  printf '  %-14s nominal %s   average %s\n' "frame rate" "$rfr" "$afr"
  printf '  %-14s frames %s\n' "count" "${nbf:-unknown}"
  printf '  %-14s primaries=%s transfer=%s space=%s\n' "colour" "${prim:-unset}" "${trc:-unset}" "${spc:-unset}"
  if [[ -n "$asr" ]]; then
    printf '  %-14s yes — %s Hz, %s ch, %s bps\n' "audio" "$asr" "$ach" "${abitrate:-unknown}"
  else
    printf '  %-14s none\n' "audio"
  fi

  rot="$(ffprobe -v error -select_streams v:0 -show_entries side_data=rotation -of csv=p=0 "$f" 2>/dev/null | head -n1)"
  [[ -n "$rot" ]] && printf '  %-14s %s (will be handled, but shoot landscape if you can)\n' "rotation" "$rot"

  # ── diagnostics that actually matter for this edit ──────────────────────────
  printf '  %s\n' "checks:"

  if [[ "$w" == "1920" && "$h" == "1080" ]]; then
    printf '    ✓ resolution is native 1920x1080\n'
  elif [[ "$w" -ge 3840 || "$h" -ge 2160 ]] 2>/dev/null; then
    printf '    ✓ resolution is >= 4K — will be downscaled to 1080p (good, gives us room to reframe)\n'
  else
    printf '    ! resolution %sx%s is not 1080p or better — upscaling will soften it\n' "$w" "$h"
  fi

  if [[ "$rfr" != "$afr" ]]; then
    printf '    ! nominal (%s) and average (%s) frame rates differ — likely VARIABLE frame rate.\n' "$rfr" "$afr"
    printf '      This causes audio drift and dropped/duplicated frames. conform.sh will force 30 fps CFR.\n'
  else
    printf '    ✓ constant frame rate (%s)\n' "$rfr"
  fi

  case "$rfr" in
    30/1|30000/1001|25/1|50/1|60/1) printf '    ✓ frame rate is a clean fit for the 30fps timeline\n' ;;
    *) printf '    ! frame rate %s needs conversion to 30fps\n' "$rfr" ;;
  esac

  if [[ -z "$prim" || -z "$trc" ]]; then
    printf '    ! colour tags incomplete — conform.sh will tag Rec.709\n'
  else
    printf '    ✓ colour is tagged\n'
  fi

  if [[ -n "$asr" ]]; then
    printf '    · has audio; the ad uses a music bed only, so it will be stripped\n'
  fi
done

printf '\n────────────────────────────────────────────────────────────────────\n'
printf ' Target format for this edit: 1920x1080 · 30fps CFR · Rec.709 · yuv420p · no audio\n'
printf ' Slot durations: messy-room 11.0s · clean-room 9.0s · relaxed 6.0s\n'
printf '────────────────────────────────────────────────────────────────────\n\n'
