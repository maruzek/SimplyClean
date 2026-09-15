# SimplyClean — 60-second advertisement

A 60-second advertisement, built as code.

**Product:** booking-connected turnover cleaning for independent short-term-rental hosts.
**Runtime:** 60.000 s @ 30 fps · 1920×1080 · 16:9 · 1800 frames.
**Cut:** 39.1 s of motion graphics, 20.9 s of live action.

---

## ⚠️ Read this first

**`docs/LEGAL-BRAND-USE.md` — the ad currently renders the real Airbnb and Booking.com
logos, and Airbnb's published trademark terms appear to prohibit how it uses them.** There
is a one-word switch in `src/brand.ts` (`logoMode: 'official' | 'standin'`) that swaps them
for invented stand-ins. This needs your decision before the ad goes anywhere public.

---

## Documents

| Document | What it covers |
|---|---|
| `docs/LEGAL-BRAND-USE.md` | **Start here.** Third-party trademark exposure, quoted from the vendors' own terms, and your options. |
| `docs/REVISION-2.md` | **What changed and why** — the full record from preview to production, including the three things revision 1 got wrong. |
| `docs/SCRIPT.md` | The full 60s script: frame-exact timeline, on-screen copy, music brief. Revision 2, retimed to the real footage. |
| `docs/FOOTAGE-SPEC.md` | What to ask for if more footage is shot. Send the one-paragraph version. |
| `docs/PIPELINE.md` | Why the pipeline is Remotion + ffmpeg, the alternatives, and the licensing position on Remotion itself. |
| `scripts/README.md` | Per-script detail: env vars, guarantees, invocation. |

---

## Quick start

```bash
cd /home/oliver/Projects/turnover-ad

npm install
npm run studio          # live preview — the visual editor
npm run build:final     # conform → music → render → master → deliver
```

Outputs land in `out/`:

| File | Purpose |
|---|---|
| `out/final-1080p.mp4` | **The deliverable.** H.264 High, CRF 18, AAC 192 kbps, faststart. |
| `out/final-master.mov` | ProRes 422 HQ archival master. **Not for sharing** — it is ~1 GB. |
| `out/final-1080p.jpg` | Poster frame for a video thumbnail. |

---

## Where things live

```
src/
├── brand.ts                  ← BRAND NAME, brand colours, AND the logo-mode switch
├── timeline.ts               ← Beat boundaries in frames. Mirrors docs/SCRIPT.md.
├── fonts.ts                  Manrope (display) + Inter (UI)
├── Ad.tsx                    The 60s composition: layers, sequences, transitions
├── Root.tsx                  Composition registry
├── lib/anim.ts               Easing curves, UI-motion helpers, the subpixel fix
├── segments/
│   ├── Hook.tsx              Beat 1 · the two notifications
│   ├── TitleCard.tsx         Beat 3 · title card
│   ├── Connector.tsx         Beat 4 · THE HERO — also exports the shared cards
│   └── Automate.tsx          Beat 6 · automation rule builder
├── components/
│   ├── ui/                   BrowserWindow, ConsentDialog, ConnectorTile, Cursor,
│   │                         PlatformMark, Logos, StandInMarks, Sweep, Rule, TextCard…
│   └── overlays/             Text over live action + the end card + grain

footage/SOURCES.env           ← maps slots → the classmate's original files
incoming/                     ← The classmate's ORIGINAL clips (never modified)
assets/music/                 ← The real track + ATTRIBUTION.txt (read it)
assets/logos/                 ← Real brand glyphs + their CC0 licence
public/                       ← Generated: conformed clips, mastered music, sfx
scripts/                      ← conform · music · make-placeholders · assemble · inspect
out/                          ← Renders
```

---

## Changing the brand

Everything brand-related lives in `src/brand.ts` — name, domain, tagline, CTA, the colour
system, the elevation scale, and the motion tokens. **Nothing else hardcodes the brand name.**

```ts
export const brand = {
  name: 'SimplyClean',
  domain: 'simplyclean.co',
  logoMode: 'official',   // ← or 'standin'. See docs/LEGAL-BRAND-USE.md
};
```

---

## The music

`assets/music/track.mp3` is **"Catalyst" by Scott Buckley**, licensed **CC BY 4.0**.

**Attribution is a legal condition of that licence, not a courtesy.** The exact required
string, from the author:

```
'Catalyst' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au
```

Put that in the description/metadata wherever the ad is published. The author asks for it in
the description rather than in the video, on pain of a Content ID claim. Note his own caveat:
a project that **cannot** carry attribution — a TV advertisement, for instance — is not
covered by CC BY and needs a paid licence.

`assets/music/ATTRIBUTION.txt` records the provenance, the quoted licence, runner-up tracks,
and the sources that were unusable. `scripts/music.sh` masters whatever is in `assets/music/`
to −14 LUFS / −1 dBTP and exactly 60.000 s, applying a 1.6 s fade so the trim does not land on
a hard cut.

---

## Rendering quality

`remotion.config.ts` uses JPEG at quality 100 for speed during iteration. For a final master,
render at 2× and let ffmpeg downscale — Remotion's own quality guidance notes that 1080p
output is soft on HiDPI displays, and supersampling is what makes hairlines and 13px UI text
survive:

```bash
npx remotion render src/index.ts Ad out/ad-4k.mp4 \
  --scale=2 --image-format=png --crf=14 --color-space=bt709 --x264-preset=slow
```

That is roughly 4× the render time of the default 1× pass.

---

## Known gaps

1. **No clean-wide shot.** The delivered clips are (1) the messy flat with frustration,
   (2) a thumbs-up over a clean floor, (3) the host relaxing. Beat 5 therefore lands on a
   *detail* shot rather than a wide reveal. A matched clean wide — same room and angle as
   clip 1 — is the single best thing to ask for next, and would strengthen the before/after
   considerably.
2. **Trademark decision** — see the top of this file.
3. **The property thumbnail** in the mock UI is an abstract illustration. Swapping in a still
   from the real footage would make the UI feel concrete rather than generic.
4. **The "clean" grade** assumes the thumbs-up clip and the messy clip are the same room. They
   are not, so the cool/warm contrast carries more of the before/after than intended.

---

## Licensing

**Remotion** is source-available, not open source. Free for individuals and teams of up to
three people, commercial use included. See `docs/PIPELINE.md`.

**ffmpeg** is LGPL/GPL and already installed.

**Real brand marks** — the artwork in `assets/logos/` is CC0 (Simple Icons), but that licence
covers the *files*, not the trademarks they depict. See `docs/LEGAL-BRAND-USE.md`.

**Music** — CC BY 4.0, attribution required. See above.
