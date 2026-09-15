# Pipeline & Tooling Decision

**Question asked:** find the best AI-native, ideally open-source, lightweight video tool that I
can use to cut the videos myself on your PC.

**Answer: we should not install a video editor.** The best tool for this job is code, in two
layers, both already on your machine.

---

## The decision

```
  your friend's clips ──► ffmpeg (conform / grade / trim)
                              │
                              ▼
                     Remotion 4 (timeline + motion graphics + text + audio)
                              │
                              ▼
                     ffmpeg (loudness master / delivery encode)
                              │
                              ▼
                    out/final-1080p.mp4
```

| Layer | Tool | Role |
|---|---|---|
| Compositor | **Remotion 4.0.525** | The timeline. Places the live clips, draws every overlay, animation, text card and transition, and renders one master file. |
| Media engine | **ffmpeg 9.0.1** (already installed) | Conditions the raw footage, grades it, masters the audio to broadcast loudness, and produces delivery encodes. |

**Why this beats installing Kdenlive / Shotcut / DaVinci:**

1. **The overlays are the hard part, and they are code.** The notification, the connector UI, the
   automation dialog — these are React components. Remotion renders them frame-accurately on top
   of live footage. Doing that in an NLE means keyframing by hand and re-doing it every revision.
2. **"Lightning speed" is literal here.** When your friend's clips land, the final render is
   **one command**. No project file to open, no timeline to re-assemble, no manual export.
3. **Revisions are free.** Change the brand name, the copy, or a colour, and everything updates
   consistently and re-renders. In an NLE, a copy change means re-timing three screens by hand.
4. **It is version-controllable.** The whole edit is text. We can diff it, branch it, and produce
   a second cut without touching the first.
5. **Nothing to learn.** No new application for you to open. I drive the whole pipeline.

---

## The honest licensing position

You asked for open source. I have to be straight with you about one thing:

