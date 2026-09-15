# Footage Specification — for the two live-action clips

Give this to your friend **before** the shoot. Ten minutes of care here saves a day of fixing
later, and it is the single biggest factor in whether the final ad looks professional or looks
like a phone video.

The two clips drop straight into a 1080p30 timeline, so the closer they are shot to spec, the
less processing — and the less processing, the better they look.

---

## Required deliverables

| # | Slug | Content | Target length |
|---|------|---------|---------------|
| 1 | `messy-room.mp4` | Host gets the booking notification → opens the door → room is a mess → head in hands. | 20–30 s of usable material |
| 2 | `clean-room.mp4` | The same room, spotless. Host walks in, looks around, visibly relieved/happy. | 20–30 s of usable material |
| **3** | `relaxed.mp4` | **Host sits down, feet on the table, hands behind head, exhales.** | 15–20 s |

### ⚠️ About clip 3

Your brief describes this shot as the closing beat, but it was not listed among the two clips
you said your friend is putting together. **Please confirm and ask for it** — it is the emotional
payoff of the entire ad, and without it the film has to end on a graphic instead of on his face,
which is weaker.

I have built a fallback anyway so we are never blocked: a slow push-in on the final frame of
`clean-room.mp4` with the end card over it. It works. A real shot of him relaxing works better.

---

## Camera settings

| Setting | Value | Why |
|---|---|---|
| Resolution | **1920×1080** (or shoot 4K and let me downscale) | Native timeline resolution. 4K is fine and gives me room to reframe. |
| Frame rate | **25 or 30 fps, constant** | Matches the 30 fps timeline cleanly. **Never** use a variable-frame-rate phone mode. |
| Orientation | **Landscape only** | This is a 16:9 ad. Vertical footage cannot be rescued. |
| Shutter | 1/50 (at 25fps) or 1/60 (at 30fps) | Natural motion blur. |
| ISO | As low as the light allows | Noise is the enemy of a clean-looking ad. |
| White balance | **Locked manually**, both clips identical | If the two rooms have different colour temperatures, the cut will scream. |
| Focus | Locked. No hunting, no autofocus breathing. | |

**Shot on a phone?** That is genuinely fine at 1080p if you do three things: shoot landscape,
lock exposure and white balance (tap-and-hold), and **clean the lens** first. A smeared lens is
the single most common reason phone footage looks cheap.

---

## Lighting — this is where the ad is won or lost

The two clips are a before/after pair, so they must share a lighting logic or the comparison
will not read.

- **Messy clip:** flat, cool, slightly underlit. Overcast daylight or a single overhead source.
  Let shadows sit in the corners. Do **not** make it theatrically dark — it must look like a real
  apartment at 11am, not a horror film. The "cold" feeling is added in post, not on set.
- **Clean clip:** the **same room, same camera position, same lens, same time of day.** Add
  warmth — open the curtains, turn on a warm lamp. Same framing, brighter and warmer.
- **Relaxed clip:** warm, soft, comfortable. Late-afternoon light is ideal.
- **Absolutely critical:** the messy and clean shots must be the **same room from the same
  angle**. If the camera moves between them, the whole before/after device collapses.

---

## Composition

- **Leave headroom and negative space.** Text overlays sit in the lower-left of beats 2 and 5.
  Keep the lower-left third of the frame relatively uncluttered — no critical detail there.
- **Keep the top-right clear too**, in case we place the property badge there.
- Eye-line in the upper third.
- Shoot **wider than you think you need.** I can push in and crop; I cannot pull back.

---

## Handles and coverage (important)

Record **at least 5 seconds of rolling before and after** each action. I need room to cut on
motion and to trim to musical beats.

Please also grab these cheap extra shots — they cost two minutes and give the edit real texture:

1. **A door handle turning** and the door pushing open (close-up).
2. **A hand picking up the phone** with the notification on screen.
3. **An unmade bed / towel on the floor** (a detail insert).
4. **A hand smoothing a made bed / a folded towel** (the matching clean insert).
5. **A wide static shot of the clean room with no person in it** — useful as a background plate
   for the end card if clip 3 doesn't happen.

Inserts 3 and 4 as a matched pair are worth more to this edit than another take of the wide shot.

---

## Audio

**Record no audio, or record it and ignore it.** The ad uses a music bed and on-screen text only.

Please do **not** let the camera's built-in mic be the source of any on-screen sound. If the
footage has noisy room tone, I will simply mute it.

If your friend wants to capture a door slam or a sigh as a sound effect, record those as separate
files — never baked into the take.

---

## Technical delivery

| Item | Requirement |
|---|---|
| Container | `.mp4` or `.mov` |
| Codec | H.264 (preferred) or ProRes if editing software allows |
| Colour | Rec.709, 8-bit 4:2:0 minimum. **No LOG footage** unless you tell me and send the LUT. |
| Bitrate | ≥ 40 Mbps at 1080p, or whatever the camera's highest quality setting is |
| Frame rate | Constant, not variable |
| Filenames | Exactly `messy-room.mp4`, `clean-room.mp4`, `relaxed.mp4` |
| Delivery | Copy the **original camera files** — do not export from a phone editor, and do not send via a service that re-compresses |

### How to get the files to me

Drop them in:

```
/home/oliver/Projects/turnover-ad/footage/
├── messy-room.mp4
├── clean-room.mp4
└── relaxed.mp4        (optional but strongly recommended)
```

Originals only. WhatsApp and most messengers re-compress and destroy quality — use a cloud drive
or a direct copy. Big files are fine; there is 204 GB free.

---

## What happens the moment they arrive

One command:

```bash
cd /home/oliver/Projects/turnover-ad
npm run build:final
```

That will: conform both clips to 1080p30 Rec.709 → attach the overlays and motion segments →
mix and master the music to −14 LUFS → render `out/final-1080p.mp4`. A preview render of the full
60 seconds is already working today against placeholder footage, so nothing is being written blind.

---

## One-paragraph version to send your friend

> Landscape 1080p or 4K, 25 or 30fps constant, lock exposure and white balance, clean the lens.
> Messy and clean must be the **same room from the exact same camera position**. Cool/flat for
> messy, warm/bright for clean. Plus a third clip: him sitting down, feet on the table, hands
> behind his head, relaxing. Roll 5 seconds before and after every action, and grab a few
> close-ups: door handle, phone with the notification, an unmade bed, a made bed. No audio needed.
> Send the original files as `messy-room.mp4`, `clean-room.mp4`, `relaxed.mp4`.
