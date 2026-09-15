# Sharing this project with the team

Everything needed to open, edit and re-render the SimplyClean ad is in this folder. No
editing software to install — the whole video is code, plus ffmpeg.

---

## Get running in about three minutes

```bash
git clone <this-repo-url>
cd SimplyClean/video-ad        # or wherever this folder lands

npm install                    # ~260 packages
npm run studio                 # opens the visual editor in your browser
```

`npm run studio` is the important one. It opens every scene in a browser timeline where you
can scrub frame by frame, change a value, and see it immediately. It is the equivalent of an
NLE, except the timeline is React.

To produce an actual file:

```bash
npm run build:final            # the full 60s, ~4 minutes on 8 cores
```

---

## What you need installed

| Tool | Why | Check |
|---|---|---|
| **Node.js 20+** (26 used here) | runs Remotion | `node -v` |
| **ffmpeg + ffprobe** | conforming, grading, audio mastering, encoding | `ffmpeg -version` |

That's it. Remotion downloads its own headless Chrome on the first render.

---

## What is and isn't in this repo

**Included — everything needed to edit and render:**

```
src/                     the entire video, as React components
docs/                    the script, the reasoning, the legal notes
scripts/                 the ffmpeg pipeline
assets/music/            the soundtrack + its licence and attribution
assets/logos/            brand glyphs + their licence
public/footage/          the conformed, graded live-action clips   (~14 MB)
public/music/            the mastered 60s soundtrack                (1.4 MB)
public/sfx/              the CC0 UI sound effects                   (0.4 MB)
```

**Not included, on purpose:**

| Excluded | Size | Why | What to do if you need it |
|---|---|---|---|
| `out/` | ~1.2 GB | Regenerable renders. GitHub also rejects any file over 100 MB, and the ProRes master is ~995 MB. | `npm run build:final` |
| `node_modules/` | — | Regenerable | `npm install` |
| `incoming/` | 146 MB | Raw camera originals — an identifiable person in their own home, and one file is right at GitHub's 100 MB limit. | Ask; see below |

**The important consequence:** because the *conformed* clips are committed, you can open
Studio, change anything, and re-render **without** the raw camera files. You only need those
to re-run the conform stage from scratch — a different in-point, or a different colour grade.

```bash
# if you ever DO get the raw files, drop them in incoming/ and:
npm run conform
```

---

## Where to change things

Nine times out of ten, what you want is one of these:

| You want to change… | Edit |
|---|---|
| The company name, domain, tagline, CTA | `src/brand.ts` |
| **Any** colour, shadow or motion timing | `src/brand.ts` |
| How long a beat lasts | `src/timeline.ts` |
| The on-screen copy over the live-action footage | `src/components/overlays/LiveOverlay.tsx` |
| The end card | `src/components/overlays/EndCard.tsx` |
| The connector/product demo | `src/segments/Connector.tsx` |
| The automation beat | `src/segments/Automate.tsx` |
| Anything about the music pipeline | `scripts/music.sh` |

**`src/brand.ts` is the single source of truth for the brand.** Nothing else hardcodes the
company name — that was a deliberate constraint, so rebranding never means hunting through
components.

Preview any single beat as its own composition, rather than the whole 60 seconds:

```bash
npm run studio                          # pick SegmentConnector from the sidebar
npx remotion render src/index.ts SegmentConnector out/connector.mp4
```

---

## Before you render, run this

```bash
npm run typecheck
```

Four minutes of render is a silly way to discover a typo.

---

## Two things you must not break

### 1. The music attribution is a legal condition

`assets/music/track.mp3` is **"Catalyst" by Scott Buckley**, licensed **CC BY 4.0**. That
licence requires credit. Wherever the ad is published, include:

```
'Catalyst' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au
```

The author asks for it in the video *description*, not the video itself, or a Content ID
claim follows. Note his caveat: a project that cannot carry attribution — TV advertising, for
instance — is **not** covered by CC BY and needs a paid licence. See
`assets/music/ATTRIBUTION.txt` for provenance, runner-up tracks, and how to swap it.

### 2. The Airbnb and Booking.com logos are a legal question, not a design choice

**`docs/LEGAL-BRAND-USE.md`.** The ad currently renders the real Airbnb and Booking.com
marks. Airbnb's published trademark terms appear to prohibit exactly how it uses them — the
Bélo, the Rausch colour, the name in a headline, and implied endorsement, in a commercial
advertisement.

There is a one-word switch in `src/brand.ts`:

```ts
logoMode: 'official',   // real marks — legally exposed
logoMode: 'standin',    // invented "StayNest" / "RoomBook" — no exposure, same story
```

Both are implemented and render correctly. **Do not publish publicly on `'official'` without
someone owning that decision.**

---

## How the pipeline fits together

```
incoming/*.MOV          raw camera files (not in this repo)
      │
      ▼  scripts/conform.sh      auto-rotate · 30fps CFR · 1080p · Rec.709 · grade · strip audio
public/footage/*.mp4    ← committed, so you can skip everything above
      │
      ▼  src/Ad.tsx              Remotion composites footage + graphics + sound
out/ad-1080p.mp4
      │
      ▼  scripts/assemble.sh     master audio · encode · package
out/final-1080p.mp4
```

| Command | What it does |
|---|---|
| `npm run studio` | the visual editor |
| `npm run typecheck` | catch errors before a render |
| `npm run build:final` | full 60s render + package (~4 min) |
| `npm run build:hq` | **2× supersampled** master — the final-delivery path (~13 min) |
| `npm run still -- Ad out/f.png --frame=900` | one frame; fastest way to check layout |
| `npm run inspect` | technical report on any media file |
| `npm run conform` / `music` / `placeholders` | individual pipeline stages |

### How the editing actually works here

Two habits that make this fast, both learned the hard way:

1. **Render one frame, not the video.** `npm run still -- SegmentConnector out/f.png --frame=200`
   is a two-second feedback loop. Use it constantly while moving things around.
2. **Frame-step anything that morphs.** A transition or a state change that snaps instead of
   animating is invisible at 1× and obvious frame by frame. In mpv: `.` and `,`.

One warning worth knowing: **cursor coordinates are measured, not derived.** The two
hardcoded targets in `src/segments/Connector.tsx` (`LAYOUT.tile`, `LAYOUT.primary`) were
obtained by rendering a specific frame and measuring pixels. If you resize the tiles, change
the window chrome, or alter the empty-state padding, the cursor will click thin air. Re-render
`--frame=172` (the tile) and `--frame=280` (the button) and re-measure.

---

## Read next

| Document | Why |
|---|---|
| `docs/REVISION-2.md` | What changed and why, including three things an earlier version got wrong |
| `docs/SCRIPT.md` | The full script: frame-exact timeline, all copy, the music brief |
| `docs/LEGAL-BRAND-USE.md` | **Before publishing.** Trademark exposure, quoted from the vendors' own terms |
| `docs/PIPELINE.md` | Why Remotion + ffmpeg rather than a video editor, and Remotion's own licence |
| `README.md` | Project orientation and known gaps |