> **Remotion is not open source.** It is *source-available* under the proprietary
> [Remotion License](https://www.remotion.dev/docs/license/faq). The source is public, but the
> licence has conditions that fail the OSI definition.

What that means in practice
([full FAQ](https://www.remotion.dev/docs/license/faq), [pricing](https://www.remotion.dev/docs/license/pricing)):

| Your situation | Cost |
|---|---|
| Individual, personal or commercial | **Free** |
| Organisation/team of up to 3 people | **Free**, commercial use included |
| Non-profit | **Free** |
| 4+ people, making videos for yourselves | Company Licence, $25/seat/month |
| Building an automated rendering product | Company Licence, $0.01/render, $100/month minimum |

So: **if you are an individual or a team of three or fewer, this entire ad is free to produce**,
including commercially. If the cleaning platform grows past three people and you keep rendering
videos in-house, you would owe a licence — a real but small and deferrable cost.

### If you would rather stay strictly open source

The motion layer is built from plain React components, so it is portable. Options, best first:

| Alternative | Licence | Trade-off |
|---|---|---|
| **[Revideo](https://github.com/redotvideo/revideo)** | MIT | A genuine Remotion-like React/TS renderer. Closest port target — most components move with modest changes. Smaller ecosystem, fewer docs, less mature `OffthreadVideo` handling. |
| **Motion Canvas** | MIT | Excellent for pure animation, weak at compositing real footage. Would need ffmpeg to do the actual assembly. |
| **Blender VSE** | GPL | Scriptable headless via Python, extremely powerful, but heavyweight and awkward for 2D motion graphics. |
| **Kdenlive / Shotcut** | GPL | GUI editors. I can generate project XML, but the round-trip is fragile and breaks the one-command promise. |

**My recommendation:** stay on Remotion for this ad. It is free for you today, it is by far the
fastest path to a high-quality 60 seconds, and if the licensing ever becomes a problem the port to
Revideo is a contained piece of work rather than a rewrite.

---

## Tools I evaluated and what they are actually good for

These are worth knowing about even though I am not making them the backbone:

| Tool | Licence | Verdict |
|---|---|---|
| **ffmpeg** | LGPL/GPL | **In the pipeline.** The workhorse. Already installed, full build. |
| **[auto-editor](https://github.com/WyattBlue/auto-editor)** | MIT (Unlicense) | Genuinely useful and tiny. Detects silence/motion and cuts dead air automatically. Worth installing **only** if your friend sends long raw takes — it can rough-cut 20 minutes down to the usable 30 seconds before I touch it. |
| **OTIO (OpenTimelineIO)** | Apache 2.0 | Not needed for the render, but I can export the edit as an `.otio` timeline so it can be opened in any professional NLE later. Cheap insurance against lock-in. |
| **MoviePy** | MIT | Skipped. Your Python is 3.14 with no `pip`, and its dependency chain is fragile. ffmpeg does the same work with no install. |
| **Whisper / faster-whisper** | MIT | Not needed — no dialogue in this cut. Would matter if we ever add a voiceover with subtitles. |
| **Piper / Kokoro TTS** | MIT / Apache 2.0 | Held in reserve. You chose text-only, but if you later want a voiceover, Piper runs offline on CPU and sounds respectable. |

---

## Why local AI video generation is off the table

Worth stating plainly so we do not waste a day on it: your GPU is an **Intel Haswell integrated
chip** (Iris Pro, 2013-era). It exposes H.264 hardware *encoding* through VAAPI, which helps render
speed, but it has **no usable compute for generative video models** — no CUDA, no ROCm, and only
a small Vulkan/OpenCL surface.

Running something like Stable Video Diffusion or AnimateDiff locally would take hours per second
of output at unusable quality. It is strictly worse than shooting the two clips on a phone.

**Where AI genuinely accelerates this project** is not pixel generation — it is everything
upstream: writing the script, designing the storyboard and copy, building the mock product UI,
authoring the timeline, and driving the render. That is the layer I am doing, and it is why the
turnaround on revisions will be minutes.

---

## Hardware fit

| Resource | Available | Why it is enough |
|---|---|---|
| CPU | 8 cores | x264 at 1080p, `crf 16`, ~6 concurrent Chrome workers. A 60 s render is roughly 3–6 minutes. |
| RAM | 15 GB (7 GB free) | Six headless Chrome workers is comfortable. Config clamps concurrency to 6 to leave headroom. |
| Disk | 204 GB free | ProRes masters plus H.264 delivery copies are a few GB. |
| GPU | Intel Haswell VAAPI | H.264 hardware encode. Remotion tries it (`if-possible`) and falls back to x264 automatically. |
| Network | Fast (236 ms npm ping) | Fonts and the Chrome Headless Shell download in seconds. |

---

## Commands

```bash
cd /home/oliver/Projects/turnover-ad

npm run studio          # live preview in the browser — the visual editor
npm run typecheck       # catch component errors before a 5-minute render
npm run still -- Ad out/f.png --frame=900    # one frame; fast layout check

npm run setup           # generate placeholder footage + a placeholder music bed
npm run build           # render the Ad composition only

npm run build:final     # THE one command. Footage in → finished ad out. (1x, fast)
npm run build:hq        # 2x SUPERSAMPLED master — the final-delivery path (slow, ~13 min)
npm run build:preview   # setup, then build — full 60s, works today

npm run inspect         # technical report on footage/
npm run conform         # footage → conformed (graded, 1080p30, Rec.709)
npm run music           # the 60s bed at −14 LUFS
npm run placeholders    # regenerate the slate clips
npm run footage:check   # render the three clips back to back, labelled, for review
```

`build:final` performs, in order:

1. **Conform** the supplied clips to 1920×1080 / 30 fps CFR / Rec.709, grading beat 2
   cool-and-flat and beats 5 and 7 warm, so the before/after reads. Any slot with no
   original keeps its placeholder, untouched.
2. **Master** the music to −14 LUFS integrated, −1 dBTP, exactly 60.000 s.
3. **Pre-flight** every input, before starting a four-minute render.
4. **Composite** in Remotion: footage → overlays → product segments → transitions → end card.
5. **Verify** resolution, duration and — critically — that the render actually has an audio
   stream, then encode `out/final-1080p.mp4` (H.264 High, CRF 18, `yuv420p`, faststart)
   plus a ProRes 422 HQ archival master and a poster frame.

Two failure modes the pipeline explicitly guards against, both learned the hard way:

- **Remotion renders a silent video** rather than failing when the audio file is missing.
  Step 5 asserts on the audio stream, because a silent ad does not announce itself.
- **A conform stage must never write an output when no original exists.** `conform.sh` leaves
  files byte-for-byte alone in that case, verified by checksum.

Every stage is idempotent — re-running never re-does work it does not have to, so iterating on a
colour tweak costs seconds rather than a full re-render.

Per-script detail, env vars and invocation live in `scripts/README.md`.

---

## What happens with no footage at all

The pipeline is built to run today. If `footage/` is empty, it generates matched placeholder
slates with ffmpeg — correct duration, resolution, motion and colour — so the full 60 seconds
renders end to end and we can tune timing, text and music *now*. When the real clips land, they
replace the slates and the same command produces the final film.
