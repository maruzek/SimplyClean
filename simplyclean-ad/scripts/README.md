# scripts/

The ffmpeg half of the pipeline. Remotion renders the graphics; these scripts get the
footage and audio into the right shape and package the result.

Run everything through npm (the scripts are also directly invocable).

---

## The one command

```bash
npm run build:final
```

Runs, in order: `conform.sh` → `music.sh` → pre-flight checks → Remotion render →
verify → package deliveries. See `assemble.sh` below.

---

## `assemble.sh` — the entry point

```bash
bash scripts/assemble.sh
npm run build:final
```

| Step | What happens |
|---|---|
| 1 | `conform.sh` — originals → conformed, and any slot with no original gets a placeholder |
| 2 | `music.sh` — 60.0 s bed at −14 LUFS / −1 dBTP |
| 3 | Pre-flight — asserts every input exists, before starting a 4-minute render |
| 4 | `npx remotion render src/index.ts Ad out/ad-1080p.mp4` (crf 16) |
| 5 | Verifies duration/resolution/**audio**, then writes the deliveries and a poster frame |

**Outputs**

| File | Purpose |
|---|---|
| `out/final-1080p.mp4` | **The deliverable.** H.264 High, CRF 18, 20 Mbps-ish, AAC 192 kbps, faststart. |
| `out/final-master.mov` | ProRes 422 HQ + PCM. Visually lossless archival master. |
| `out/final-1080p.jpg` | Poster frame at 3 s, for a video thumbnail. |
| `out/ad-1080p.mp4` | The raw Remotion render, kept for inspection. |

**Step 5 asserts on audio deliberately.** Remotion renders a **silent** video rather than
failing when the audio file is missing. A silent ad is a bug that does not announce
itself, so `assemble.sh` fails loudly if the render has no audio stream.

---

## `conform.sh` — footage into the timeline's format

```bash
npm run conform
bash scripts/conform.sh

MESSY_START=4.5 bash scripts/conform.sh     # pick an in-point 4.5 s into the messy take
SKIP_GRADE=1 bash scripts/conform.sh        # source is already graded
FORCE=1 bash scripts/conform.sh             # reconform even if the output looks current
```

```
footage/<slot>.mp4  ──►  public/footage/<slot>.mp4
(originals, never modified)   (1920x1080 · 30fps CFR · Rec.709 · yuv420p · no audio)
```

| Slot | Duration | Frames | Grade |
|---|---|---|---|
| `messy-room` | 11.0 s | 330 | Cool (4700 K), desaturated, slightly crushed |
| `clean-room` | 9.0 s | 270 | Warm (7700 K), saturated, slightly lifted |
| `relaxed` | 6.0 s | 180 | Warm (7500 K), softer |

**Env**

| Var | Default | Meaning |
|---|---|---|
| `MESSY_START` / `CLEAN_START` / `RELAXED_START` | `0` | In-point in seconds. Use this to pick the best moment from a long take without editing the script. |
| `SKIP_GRADE` | `0` | Set to `1` to skip colour grading. |
| `FORCE` | `0` | Set to `1` to reconform even when the output is newer than the source. |

**Two guarantees worth knowing about**, because both were violated by an earlier version
of this pipeline and both are now covered:

1. **It never writes an output unless a real original exists in `footage/`.** If a slot has
   no original, the existing file is left byte-for-byte alone. (Verified by checksum: run
   `conform.sh` with an empty `footage/` and `md5sum` the outputs before and after.)
2. **It never publishes a file that fails verification.** Conforming writes to a temp file,
   asserts resolution/fps/pix_fmt/duration/absence-of-audio, and only then moves it into
   place. A failure leaves the previous output untouched.

It is structured in two phases because `make-placeholders.sh` regenerates all three slots
at once (it has no per-slot flag). Phase 1 fills gaps with placeholders, phase 2 conforms
real footage over the top — so real footage always wins regardless of which slots exist.

---

## `make-placeholders.sh` — synthetic slates so the project always renders

```bash
npm run placeholders
bash scripts/make-placeholders.sh --force
```

Writes all three `public/footage/*.mp4` files as labelled slates with a running timecode
and frame counter, colour-biased toward their intended grade. This is what lets the full
60 s ad render and be reviewed **today**, before any real footage exists.

`--force` regenerates everything. Without it, a slot is skipped when its existing file is a
valid, up-to-date placeholder — and it **never** overwrites conformed real footage.

---

## `music.sh` — the 60 s bed

```bash
npm run music
MUSIC_SRC=~/Downloads/track.mp3 bash scripts/music.sh
```

- If a track exists in `assets/music/`, it is used.
- If not, a quiet ambient pad is synthesised so the project is never silent.
- Either way it is mastered to **−14 LUFS integrated / −1 dBTP** with two-pass `loudnorm`
  (measure, then apply linearly, which preserves dynamics), resampled to 48 kHz stereo and
  trimmed/padded to exactly **60.000 s**.

`FORCE=1` regenerates.

The ad's music arc lives in `docs/SCRIPT.md` — the track has to *arrive* at 0:14 and
*stop* at 1:00 rather than fade.

---

## `inspect.sh` — the first thing to run on the friend's footage

```bash
npm run inspect                          # everything in footage/
bash scripts/inspect.sh clip.mp4         # specific files
```

Prints resolution, frame rate (nominal **and** average), duration, codec, pix_fmt, colour
tags, audio, and rotation — then flags the things that actually matter for this edit:

- **Variable frame rate** (nominal ≠ average) causes drift and dropped frames. This is the
  single most common problem with phone footage.
- Resolution below 1080p will be upscaled and softened.
- Frame rates that are not a clean fit for a 30 fps timeline.
- Missing colour tags.
- An audio track that will be discarded (expected and harmless).

---

## Notes for anyone editing these scripts

- All are `set -euo pipefail`, quote their variables, and log with a `[name]` prefix.
- All are idempotent; re-running is safe.
- None of them write into `footage/`. That directory is the user's, and originals are
  treated as read-only.
- `lib.sh` is a shared helper library used by `make-placeholders.sh`. My `conform.sh`,
  `music.sh`, `assemble.sh` and `inspect.sh` are deliberately self-contained so each can be
  read and audited on its own — the conform stage runs on irreplaceable footage, so it
  should not need three other files to be understood.
