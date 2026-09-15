#!/usr/bin/env bash
# shellcheck shell=bash
# =============================================================================
# lib.sh — shared helpers for the turnover-ad ffmpeg media pipeline.
#
# SOURCED, never executed directly.  Used by:
#   make-placeholders.sh   conform.sh   music.sh   assemble.sh   inspect.sh
#
# Provides: project paths, prefixed logging, ffprobe helpers, media-contract
# assertions, font discovery (with glyph verification) and stamp-based
# idempotency.
#
# Env read here:
#   NO_COLOR           standard: disables ANSI colour in log lines
#   FFMPEG_LOGLEVEL    ffmpeg -loglevel for media commands (default: error)
#   LOG_PREFIX         set by the calling script, e.g. LOG_PREFIX=conform
# =============================================================================

# Sourcing twice must be a no-op (scripts may source this defensively).
if [[ -n "${TURNOVER_LIB_LOADED:-}" ]]; then
  return 0
fi
TURNOVER_LIB_LOADED=1

# -----------------------------------------------------------------------------
# Paths — derived from this file's own location, so every script works from any
# working directory.  These are the fixed-path contract; do not deviate.
# -----------------------------------------------------------------------------
TURNOVER_SCRIPTS_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
TURNOVER_ROOT="$(cd -- "${TURNOVER_SCRIPTS_DIR}/.." && pwd)"

FOOTAGE_DIR="${TURNOVER_ROOT}/footage"
PUBLIC_DIR="${TURNOVER_ROOT}/public"
PUBLIC_FOOTAGE_DIR="${PUBLIC_DIR}/footage"
PUBLIC_MUSIC_DIR="${PUBLIC_DIR}/music"
ASSETS_MUSIC_DIR="${TURNOVER_ROOT}/assets/music"
OUT_DIR="${TURNOVER_ROOT}/out"
STATE_DIR="${TURNOVER_SCRIPTS_DIR}/.state"

MUSIC_OUT="${PUBLIC_MUSIC_DIR}/track.mp3"

# -----------------------------------------------------------------------------
# The media contract
# -----------------------------------------------------------------------------
FPS=30
WIDTH=1920
HEIGHT=1080
PX_FMT="yuv420p"
COLOR_SPACE="bt709"
COLOR_PRIMARIES="bt709"
COLOR_TRC="bt709"

# Duration tolerance when asserting: ~1 frame at 30fps, plus ffprobe rounding.
FRAME_TOLERANCE=0.04

# The finished ad is 1800 frames @ 30fps (docs/SCRIPT.md, src/timeline.ts).
MASTER_SECONDS=60
MASTER_FRAMES=1800

# libx264 only writes the BT.709 primaries/transfer into the bitstream VUI when
# they are passed via -x264-params; the generic -color_primaries/-color_trc
# codec options are accepted but silently dropped by this build (verified with
# ffprobe on ffmpeg n9.0.1).  We pass BOTH: the generic options for the
# container/colr atom, x264-params for the in-bitstream VUI.
X264_COLOR_PARAMS="colorprim=bt709:transfer=bt709:colormatrix=bt709"

# The three live-action slots.  Fixed durations, fixed names.
SLOTS=(messy-room clean-room relaxed)
declare -A SLOT_SECONDS=([messy-room]=11 [clean-room]=9 [relaxed]=6)
declare -A SLOT_FRAMES=([messy-room]=330 [clean-room]=270 [relaxed]=180)
declare -A SLOT_LABEL=(
  [messy-room]="LIVE 1 — MESSY ROOM"
  [clean-room]="LIVE 2 — CLEAN ROOM"
  [relaxed]="LIVE 3 — RELAXED"
)
# Env var that controls the source in-point for each slot.
declare -A SLOT_START_VAR=(
  [messy-room]=MESSY_START
  [clean-room]=CLEAN_START
  [relaxed]=RELAXED_START
)
# Human description used in logs and the final summary.
declare -A SLOT_DESC=(
  [messy-room]="cold / flat / desaturated"
  [clean-room]="warm / lifted / saturated"
  [relaxed]="warm / soft / slight bloom"
)

require_slot() {
  [[ -n "${SLOT_SECONDS[$1]:-}" ]] || die "unknown slot '$1'"
}

# -----------------------------------------------------------------------------
# Logging — everything goes to stderr so stdout stays parseable.
# -----------------------------------------------------------------------------
LOG_PREFIX="${LOG_PREFIX:-pipeline}"

