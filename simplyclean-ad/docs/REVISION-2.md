# Revision 2 — what changed, and why

From a working preview to a production cut. This records the decisions, the measurements, and
the things that turned out to be **wrong** in revision 1, so the reasoning is auditable rather
than folklore.

---

## Summary

| | Rev 1 (preview) | Rev 2 (this) |
|---|---|---|
| Brand | `Turnover` (placeholder) | **SimplyClean** |
| Live action | 3 synthetic slates | **3 real 4K iPhone clips**, conformed and graded |
| Beat lengths | 11 / 9 / 6 s (planned) | **8.4 / 5.1 / 8.3 s** (retimed to the footage) |
| Connector hero | 19 s | **22 s** |
| Graphics : live action | 33 s : 27 s | **39.1 s : 20.9 s** |
| Logos | hand-drawn approximations | **real brand glyphs**, CC0-sourced, with a legal review |
| UI motion | springs throughout | **clamped bezier at Material 3 durations** |
| Mock-UI states | 3 | **5** (added loading + connected) |
| Cursor | hand-drawn SVG arrow | **real macOS assets with accurate hotspots** |
| UI sound | none | **4 CC0 effects**, mirrored locally |
| Music | synthesised ambient pad | **"Catalyst" by Scott Buckley** (CC BY 4.0) |
| Delivery | 1× render, 1080p | **2× supersampled master** + 4K delivery |

---

## 1. Rebrand to SimplyClean

`src/brand.ts` is the single source of truth, and that constraint held through the whole build —
nothing else hardcodes the brand name. The rebrand was a few lines plus the package metadata.

Also added to that file, because the rebrand surfaced them: an **elevation scale** (exactly three
steps, never interpolated), a **hairline colour** (see §5.6), and **`dur`/`EASE` motion tokens**.

**Not renamed: the project directory** (`turnover-ad/`). Renaming it would invalidate every path
in every document, so it is a deliberate omission rather than an oversight. It is a one-line
change whenever you want it.

---

## 2. The classmate's footage

### What arrived

Three iPhone `.MOV` files, and the technical inspection turned up three things worth recording:

| | Resolution | FPS nominal → **actual** | Duration |
|---|---|---|---|
| `IMG_9305.MOV` | 2160×3840 + **rotation 90** | 60 → **59.23** | 8.46 s |
| `IMG_9310.MOV` | 2160×3840 + **rotation 90** | 30 → **28.79** | 8.52 s |
| `IMG_9312.mov` | 3840×2160 | 30 → **28.74** | 5.14 s |

1. **Two files are portrait *on disk* but landscape in reality.** `rotation=90` means the stored
   frame is portrait and the display is landscape. A naive check on stored `width`/`height` would
   have concluded "vertical footage, unusable" and sent the work down an AI-generation path for
   no reason. ffmpeg's autorotate handles it; the lesson is to read the rotation side-data, not
   the raw dimensions.
2. **All three are variable frame rate.** Nominal ≠ average on every clip — the classic iPhone
   behaviour, and it causes drift and dropped frames if you cut it directly. `conform.sh` forces
   constant 30 fps.
3. They are 4K, which is a gift: downscaling 4K → 1080p means the delivered 1080p is genuinely
   detailed rather than upscaled.

### The gap nobody mentioned

**There is no clean-wide shot.** The delivered clips are: the messy flat with frustration; a
thumbs-up over a clean floor; the host relaxing against a wall. Your brief's beat 5 was "the room
will be cleaned up" — a wide reveal. What exists is a *detail* shot.

The cut has been built so the detail shot works (the copy is "Done before the next guest.", which
a detail shot carries fine), but the before/after device is weaker than intended. **A matched
clean wide — same room, same camera position as clip 1 — is the single most valuable thing to ask
for next.**

### Conforming

`conform.sh` gained `footage/SOURCES.env`, a slot→file mapping, because renaming or copying
150 MB of camera files to satisfy a filename convention would be silly. It is two-phase by design:
phase 1 fills any missing slot with a placeholder, phase 2 conforms real footage over the top —
so real footage always wins regardless of which slots are present.

**Grades applied in ffmpeg** (static, whole-clip properties): messy pushed cool and flat
(`colortemperature=4700`, saturation 0.76), clean and relaxed warm (`7700` / `7500`, sat 1.14 /
1.09). The *animated* vignette that tightens across the messy beat stays in Remotion, because
that is a change over time. Doing both in one place double-darkens the corners.

### Three real bugs found while doing this

- **Colour tags were silently wrong.** Passing `-color_primaries bt709 -color_trc bt709` on the
  output produced `unknown`/`unknown`, because a filter graph's unspecified colour metadata wins
  over the encoder flags. Fixed with an explicit `setparams` at the end of the filter chain. This
  would have shipped as a subtly mis-tagged master.
