# SimplyClean logo exports

The brand mark from the ad, exported as PNGs for the website, decks and social profiles.

**These are generated, not hand-drawn.** They come from the same `BrandMark` component the
video uses (`src/components/ui/Logos.tsx`), so the logo in the ad and the logo on the site
can never drift apart. Re-render any of them with the commands at the bottom.

---

## The files

| File | Size | Background | Use it for |
|---|---|---|---|
| `simplyclean-mark-1024.png` | 1024×1024 | **transparent** | The default. Site header/footer, app icon source, anywhere you control the background. |
| `simplyclean-mark-512.png` | 512×512 | transparent | Same, but smaller — favicons, avatars, email signatures. |
| `simplyclean-mark-white-1024.png` | 1024×1024 | transparent | Dark backgrounds. All-white; the sparkle is white too. |
| `simplyclean-mark-ink-1024.png` | 1024×1024 | transparent | Single-colour near-black. For print, watermarks, or anywhere colour is unavailable. |
| `simplyclean-mark-1024-on-light.png` | 1024×1024 | **opaque warm off-white** | Platforms that mangle transparency (some social uploaders, some slide tools). |
| `simplyclean-lockup-2048.png` | 2048×512 | transparent | Mark + wordmark, horizontal. Site header, email footer, deck covers. |
| `simplyclean-lockup-white-2048.png` | 2048×512 | transparent | The same lockup, all-white, for dark backgrounds. |

**Mark vs lockup.** The *mark* is the symbol alone — use it where the name is already
visible or space is square. The *lockup* pairs the symbol with the "SimplyClean" wordmark —
use it wherever the brand needs to introduce itself.

---

## What the mark means

Two broken arcs forming a cycle — the **turnover** that repeats with every guest — with a
sparkle at the centre, which is the **clean** that happens in between. The arcs are emerald
and the sparkle is amber, because in the ad those two colours carry the story: amber is an
unresolved problem, emerald is resolution.

---

## Using them

- **Transparent PNGs** drop straight onto any background. All the transparent files carry a
  real alpha channel (`rgba`), verified on export — not a white box pretending to be
  transparent.
- **Clear space:** the mark is drawn inside a 100-unit viewBox whose visible content spans
  roughly 6–94, so there is already about 6% breathing room built in. Leave at least that
  much again around it when placing.
- **Minimum size:** it stays legible down to about 24px, but below ~32px the gap between the
  arcs starts to close up. Use the 512 for anything under 64px.
- **Don't** recolour the arcs and sparkle to the same colour — the two-tone is the point, and
  it is what distinguishes this from a generic ring.

---

## Re-rendering

```bash
cd simplyclean-ad

npx remotion still src/index.ts BrandLogo      out/logo/mark-1024.png
npx remotion still src/index.ts BrandLogoWhite out/logo/mark-white-1024.png
npx remotion still src/index.ts BrandLogoInk   out/logo/mark-ink-1024.png
npx remotion still src/index.ts BrandLockup    out/logo/lockup-2048.png
```

The compositions are registered in `src/Root.tsx`; the component is `src/BrandLogo.tsx`.
Nothing in those compositions paints a background, which is why the PNGs come out
transparent — if you add a background, you lose the alpha channel.

To change a colour, edit `colors.emerald` / `colors.amber` in `src/brand.ts` **only if you
also want the ad to change**. The logo deliberately reads from the same tokens.
