#!/usr/bin/env bash
# =============================================================================
# make-placeholders.sh — synthesise the three conformed live-action clips.
#
# Purpose
#   The Remotion timeline expects three live-action files to exist at fixed
#   paths with fixed durations, whether or not the real footage has arrived.
#   This script generates a labelled, animated slate for each slot so the whole
#   60 s ad renders end to end today, and so a human reviewing a render can see
#   instantly which shots are still placeholders.
#
#   Each slate carries the slot label, the filename and duration, and a running
#   timecode (HH:MM:SS:FF at 30 fps) so timing can be checked frame-accurately.
#   Slates are colour-biased to preview the intended grade: the messy slot is
#   cool and desaturated, the clean and relaxed slots are warm.
#
# Writes
#   public/footage/messy-room.mp4   11.0 s  330 frames
#   public/footage/clean-room.mp4    9.0 s  270 frames
#   public/footage/relaxed.mp4       6.0 s  180 frames
#   All: 1920x1080, 30 fps CFR, yuv420p, bt709, H.264, no audio, +faststart.
#
# Env
#   FORCE=1        regenerate even if the existing placeholder is up to date
#   FFMPEG_LOGLEVEL  ffmpeg log level (default: error)
#
# CLI
#   --force        same as FORCE=1
#
# Idempotent
#   Skips a slot when the existing file is a valid, up-to-date placeholder.
#   NEVER overwrites a file that was not produced by this script (i.e. real
#   conformed footage is left alone unless --force is given).
# =============================================================================
set -euo pipefail

LOG_PREFIX=placeholders
# shellcheck source=lib.sh
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

SELF="${TURNOVER_SCRIPTS_DIR}/make-placeholders.sh"
SELF_SIG="$(script_sig "$SELF")"
MARKER_NS="turnover-placeholder:v1"

FORCE="${FORCE:-0}"
for arg in "$@"; do
  case "$arg" in
    -f|--force) FORCE=1 ;;
    -h|--help) sed -n '2,32p' "$SELF"; exit 0 ;;
    *) die "unknown argument: $arg (try --help)" ;;
  esac
done

require_cmds ffmpeg ffprobe
ensure_dirs
resolve_fonts

# -----------------------------------------------------------------------------
# Placeholder identity: how we know a file on disk came from this script.
# Two independent records, so a wiped .state directory cannot cause real footage
# to be overwritten:
#   1. an mp4 'comment' tag written into the file itself
#   2. a marker file recording size/mtime/script-hash
# -----------------------------------------------------------------------------
marker_file() { printf '%s/placeholder-%s.info' "$STATE_DIR" "$1"; }

marker_record() { # <slot> <file>
  printf '%s:%s:%s' "$(fmt_size_bytes "$2")" "$(stat -c '%Y' "$2")" "$SELF_SIG"
}

# Echoes one of: current | stale | foreign
placeholder_state() { # <slot>
  local slot="$1" f; f="$(slot_output "$slot")"
  [[ -f "$f" ]] || { printf 'foreign'; return 0; }

  local comment mf rec
  comment="$(ffp -show_entries format_tags=comment -of default=nw=1:nk=1 "$f" 2>/dev/null | head -1 || true)"
  mf="$(marker_file "$slot")"
  rec=""
  [[ -f "$mf" ]] && rec="$(cat -- "$mf" 2>/dev/null || true)"

  if [[ "$comment" == *"${MARKER_NS}:${slot}:"* ]]; then
    [[ "$comment" == *":${SELF_SIG}" ]] && { printf 'current'; return 0; }
    printf 'stale'; return 0
  fi
  if [[ -n "$rec" ]]; then
    if [[ "$rec" == "$(marker_record "$slot" "$f")" ]]; then printf 'current'; return 0; fi
    # Same size+mtime means untouched since we wrote it -> ours, just old.
    if [[ "${rec%:*}" == "$(fmt_size_bytes "$f"):$(stat -c '%Y' "$f")" ]]; then printf 'stale'; return 0; fi
  fi
  printf 'foreign'
}

