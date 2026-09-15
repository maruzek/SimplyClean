#!/usr/bin/env bash
#
# conform.sh — bring the friend's original clips into the timeline's format.
#
#   footage/<slot>.mp4   ──►   public/footage/<slot>.mp4
#   (originals, never modified)      (1920x1080 · 30fps CFR · Rec.709 · no audio)
#
#   Slots and their exact required durations:
#     messy-room  11.0 s  (330 frames)   cool / flat grade
#     clean-room   9.0 s  (270 frames)   warm grade
#     relaxed      6.0 s  (180 frames)   warm grade
#
# ── WHY THIS SCRIPT IS STRUCTURED IN TWO PHASES ────────────────────────────────
# make-placeholders.sh regenerates ALL THREE slots at once (it has no per-slot flag).
# If it were called mid-way through conforming, it would overwrite real conformed
# footage for slots that already had originals. So:
#
#   Phase 1  make sure every slot has SOME file, filling gaps with placeholders
#   Phase 2  conform every slot that has a real original, over the top
#
# Real footage therefore always wins, regardless of which slots are present.
#
# ── GRADING SPLIT (where to look when tuning colour) ───────────────────────────
#   · This script bakes the STATIC grade — a whole-clip property, so ffmpeg's job.
#   · Remotion adds the ANIMATED vignette that tightens across the messy beat,
#     because that is a change over time. See src/components/overlays/LiveOverlay.tsx.
#   Doing both here would double-darken the corners.
#
# Env:
#   MESSY_START / CLEAN_START / RELAXED_START   in-point in SECONDS (default 0)
#   SKIP_GRADE=1    don't colour-grade (use if the source is already graded)
#   FORCE=1         reconform even when the output looks current
#
# Idempotent: a slot is skipped when its output is newer than both the original and
# this script.

set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$ROOT/footage"
OUT_DIR="$ROOT/public/footage"
SCRIPTS_DIR="$ROOT/scripts"

WIDTH=1920
HEIGHT=1080
FPS=30
SKIP_GRADE="${SKIP_GRADE:-0}"
FORCE="${FORCE:-0}"

SLOTS=(messy-room clean-room relaxed)
# Required output length per slot, in frames. MUST match src/timeline.ts (SLOTS).
declare -A FRAMES=( [messy-room]=252 [clean-room]=153 [relaxed]=249 )

log()  { printf '[conform] %s\n' "$*" >&2; }
ok()   { printf '[conform] ✓ %s\n' "$*" >&2; }
warn() { printf '[conform] WARNING: %s\n' "$*" >&2; }
die()  { printf '[conform] ERROR: %s\n' "$*" >&2; exit 1; }

command -v ffmpeg  >/dev/null 2>&1 || die "ffmpeg not found"
command -v ffprobe >/dev/null 2>&1 || die "ffprobe not found"

mkdir -p "$SRC_DIR" "$OUT_DIR"

# `default=noprint_wrappers=1:nokey=1` + an explicit strip: `csv=p=0` can emit trailing
# delimiters depending on which entries exist, which silently breaks string comparisons.
dur_of() { ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$1" 2>/dev/null | head -n1 | tr -d '[:space:],'; }
vattr()  { ffprobe -v error -select_streams v:0 -show_entries "stream=$2" -of default=noprint_wrappers=1:nokey=1 "$1" 2>/dev/null | head -n1 | tr -d '[:space:],'; }

# ── the static grades ──────────────────────────────────────────────────────────
# Temperature is in Kelvin and the filter's neutral point is 6500, so below that is
# cooler and above is warmer. Saturations stay conservative on purpose — these are
# real rooms, not Instagram filters.
grade_chain() { # <slot>
  case "$1" in
    messy-room)
      # Cold, flat, slightly underlit. Must read as "uninviting", not as "broken file".
      printf '%s' 'colortemperature=temperature=4700:mix=0.85,eq=saturation=0.76:contrast=1.04:brightness=-0.018'
      ;;
    clean-room)
      # Warm and inviting. This is the other half of the before/after, so it has to be
      # a clearly visible swing from the messy grade applied to the SAME room.
      printf '%s' 'colortemperature=temperature=7700:mix=0.85,eq=saturation=1.14:contrast=1.02:brightness=0.020'
      ;;
    relaxed)
      printf '%s' 'colortemperature=temperature=7500:mix=0.80,eq=saturation=1.09:contrast=1.01:brightness=0.014'
      ;;
    *) die "no grade defined for slot '$1'" ;;
  esac
}