- **`ffprobe -of csv=p=0` emits trailing delimiters** depending on which entries exist, which
  broke a `== "1920"` comparison and aborted a *good* render at the packaging step. All scalar
  reads now use `default=noprint_wrappers=1:nokey=1` plus an explicit strip.
- **A conform stage must never write when no source exists.** Revision 1 of the pipeline destroyed
  verified placeholders by conforming test fixtures over them. `conform.sh` now leaves files
  byte-for-byte alone in that case, and that is verified by checksum, not by assertion.

---

## 3. Retiming

The clips are shorter than the plan (8.4 / 5.1 / 8.3 usable vs 11 / 9 / 6 planned), so **the cut
was retimed to the material** rather than the material being stretched to fit the cut. That is the
right way round on any edit.

The freed time went to the connector demo, which is both the part that sells the product and the
part worth more room. Result: **39.1 s of motion graphics, 20.9 s of live action** — a
graphics-led ad, which also matches your stated preference for the Remotion half.

---

## 4. Logos — and a legal finding you should read

You asked for the real logos. They are implemented from the genuine brand glyphs, sourced from
the Simple Icons dataset (CC0), with the authoritative brand colours verified:
**Airbnb `#FF5A5F`**, **Booking.com `#003B95`** (the older `#003580` is legacy).

The research then surfaced something I had to put in front of you rather than quietly ship.
Airbnb's own published trademark terms appear to prohibit four separate things this ad does:
using the Bélo without written permission, featuring the Rausch colour prominently, putting
"Airbnb" in a headline, and implying endorsement — in a commercial advertisement, which their
Newsroom licence explicitly excludes. Booking.com's terms are comparably restrictive.

**Full detail, with quoted sources, in `docs/LEGAL-BRAND-USE.md`.**

The engineering answer is a switch in `src/brand.ts`:

```ts
logoMode: 'official',   // real marks — legally exposed
logoMode: 'standin',    // invented "StayNest" / "RoomBook" — no exposure, same story
```

Both variants are fully implemented and rendered from that one flag. That is your call to make,
not mine; the switch exists so it costs one word either way.

---

## 5. The realism overhaul

This is where the research paid off, and **it caught two mistakes in the version you liked.**

### 5.1 Green checkmarks on consent rows — wrong

A green check is a *success* affordance. Using it on "what we're asking for" reads as
*already granted*, and it is one of the most recognisable mock-UI tells. Real screens use
per-scope checkboxes (Google), expandable chevron rows in a single bordered container (Plaid), or
no per-scope list at all (Stripe).

Now: one bordered container, hairline separators, a chevron per row. The green check is reserved
exclusively for the actual success moment — which consequently lands much harder.

### 5.2 The consent headline was inverted — wrong

Real consent screens put **the app** as the grammatical subject and the provider as the object.
Google: "[App] wants access to your Google Account". Plaid: "[App] uses Plaid to connect your
[thing]". Revision 1 had it backwards — and, incidentally, put a third party's trademark in the
headline position, which is exactly what their guidelines prohibit.

Now: "SimplyClean wants access to your Airbnb account", with the provider's origin
(`airbnb.com`) and a padlock in the header, a trust line immediately above the buttons, and a
single prose disclosure — all lifted from real consent-screen structure.

### 5.3 The tiles were oversized — wrong

