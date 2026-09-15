# Third-Party Brand Use — read before publishing

**Status: requires your decision. This is a legal question, not a design one, and I am not a
lawyer. Nothing here is legal advice.**

---

## The short version

You asked for the real Airbnb and Booking.com logos. I've implemented them — and
`src/brand.ts` now has a one-word switch to swap them for invented stand-ins instead.

**I am flagging clearly that shipping the real marks in a commercial advertisement carries
real risk**, because Airbnb's own published trademark terms appear to prohibit four separate
things that this ad currently does. You own this decision; here is the information you need
to make it.

---

## What Airbnb's own terms say

Both of these are Airbnb's own published pages, not third-party commentary.

**Airbnb Newsroom media assets** — <https://news.airbnb.com/media-assets/>

> "All content downloaded from the Site (photography, audio and video, etc.) may be used for
> **editorial purposes only**. Any other use of Site content including, without limitation
> personal or **commercial use, is strictly prohibited**."

**Airbnb Trademark Guidelines** — <https://www.airbnb.com/help/article/3233>
(the page is JavaScript-rendered; the text is readable via <https://r.jina.ai/https://www.airbnb.com/help/article/3233>)

> "You may **NOT** use the Airbnb logo, the Bélo logo or any Airbnb trademarks, logos, or
> icons unless you have **formal written permission** from the appropriate business or legal
> teams at Airbnb, Inc."

> "Do not use the Bélo logo in any form, including separately or in combination with any
> business name, trademark, social media account name, or generic term."

> "Do not feature Airbnb's distinctive **Rausch** color prominently in your content,
> including in your trademarks, logos, designs, or other brand elements."

> The word "Airbnb" is permitted only factually, and "only in body text (not, for example,
> **in titles and headlines**)."

> "Do not use 'Airbnb' in a way that implies **partnership, sponsorship, or endorsement**."

There is also a mandatory-disclosure requirement for property-management companies
advertising in this space:

> "[name of your company] is an independent third party and is not endorsed by or associated
> with Airbnb, Inc. or its affiliates" — and if there is a CTA with a form, the disclosure
> must sit "prominently underneath the CTA button."

**There is no public Airbnb brand kit.** The full guidelines are gated behind a partner
contact, so official clear-space and minimum-size rules are not publicly verifiable. Anyone
who states them as fact is guessing.

## What Booking.com's terms say

- Booking Holdings media room (logos + brand guidelines):
  <https://www.bookingholdings.com/media-room/>
- Brand guidelines PDF (14pp, © 01/2024):
  <https://www.bookingholdings.com/wp-content/uploads/2023/07/BHI_BrandGuidelines__ForMediaRoom_2024.pdf>
- Booking.com IP / trademark terms:
  <https://sp.booking.com/content-moderation-policy/intellectual-property.en-us.html>

> "Booking.com trademarks, logos, and brand assets are the property of Booking.com and its
> affiliates. You may not use our trademarks or branding in a manner that is unauthorized,
> misleading, or infringes on our rights."

Booking.com's route for permission is `mediarelations@booking.com`.

---

## The four specific problems in the current cut

For the record, plainly, because a reviewer would list exactly these:

| # | What the ad does | Which rule it touches |
|---|---|---|
| 1 | Uses the real **Bélo** glyph | "may NOT use … the Bélo logo … unless you have formal written permission" |
| 2 | Airbnb **red tile**, prominently, in a commercial ad | "Do not feature … Rausch color prominently" |
| 3 | Headline **"Airbnb wants to access your Airbnb account"** | "not, for example, in titles and headlines" |
| 4 | Badge **"Airbnb · Connected"** | implies endorsement / partnership |

Plus: the ad is commercial, which the Newsroom licence explicitly excludes.

---

## Your options

### Option A — real marks (current default: `logoMode: 'official'`)

```ts
// src/brand.ts
logoMode: 'official',
```

- **Upside:** maximum realism and instant recognition. This is also what a great many real
  products do in their integrations directory.
- **Downside:** the four problems above, in a commercial advertisement.
- **If you take this path, reduce the exposure:** put the word "Airbnb" back into body text
  rather than a headline, add the independent-third-party disclosure under the CTA, and
  consider asking for written permission. Airbnb routes this through a partner contact;
  Booking.com through `mediarelations@booking.com`.

### Option B — invented stand-ins (`logoMode: 'standin'`)

```ts
// src/brand.ts
logoMode: 'standin',
```

- Renders **"StayNest"** and **"RoomBook"** with abstract marks in their own colours.
- Visually equivalent; the integration story reads identically.
- **No third-party trademark question at all.** This is the production-studio convention:
  invent truthful stand-ins rather than ship someone else's mark.

### Option C — real names in body text only, no logos

Not implemented, but easy: keep the words "Airbnb" and "Booking.com" as plain text in the
connector list and drop the glyphs and brand colours. This is the position Airbnb's terms
most nearly permit without written permission.

---

## What I recommend

For a **public advertisement**, Option B. The ad does not need the real marks to communicate
"we connect to the platforms you already use", and it removes the question entirely.

For an **internal pitch deck or a demo**, Option A is fine.

If you want Option A publicly, get it in writing first. That is a short email, not a
project.

---

## About the logos currently in the repository

The glyph geometry in `assets/logos/` comes from the
[Simple Icons](https://simpleicons.org) dataset, which is released under **CC0 1.0** — so the
*artwork files* are free to use, and `assets/logos/SIMPLE-ICONS-LICENSE.md` records that.
**That licence covers the SVG files, not the trademarks they depict.** A CC0 licence on a
drawing of a logo does not grant permission to use the brand. Do not let the CC0 label
reassure you on that point.

Brand colours used:

| Brand | Value | Note |
|---|---|---|
| Airbnb | `#FF5A5F` ("Rausch") | The **brand** coral. Airbnb's product UI actually uses `#FF385C`. |
| Booking.com | `#003B95` | RGB 0/59/149, PMS 3015 C. Older material used `#003580`. |