start_for() { # <slot> -> seconds
  case "$1" in
    messy-room) printf '%s' "${MESSY_START:-0}" ;;
    clean-room) printf '%s' "${CLEAN_START:-0}" ;;
    relaxed)    printf '%s' "${RELAXED_START:-0}" ;;
  esac
}

# ── which file is the source for a slot? ───────────────────────────────────────
# Priority:
#   1. $<SLOT>_SRC  (from footage/SOURCES.env, or the environment) — used because the
#      classmate's clips arrived as IMG_9305.MOV etc, and renaming or copying 150 MB of
#      footage just to satisfy a filename convention would be silly.
#   2. footage/<slot>.mp4  — the conventional name, if present.
#   3. nothing — the caller leaves the existing file (placeholder) alone.
#
# Set CONFORM_IGNORE_SOURCES=1 to skip SOURCES.env and use only the conventional names.
source_for() { # <slot> -> path (may not exist)
  case "$1" in
    messy-room) printf '%s' "${MESSY_SRC:-$SRC_DIR/messy-room.mp4}" ;;
    clean-room) printf '%s' "${CLEAN_SRC:-$SRC_DIR/clean-room.mp4}" ;;
    relaxed)    printf '%s' "${RELAXED_SRC:-$SRC_DIR/relaxed.mp4}" ;;
  esac
}