# -----------------------------------------------------------------------------
# Slate design
# -----------------------------------------------------------------------------
# Per-slot palette, so the background and the copy stay in step.
# Echoes: c0 c1 c2 label accent muted timecode temperature
slot_palette() { # <slot>
  case "$1" in
    messy-room) # cool, desaturated, darker
      printf '%s' '0x0A1218 0x15242E 0x1D3038 0xDCE6EC 0x6FA8C0 0x8FA3AE 0x9FD4E8 8600' ;;
    clean-room) # warm, inviting
      printf '%s' '0x1B120C 0x2B1D12 0x3B2A19 0xF4E8D8 0xD9A05B 0xC0A98F 0xF2CF96 5800' ;;
    relaxed)    # warm, softer and a touch lighter
      printf '%s' '0x20160F 0x332315 0x46331F 0xF7EDDD 0xE0B173 0xCBB49A 0xF5D8A6 6000' ;;
    *) die "unknown slot: $1" ;;
  esac
}

# The lavfi background source: a slowly rotating multi-stop gradient.  Muted and
# dark, obviously synthetic, but not a rainbow test pattern.
build_background_source() { # <slot>
  local slot="$1" sec="${SLOT_SECONDS[$slot]}"
  local c0 c1 c2 _l _a _m _t temp
  read -r c0 c1 c2 _l _a _m _t temp <<<"$(slot_palette "$slot")"
  # nb_colors blends c0->c1->c2; speed rotates it very slowly for visible motion.
  printf 'gradients=s=%sx%s:r=%s:c0=%s:c1=%s:c2=%s:nb_colors=3:type=linear:speed=0.045:d=%s' \
    "$WIDTH" "$HEIGHT" "$FPS" "$c0" "$c1" "$c2" "$sec"
}

# Build the -vf chain applied to that background.
build_slate_filter() { # <slot>
  local slot="$1"
  local sec="${SLOT_SECONDS[$slot]}" frames="${SLOT_FRAMES[$slot]}" label="${SLOT_LABEL[$slot]}"
  local c0 c1 c2 col_label col_accent col_muted col_tc temp
  read -r c0 c1 c2 col_label col_accent col_muted col_tc temp <<<"$(slot_palette "$slot")"

  local f="$FONT_DISPLAY_BOLD" m="$FONT_MONO_BOLD"
  local cx='(w-text_w)/2'
  local secs_txt
  secs_txt="$(printf '%.1f' "$sec")"

  local -a p=()
  # --- background tint + gentle vignette ------------------------------------
  # Mirror the grade target so a reviewer reads the intended temperature at once.
  p+=("colortemperature=temperature=${temp}")
  [[ "$slot" == "messy-room" ]] && p+=("eq=saturation=0.72:brightness=-0.012")
  p+=("vignette=angle=PI/4.6")

  # --- "this is not real footage" badge -------------------------------------
  p+=("$(dt_clause "$f" "PLACEHOLDER — NOT FINAL FOOTAGE" 32 "$col_accent" 80 78 \
        "box=1:boxcolor=0x000000@0.35:boxborderw=16")")

  # --- the big slot label ----------------------------------------------------
  p+=("$(dt_clause "$f" "$label" 92 "$col_label" "$cx" 400)")
  # accent rule under the label
  p+=("drawbox=x=(iw-1240)/2:y=534:w=1240:h=2:color=${col_accent}@0.55:t=fill")

  # --- filename / duration / frame count ------------------------------------
  p+=("$(dt_clause "$f" "${slot}.mp4   ·   ${secs_txt} s   ·   ${frames} frames @ ${FPS} fps" \
        40 "$col_muted" "$cx" 574)")

  # --- running timecode (HH:MM:SS:FF at 30 fps) -----------------------------
  p+=("drawtext=fontfile=${m}:timecode='00\\:00\\:00\\:00':rate=${FPS}:fontsize=76:fontcolor=${col_tc}:x=${cx}:y=660:box=1:boxcolor=0x000000@0.55:boxborderw=22")

  # --- running frame index --------------------------------------------------
  p+=("$(dt_clause "$m" "frame %{n} / $((frames - 1))" 30 "$col_muted" "$cx" 786)")

  # --- footer ---------------------------------------------------------------
  p+=("$(dt_clause "$f" "synthetic slate · scripts/make-placeholders.sh · no real footage in footage/" \
        26 0x6C7A85 80 '(h-84)')")

  p+=("format=${PX_FMT}")
  local IFS=','
  printf '%s' "${p[*]}"
}