if [[ -t 2 && -z "${NO_COLOR:-}" ]]; then
  C_OFF=$'\033[0m'; C_DIM=$'\033[2m'; C_BOLD=$'\033[1m'
  C_BLUE=$'\033[34m'; C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'; C_RED=$'\033[31m'
else
  C_OFF=''; C_DIM=''; C_BOLD=''; C_BLUE=''; C_GREEN=''; C_YELLOW=''; C_RED=''
fi

log()  { printf '%s%s[%s]%s %s\n' "$C_DIM" "" "$LOG_PREFIX" "$C_OFF" "$*" >&2; }
info() { printf '%s[%s]%s %s\n' "$C_BLUE" "$LOG_PREFIX" "$C_OFF" "$*" >&2; }
ok()   { printf '%s[%s]%s %s\n' "$C_GREEN" "$LOG_PREFIX" "$C_OFF" "$*" >&2; }
warn() { printf '%s[%s] WARNING:%s %s\n' "$C_YELLOW" "$LOG_PREFIX" "$C_OFF" "$*" >&2; }
err()  { printf '%s[%s] ERROR:%s %s\n' "$C_RED" "$LOG_PREFIX" "$C_OFF" "$*" >&2; }
die()  { err "$*"; exit 1; }

# Section banner, for long readable runs.
banner() {
  printf '%s[%s]%s %s%s%s\n' "$C_BLUE" "$LOG_PREFIX" "$C_OFF" "$C_BOLD" "$*" "$C_OFF" >&2
}

have() { command -v "$1" >/dev/null 2>&1; }

require_cmds() {
  local c
  for c in "$@"; do
    have "$c" || die "required command not found on PATH: $c"
  done
}

# ffmpeg wrapper: quiet, non-interactive, always overwrite is the caller's call.
FFMPEG_LOGLEVEL="${FFMPEG_LOGLEVEL:-error}"
FF="ffmpeg -hide_banner -nostdin -loglevel ${FFMPEG_LOGLEVEL}"
FFPROBE="ffprobe -hide_banner -v error"

# -----------------------------------------------------------------------------
# Directory bootstrap
# -----------------------------------------------------------------------------
ensure_dirs() {
  mkdir -p "$PUBLIC_FOOTAGE_DIR" "$PUBLIC_MUSIC_DIR" "$ASSETS_MUSIC_DIR" "$OUT_DIR" "$STATE_DIR"
}

# -----------------------------------------------------------------------------
# ffprobe helpers.  Every one is non-fatal: they print "" if the probe fails.
# -----------------------------------------------------------------------------
ffp() { $FFPROBE "$@"; }

fmt_duration() { # <file> -> seconds, e.g. "11.000000"
  ffp -show_entries format=duration -of default=nw=1:nk=1 "$1" 2>/dev/null | head -1 || true
}

fmt_size_bytes() { # <file> -> bytes
  stat -c '%s' "$1" 2>/dev/null || printf '0'
}

fmt_size() { # <file> -> human
  local b
  b="$(fmt_size_bytes "$1")"
  if have numfmt; then numfmt --to=iec-i --suffix=B "$b" 2>/dev/null || printf '%s B' "$b"
  else printf '%s B' "$b"; fi
}

vattr() { # <file> <stream attribute> -> first video stream value
  ffp -select_streams v:0 -show_entries "stream=$2" -of default=nw=1:nk=1 "$1" 2>/dev/null | head -1 || true
}

aattr() { # <file> <stream attribute> -> first audio stream value
  ffp -select_streams a:0 -show_entries "stream=$2" -of default=nw=1:nk=1 "$1" 2>/dev/null | head -1 || true
}

fattr() { # <file> <format attribute>
  ffp -show_entries "format=$2" -of default=nw=1:nk=1 "$1" 2>/dev/null | head -1 || true
}

stattr() { # <file> <stream attribute> -> all video streams, comma joined
  ffp -select_streams v -show_entries "stream=$2" -of csv=p=0 "$1" 2>/dev/null | paste -sd, - || true
}

count_streams() { # <file> <v|a|s>
  local n
  n="$(ffp -select_streams "$2" -show_entries stream=index -of csv=p=0 "$1" 2>/dev/null | grep -c . || true)"
  printf '%s' "${n:-0}"
}

has_audio() { [[ "$(count_streams "$1" a)" -gt 0 ]]; }

rotation_of() { # <file> -> degrees or "" ; reads the display matrix side data
  local r
  r="$(ffp -select_streams v:0 -show_entries stream_side_data=rotation \
        -of default=nw=1:nk=1 "$1" 2>/dev/null | head -1 || true)"
  if [[ -z "$r" ]]; then
    # Legacy tag form, still emitted by some muxers.
    r="$(ffp -select_streams v:0 -show_entries stream_tags=rotate \
          -of default=nw=1:nk=1 "$1" 2>/dev/null | head -1 || true)"
  fi
  printf '%s' "$r"
}

fps_decimal() { # "30000/1001" -> "29.970"
  awk -F/ '{ if (NF>1 && $2+0 != 0) printf "%.3f", $1/$2; else printf "%.3f", $1+0 }' <<<"${1:-0/1}"
}

# Frame count: trust the container when it tells us, else derive from duration.
frame_count() { # <file>
  local nf dur fr
  nf="$(ffp -select_streams v:0 -show_entries stream=nb_frames -of default=nw=1:nk=1 "$1" 2>/dev/null | head -1 || true)"
  if [[ -n "$nf" && "$nf" != "N/A" && "$nf" =~ ^[0-9]+$ ]]; then printf '%s' "$nf"; return 0; fi
  dur="$(fmt_duration "$1")"; fr="$(vattr "$1" avg_frame_rate)"
  awk -v d="${dur:-0}" -v r="${fr:-0/1}" 'BEGIN{ split(r,a,"/"); f=(a[2]+0>0)?a[1]/a[2]:a[1]; printf "%d", (d*f)+0.5 }'
}

# True when 'moov' precedes 'mdat' in the first megabyte (= +faststart).
# Heuristic byte scan: a container-level check without a second ffprobe pass.
# A temp file is used because a shell variable cannot hold the NUL bytes that
# mp4 boxes contain (that would shift the recorded offsets).
is_faststart() {
  local f="$1" moov mdat tmp
  tmp="$(mktemp "${TMPDIR:-/tmp}/turnover-moov.XXXXXX")"
  head -c 1048576 "$f" >"$tmp" 2>/dev/null || true
  moov="$(LC_ALL=C grep -abo -m1 'moov' "$tmp" 2>/dev/null | head -1 | cut -d: -f1 || true)"
  mdat="$(LC_ALL=C grep -abo -m1 'mdat' "$tmp" 2>/dev/null | head -1 | cut -d: -f1 || true)"
  rm -f -- "$tmp"
  [[ -n "$moov" ]] || return 1
  [[ -z "$mdat" || "$moov" -lt "$mdat" ]]
}

# -----------------------------------------------------------------------------
# Contract assertion.  media_conformant() is the silent predicate used by skip
# logic; assert_conformant() prints the measured evidence and dies on failure.
# Set allow_audio=1 for the Remotion render (which carries audio), 0 for the
# conformed live-action clips (which must be video-only).
# -----------------------------------------------------------------------------
MEDIA_PROBLEM=""

media_conformant() { # <file> <expected_seconds> [allow_audio]
  local f="$1" want="$2" allow_audio="${3:-0}"
  MEDIA_PROBLEM=""
  [[ -f "$f" ]] || { MEDIA_PROBLEM="file does not exist"; return 1; }

  local w h fr pf dur cs cp ct
  w="$(vattr "$f" width)"; h="$(vattr "$f" height)"
  fr="$(vattr "$f" avg_frame_rate)"; pf="$(vattr "$f" pix_fmt)"
  dur="$(fmt_duration "$f")"
  cs="$(vattr "$f" color_space)"; cp="$(vattr "$f" color_primaries)"; ct="$(vattr "$f" color_transfer)"

  [[ "$w" == "$WIDTH" && "$h" == "$HEIGHT" ]] \
    || { MEDIA_PROBLEM="resolution ${w:-?}x${h:-?}, want ${WIDTH}x${HEIGHT}"; return 1; }
  [[ "$(fps_decimal "$fr")" == "$(printf '%.3f' "$FPS")" ]] \
    || { MEDIA_PROBLEM="avg_frame_rate ${fr:-?} (= $(fps_decimal "$fr") fps), want ${FPS} fps"; return 1; }
  [[ "$pf" == "$PX_FMT" ]] \
    || { MEDIA_PROBLEM="pix_fmt '${pf:-none}', want ${PX_FMT}"; return 1; }
  [[ "$cs" == "$COLOR_SPACE" && "$cp" == "$COLOR_PRIMARIES" && "$ct" == "$COLOR_TRC" ]] \
    || { MEDIA_PROBLEM="colour tags '${cs:-none}/${cp:-none}/${ct:-none}', want bt709/bt709/bt709"; return 1; }
  [[ -n "$dur" ]] || { MEDIA_PROBLEM="no container duration"; return 1; }
  awk -v d="$dur" -v w="$want" -v t="$FRAME_TOLERANCE" \
    'BEGIN{ exit !(d > w - t && d < w + t) }' \
    || { MEDIA_PROBLEM="duration ${dur}s, want ${want}s (±${FRAME_TOLERANCE})"; return 1; }
  if [[ "$allow_audio" != "1" ]]; then
    [[ "$(count_streams "$f" a)" -eq 0 ]] || { MEDIA_PROBLEM="has an audio stream, want none"; return 1; }
  fi
  return 0
}

assert_conformant() { # <file> <expected_seconds> [allow_audio]
  local f="$1" want="$2" allow_audio="${3:-0}"
  if ! media_conformant "$f" "$want" "$allow_audio"; then
    err "media contract violated: ${f}"
    err "  ${MEDIA_PROBLEM}"
    err "  refused to continue rather than ship a wrong-duration/format file"
    return 1
  fi
  local w h fr pf dur cs cp ct ct_note
  w="$(vattr "$f" width)"; h="$(vattr "$f" height)"
  fr="$(vattr "$f" avg_frame_rate)"; pf="$(vattr "$f" pix_fmt)"
  dur="$(fmt_duration "$f")"
  cs="$(vattr "$f" color_space)"; cp="$(vattr "$f" color_primaries)"; ct="$(vattr "$f" color_transfer)"
  ok "verified $(basename -- "$f"):"
  log "    resolution : ${w}x${h}"
  log "    fps        : $(fps_decimal "$fr") (avg_frame_rate=${fr})  frames=$(frame_count "$f")"
  log "    pix_fmt    : ${pf}"
  log "    colour     : ${cs}/${cp}/${ct}"
  log "    duration   : $(printf '%.3f' "$dur") s  (want ${want} s)"
  log "    audio      : $(if [[ "$(count_streams "$f" a)" -eq 0 ]]; then printf 'none'; else printf '%s stream(s)' "$(count_streams "$f" a)"; fi)"
  log "    faststart  : $(if is_faststart "$f"; then printf 'yes (moov before mdat)'; else printf 'NOT DETECTED'; fi)"
}

# -----------------------------------------------------------------------------
# Font discovery.  Never hardcode a font path: resolve via fontconfig, verify
# the file exists, and (optionally) verify it actually carries the glyphs we
# are about to draw.
# -----------------------------------------------------------------------------
font_has_glyph() { # <file> <hex codepoint>
  local f="$1" cp="$2"
  have fc-list || return 0            # cannot verify -> do not block
  [[ -n "$(fc-list ":file=${f}:charset=${cp}" file 2>/dev/null)" ]]
}

pick_font() { # <fontconfig pattern> [required-codepoint-hex] [fallback files...]
  local pattern="$1" need="${2:-}"; shift 2 || true
  local f
  if have fc-match; then
    f="$(fc-match -f '%{file}' "$pattern" 2>/dev/null || true)"
    if [[ -n "$f" && -f "$f" ]] && { [[ -z "$need" ]] || font_has_glyph "$f" "$need"; }; then
      printf '%s' "$f"; return 0
    fi
  fi
  for f in "$@"; do
    if [[ -f "$f" ]] && { [[ -z "$need" ]] || font_has_glyph "$f" "$need"; }; then
      printf '%s' "$f"; return 0
    fi
  done
  # Last resort: ask fontconfig for any font that carries the required glyph.
  if have fc-match && [[ -n "$need" ]]; then
    f="$(fc-match -f '%{file}' ":charset=${need}" 2>/dev/null || true)"
    [[ -n "$f" && -f "$f" ]] && { printf '%s' "$f"; return 0; }
  fi
  f="$(find /usr/share/fonts -type f \( -name '*.ttf' -o -name '*.ttc' -o -name '*.otf' \) 2>/dev/null | sort | head -1)"
  [[ -n "$f" ]] && { printf '%s' "$f"; return 0; }
  return 1
}

# Resolve the two fonts the slates need.  U+2014 (em dash) and U+00B7 (middle
# dot) appear in the slate copy, so coverage is verified.
FONT_DISPLAY_BOLD=""
FONT_MONO_BOLD=""
resolve_fonts() {
  local fallbacks_sans=(
    /usr/share/fonts/liberation/LiberationSans-Bold.ttf
    /usr/share/fonts/Adwaita/AdwaitaSans-Regular.ttf
    /usr/share/fonts/TTF/DejaVuSans-Bold.ttf
  )
  local fallbacks_mono=(
    /usr/share/fonts/liberation/LiberationMono-Bold.ttf
    /usr/share/fonts/TTF/DejaVuSansMono-Bold.ttf
    /usr/share/fonts/Adwaita/AdwaitaMono-Bold.ttf
  )
  FONT_DISPLAY_BOLD="$(pick_font 'Liberation Sans:style=Bold' 2014 "${fallbacks_sans[@]}")" \
    || die "no TrueType/OpenType font available for the slate text"
  FONT_MONO_BOLD="$(pick_font 'Liberation Mono:style=Bold' 2014 "${fallbacks_mono[@]}")" \
    || die "no monospace font available for the slate timecode"
  [[ -f "$FONT_DISPLAY_BOLD" ]] || die "font path did not resolve: '$FONT_DISPLAY_BOLD'"
  [[ -f "$FONT_MONO_BOLD" ]] || die "font path did not resolve: '$FONT_MONO_BOLD'"
  log "font display : ${FONT_DISPLAY_BOLD}"
  log "font mono    : ${FONT_MONO_BOLD}"
}

# Escape a value for a drawtext option.  Callers single-quote the value in the
# filtergraph (text='...'), which makes ':' and ',' literal, so only the quote
# terminator and a literal backslash need escaping here.
dt_escape() {
  local s="$1"
  s="${s//\\/\\\\}"
  s="${s//\'/\\\'}"
  printf '%s' "$s"
}

# Emit one drawtext filter clause.  All values are single-quoted so that
# colons/commas in the copy cannot break the filtergraph.
dt_clause() { # <fontfile> <text> <size> <colour> <x> <y> [extra options]
  local font="$1" text="$2" size="$3" colour="$4" x="$5" y="$6" extra="${7:-}"
  printf "drawtext=fontfile=%s:text='%s':fontsize=%s:fontcolor=%s:x=%s:y=%s%s" \
    "$font" "$(dt_escape "$text")" "$size" "$colour" "$x" "$y" "${extra:+:$extra}"
}

# -----------------------------------------------------------------------------
# Idempotency stamps.  A stamp records exactly which inputs/params produced an
# output; when the recorded signature still matches, the work is skipped.
# -----------------------------------------------------------------------------
stamp_path() { printf '%s/%s.stamp' "$STATE_DIR" "$1"; }

stamp_matches() { # <name> <signature>
  local p; p="$(stamp_path "$1")"
  [[ -f "$p" ]] && [[ "$(cat -- "$p" 2>/dev/null)" == "$2" ]]
}

stamp_write() { # <name> <signature>
  ensure_dirs
  printf '%s' "$2" >"$(stamp_path "$1")"
}

stamp_clear() { # <name>
  rm -f -- "$(stamp_path "$1")"
}

# Signature of a script file, so editing a grade invalidates prior outputs.
script_sig() { # <path>
  if have sha256sum; then sha256sum "$1" | cut -c1-16
  else cksum "$1" | cut -d' ' -f1; fi
}

# -----------------------------------------------------------------------------
# Misc
# -----------------------------------------------------------------------------
# Validate a "seconds" env var: non-empty, non-negative, numeric.
validate_start() { # <varname> <value>
  local name="$1" val="$2"
  [[ "$val" =~ ^[0-9]+([.][0-9]+)?$ ]] \
    || die "${name}='${val}' is not a valid non-negative number of seconds"
}

# Does a slot have a real source file in footage/?
slot_source() { # <slot> -> path
  printf '%s/%s.mp4' "$FOOTAGE_DIR" "$1"
}

slot_output() { # <slot> -> path
  printf '%s/%s.mp4' "$PUBLIC_FOOTAGE_DIR" "$1"
}