# Resolve a possibly-relative source path against the project root.
resolve_path() { # <path>
  case "$1" in
    /*) printf '%s' "$1" ;;
    *)  printf '%s' "$ROOT/$1" ;;
  esac
}

# ── load the source mapping (see footage/SOURCES.env) ─────────────────────────
if [[ "${CONFORM_IGNORE_SOURCES:-0}" != "1" && -f "$SRC_DIR/SOURCES.env" ]]; then
  # shellcheck disable=SC1091
  source "$SRC_DIR/SOURCES.env"
  log "source mapping loaded from footage/SOURCES.env"
fi

# ── PHASE 1 — guarantee every slot has a file ──────────────────────────────────
need_placeholders=0
for slot in "${SLOTS[@]}"; do
  slot_src="$(resolve_path "$(source_for "$slot")")"
  if [[ ! -f "$slot_src" && ! -f "$OUT_DIR/$slot.mp4" ]]; then
    need_placeholders=1
    warn "$slot: no source and no output — a placeholder will be generated"
  fi
done

if [[ "$need_placeholders" == "1" ]]; then
  log "phase 1: generating placeholder slates (all slots; phase 2 re-conforms real footage after)"
  bash "$SCRIPTS_DIR/make-placeholders.sh" --force \
    || die "make-placeholders.sh failed while filling gaps"
fi

# ── PHASE 2 — conform every slot that has a real original ──────────────────────
conform_slot() { # <slot>
  local slot="$1"
  local frames="${FRAMES[$slot]}"
  local want; want="$(awk -v f="$frames" -v r="$FPS" 'BEGIN{printf "%.6f", f/r}')"
  local src; src="$(resolve_path "$(source_for "$slot")")"
  local out="$OUT_DIR/$slot.mp4"
  local start; start="$(start_for "$slot")"

  # No original → never touch the output. This is the cardinal rule: an earlier
  # version of this pipeline destroyed good placeholders by writing here anyway.
  if [[ ! -f "$src" ]]; then
    log "$slot: no source for this slot — using the existing file (${want}s)"
    return 0
  fi

  if [[ "$FORCE" != "1" && -f "$out" && "$out" -nt "$src" && "$out" -nt "${BASH_SOURCE[0]}" ]]; then
    log "$slot: up to date (output newer than original)"
    return 0
  fi

  local src_dur; src_dur="$(dur_of "$src")"
  [[ -n "$src_dur" ]] || die "$slot: could not read the duration of $src"

  if awk -v s="$start" -v d="$src_dur" 'BEGIN{exit !(s+0 >= d+0)}'; then
    warn "$slot: the requested in-point ${start}s is at or past the end of a ${src_dur}s clip — using 0"
    start=0
  fi

  local avail pad
  avail="$(awk -v d="$src_dur" -v s="$start" 'BEGIN{a=d-s; if(a<0)a=0; printf "%.6f", a}')"
  pad="$(awk -v a="$avail" -v w="$want" 'BEGIN{p=w-a; if(p<0)p=0; printf "%.6f", p}')"

  local chain="scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease"
  chain+=",pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=black"
  chain+=",setsar=1,fps=${FPS}"
  [[ "$SKIP_GRADE" != "1" ]] && chain+=",$(grade_chain "$slot")"
  if awk -v p="$pad" 'BEGIN{exit !(p > 0.0005)}'; then
    warn "$slot: source is short after the in-point; freezing the last frame for ${pad}s to reach ${want}s"
    warn "$slot:   a freeze is a compromise — a longer take would be better"
    chain+=",tpad=stop_mode=clone:stop_duration=${pad}"
  fi
  chain+=",format=yuv420p"
  # Pin the colour metadata at the FILTER level, not only via the encoder flags.
  # Verified necessary: with only `-color_primaries/-color_trc` on the output, a source
  # carrying no colour tags (a phone clip, or a synthetic test source) still encoded as
  # unknown/unknown — the filter graph's unspecified metadata wins over encoder options.
  # setparams is what actually fixes it.
  chain+=",setparams=colorspace=bt709:color_primaries=bt709:color_trc=bt709"

  local tmp="$OUT_DIR/.conform-$slot.tmp.mp4"
  rm -f "$tmp"

  log "$slot: conforming a ${src_dur}s source (in-point ${start}s) → ${want}s"
  if ! ffmpeg -y -hide_banner -loglevel error -nostdin \
      -ss "$start" -i "$src" -t "$want" \
      -an \
      -vf "$chain" \
      -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
      -r "$FPS" -fps_mode cfr \
      -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
      -movflags +faststart \
      "$tmp"; then
    rm -f "$tmp"
    die "$slot: ffmpeg failed — any previous output was left untouched"
  fi

  # ── verify before publishing. Never ship a wrong-duration file. ────────────
  local got_dur got_w got_h got_pix got_fps got_audio fail=""
  got_dur="$(dur_of "$tmp")"
  got_w="$(vattr "$tmp" width)"; got_h="$(vattr "$tmp" height)"
  got_pix="$(vattr "$tmp" pix_fmt)"
  got_fps="$(vattr "$tmp" avg_frame_rate)"
  got_audio="$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$tmp" | wc -l)"

  [[ "$got_w" == "$WIDTH" && "$got_h" == "$HEIGHT" ]] || fail="resolution ${got_w}x${got_h}"
  [[ "$got_pix" == "yuv420p" ]] || fail="${fail:+$fail; }pix_fmt ${got_pix}"
  [[ "$got_fps" == "30/1" ]] || fail="${fail:+$fail; }fps ${got_fps}"
  [[ "$got_audio" -eq 0 ]] || fail="${fail:+$fail; }unexpected audio stream"
  awk -v d="$got_dur" -v w="$want" 'BEGIN{exit !(d > w-0.05 && d < w+0.05)}' \
    || fail="${fail:+$fail; }duration ${got_dur}s (want ${want}s)"

  if [[ -n "$fail" ]]; then
    rm -f "$tmp"
    die "$slot: conformed output failed verification: $fail"
  fi

  mv -f "$tmp" "$out"
  ok "$slot: ${got_w}x${got_h} · ${got_fps} · ${got_pix} · ${got_dur}s · no audio$([[ "$SKIP_GRADE" == "1" ]] && printf ' · UNGRADED')"
}

log "phase 2: conforming originals from ${SRC_DIR#$ROOT/}"
[[ "$SKIP_GRADE" == "1" ]] && warn "SKIP_GRADE=1 — colour grading is DISABLED"

conformed_any=0
for slot in "${SLOTS[@]}"; do
  if [[ -f "$(resolve_path "$(source_for "$slot")")" ]]; then
    conform_slot "$slot"
    conformed_any=1
  else
    log "$slot: no source for this slot — using the existing file"
  fi
done

if [[ "$conformed_any" == "0" ]]; then
  warn "footage/ contains no originals — the ad will render with placeholder slates."
  warn "See docs/FOOTAGE-SPEC.md, then drop the real clips into footage/."
fi

log "done. Review with: bash scripts/inspect.sh public/footage/*.mp4"