# -----------------------------------------------------------------------------
# Generate one slot
# -----------------------------------------------------------------------------
generate_slot() { # <slot>
  local slot="$1"
  require_slot "$slot"
  local sec="${SLOT_SECONDS[$slot]}" frames="${SLOT_FRAMES[$slot]}"
  local out; out="$(slot_output "$slot")"
  local vf; vf="$(build_slate_filter "$slot")"
  local tmp="${out}.tmp.mp4"

  info "generating placeholder ${slot}.mp4 — ${sec}s / ${frames} frames"
  rm -f -- "$tmp"
  # shellcheck disable=SC2086
  if ! $FF -y \
      -f lavfi -i "$(build_background_source "$slot")" \
      -vf "$vf" \
      -frames:v "$frames" -r "$FPS" \
      -c:v libx264 -preset medium -crf 18 -profile:v high -g 60 \
      -x264-params "${X264_COLOR_PARAMS}" \
      -pix_fmt "$PX_FMT" -an \
      -colorspace "$COLOR_SPACE" -color_primaries "$COLOR_PRIMARIES" -color_trc "$COLOR_TRC" \
      -color_range tv \
      -movflags +faststart \
      -metadata comment="${MARKER_NS}:${slot}:${SELF_SIG}" \
      "$tmp"; then
    rm -f -- "$tmp"
    die "ffmpeg failed while generating the ${slot} placeholder"
  fi
  mv -f -- "$tmp" "$out"
  printf '%s' "$(marker_record "$slot" "$out")" >"$(marker_file "$slot")"
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
banner "make-placeholders — synthetic slates for the three live-action slots"

skipped=0
for slot in "${SLOTS[@]}"; do
  out="$(slot_output "$slot")"
  state="$(placeholder_state "$slot")"

  if [[ "$FORCE" != "1" ]] && media_conformant "$out" "${SLOT_SECONDS[$slot]}" 0; then
    case "$state" in
      current)
        ok "keeping ${slot}.mp4 — up-to-date placeholder already present (${MEDIA_PROBLEM:-contract OK})"
        skipped=$((skipped + 1)); continue ;;
      foreign)
        info "keeping ${slot}.mp4 — existing file is not a placeholder (real/conformed media); not touching it"
        skipped=$((skipped + 1)); continue ;;
      stale)
        info "regenerating ${slot}.mp4 — placeholder exists but was made by an older version of this script" ;;
    esac
  elif [[ -f "$out" && "$state" == "foreign" && "$FORCE" != "1" ]]; then
    warn "${slot}.mp4 exists but does not satisfy the contract (${MEDIA_PROBLEM}) and is not a placeholder."
    warn "  run with --force to replace it, or check scripts/inspect.sh output."
    continue
  fi

  generate_slot "$slot"
done

# -----------------------------------------------------------------------------
# Contract assertions — never leave a wrong-duration file behind
# -----------------------------------------------------------------------------
banner "verifying the placeholder contract"
fail=0
for slot in "${SLOTS[@]}"; do
  out="$(slot_output "$slot")"
  assert_conformant "$out" "${SLOT_SECONDS[$slot]}" 0 || fail=1
done
[[ "$fail" -eq 0 ]] || die "one or more placeholders failed the media contract"

if [[ "$skipped" -eq "${#SLOTS[@]}" ]]; then
  ok "all three placeholders already present and valid — nothing to do"
else
  ok "placeholders ready in public/footage/"
fi