244 px wide with a 68 px icon, sized by eye. Now proportioned to the one documented, production
connector tile grid that exists (n8n's credential tile): **176×130, 44 px icon box, 36 px icon,
label below, centred**, with the measured hover (`translateY(-2px)` plus
`0 8px 25px rgba(0,0,0,0.10)`) and a **20 px circular green badge with a white check** for the
connected state. A bare grey text badge does not read as state.

### 5.4 Springs replaced with bezier — motion-graphics vs software

Revision 1 drove almost everything with `spring()`. That was the main reason the UI read as
animation rather than interface. A hover is **6 frames** (200 ms); at 30 fps there is no room for
a spring to resolve.

Now all interface motion is a clamped `Easing.bezier(0.16, 1, 0.3, 1)` at Material 3 durations
(6 / 9 / 12 / 15 frames). Springs survive only on the on-screen text overlays, where a little
personality belongs.

### 5.5 Missing states

The flow jumped from the permission screen straight to the result. Real connector flows have
named **loading** and **connected** views in between. Both are now present, plus a property-list
skeleton — because real networks are not instant, and skipping the wait is why a mockup feels
unreal.

### 5.6 Smaller things that add up

- **Chrome pixel-snapping.** Chrome rounds text baselines to whole pixels during layout, so
  animating text position produces visible stepping. Every animated text node is now promoted
  with `transform: perspective(100px)`. Cheapest big win in the whole revision.
- **Hairlines are near-neutral**, not warm, because H.264 4:2:0 subsamples colour and a saturated
  1 px line smears and shimmers between frames.
- **Tabular figures** on the times, so `11:00` doesn't shuffle width.
- **Two-tone URL** — origin emphasised, path greyed, as Chrome actually renders it.
- **Tab strip with a favicon**, because a window with no tab strip reads as a drawn box.
- **Real macOS cursors** (`@remotion/mac-cursors`) with their true hotspots, and a hand over
  anything clickable. The hotspot data also fixed a positioning error: revision 1's cursor was
  57 px off and clicked the *edge* of the tile.
- **UI sound** — 4 CC0 effects on click, toggle, success and the job chip.
- **The automation modal was rebuilt.** "Want this every time?" with two unlabelled toggles is not
  how any product sets up a recurring task. It is now a real rule builder:
  `When / Guest checks out · Then / Schedule a cleaning · With / Marta`.

---

## 6. Music

**"Catalyst" by Scott Buckley** — instrumental, CC BY 4.0, 320 kbps. Honest caveat recorded by
the researcher: it was selected from the composer's description and measured audio characteristics
rather than by listening to it.

The measured first-60s loudness curve tracks the cue sheet well: −60.9 dBFS at 0–3 s, building
through −35.4, a clear arrival step at −25.6, then the driving body at −22.1.

**Attribution is a licence condition, not a courtesy.** Exact string:

```
'Catalyst' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au
```

The author asks for it in the video *description*, not the video itself, or a Content ID claim
follows. His own stated caveat: a project that **cannot** carry attribution — TV advertising —
is not covered by CC BY and needs a paid licence. Runner-up tracks and all the dead ends
(Pixabay behind Cloudflare, FMA behind a login, Incompetech's browse pages broken server-side)
are recorded in `assets/music/ATTRIBUTION.txt`.

**Two bugs fixed in `music.sh`:**
- It measured loudness across the **whole 4:38 source** and then trimmed to 60 s, producing a
  master ~2 LU quiet. The first minute of this track is a sparse intro, so the full-track average
  was simply the wrong measurement. Now it measures the 60 s excerpt it actually uses:
  **−14.9 LUFS / −1.2 dBTP**.
- A real track rarely ends on our 60 s mark, so trimming left a hard cut. A 1.6 s fade-out was
  added for the real-track path.

---

## 7. Pipeline

`npm run build:final` remains the one command. New:

| Command | What it does |
|---|---|
| `npm run build:hq` | **2× supersampled** master (`scripts/render-hq.sh`) — the final-delivery path |
| `npm run inspect` | human-readable technical report on any media |
| `npm run conform` / `music` / `placeholders` | individual stages |

`render-hq.sh` renders at `--scale=2 --image-format=png --crf=14 --x264-preset=slow`, then
downscales with lanczos. Supersampling is what makes 1 px dividers and 13 px UI labels survive —
Remotion's own quality guidance notes that a native 1080p render is soft on HiDPI. It produces
`final-1080p.mp4`, a `final-4k.mp4` delivery copy, and a poster frame.

One gotcha worth recording: **the Remotion CDN serves an HTML page to non-browser user agents.**
Downloading the CC0 sound effects with plain `curl` silently saved a 404 page as a `.wav`. Use
`curl -A "Mozilla/5.0"`, and always verify a downloaded asset with `file`/`ffprobe`.

---

## 8. Verification performed

Not "it should work" — measured:

- `tsc --noEmit` clean across all 26 source files.
- All 6 compositions register with correct durations (Ad = 1800 frames = 60.00 s).
- Conformed clips verified at **1920×1080, 30/1 CFR, yuv420p, bt709 on all three tags, no audio
  stream, exact durations**.
- Final render verified: **60.053 s, 1920×1080, 30 fps, 1 AAC stream at 48 kHz stereo**.
- Audio actually present and levelled: **mean −17.6 dB, peak −1.2 dB**.
- `conform.sh`'s no-clobber guarantee verified **by md5sum** before and after.
- Grading and cursor alignment verified by rendering specific frames and **measuring pixels**, not
  by eye.

---

## 9. Still open

1. **The trademark decision** — yours, and it needs a human who can accept legal risk.
   `docs/LEGAL-BRAND-USE.md`.
2. **A clean-wide shot** — the best remaining improvement to the *film*, as opposed to the code.
3. **The clean/messy grade contrast** assumes both shots are the same room. They are not, so the
   colour grade is carrying more of the before/after than it should.
4. **The property thumbnail** in the mock UI is an abstract illustration; a still from the real
   footage would make the interface feel concrete.
5. **Broadcast use** would need a paid music licence — CC BY cannot be satisfied on TV.
