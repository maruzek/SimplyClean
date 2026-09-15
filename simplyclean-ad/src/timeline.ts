/**
 * Timeline — SINGLE SOURCE OF TRUTH for the edit.
 *
 * 1800 frames @ 30fps = 60.000s. Mirrors docs/SCRIPT.md.
 * If you change a beat here, change the table in docs/SCRIPT.md too.
 *
 * ── WHY THESE LENGTHS ──────────────────────────────────────────────────────────
 * This cut is timed to the footage we actually have, which is the right way round:
 * the material dictates the edit, not the other way around. The classmate's clips are
 *
 *   messy (frustrated, hands on head)  8.46s
 *   clean detail (thumbs up)           5.14s
 *   relaxed (leaning back)             8.52s
 *
 * so the three live beats are set just inside those limits (8.4 / 5.1 / 8.3s) and the
 * freed time went to the Remotion connector demo, which is the part that actually sells
 * the product and the part worth giving more room to breathe.
 *
 * Result: 39.1s of motion graphics, 20.9s of live action.
 */

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export type Beat = {
  /** First frame, relative to the composition start. */
  from: number;
  /** Length in frames. */
  duration: number;
  /** Which layer renders it. */
  kind: 'remotion' | 'live';
  /** Short human label, used by the dev slate and render scripts. */
  label: string;
};

export const BEATS = {
  /** Phone in the dark: a booking arrives, and no cleaner is scheduled. */
  hook: {from: 0, duration: 90, kind: 'remotion', label: 'Hook — the notification'},

  /** LIVE — classmate's IMG_9305: messy flat, frustration, hands on head. */
  messy: {from: 90, duration: 252, kind: 'live', label: 'Live 1 — the mess'},

  /** Title card. Music resolves. The emotional hinge. */
  title: {from: 342, duration: 96, kind: 'remotion', label: 'Title card'},

  /** The hero: connect Airbnb / Booking.com. The longest beat, deliberately. */
  connector: {from: 438, duration: 660, kind: 'remotion', label: 'The connector (hero)'},

  /** LIVE — classmate's IMG_9312: the thumbs-up over the cleaned floor. */
  clean: {from: 1098, duration: 153, kind: 'live', label: 'Live 2 — cleaned'},

  /** Automation opt-in dialog → Approve → Automated. */
  automate: {from: 1251, duration: 300, kind: 'remotion', label: 'Automation opt-in'},

  /** LIVE — classmate's IMG_9310: leaning back, hands behind head. End card overlays. */
  payoff: {from: 1551, duration: 249, kind: 'live', label: 'Live 3 — payoff + end card'},
} as const satisfies Record<string, Beat>;

export const TOTAL_FRAMES = 1800;

/** Look up a beat's absolute end frame. */
export const beatEnd = (b: Beat) => b.from + b.duration;

/**
 * Live-action slots: the conformed files the pipeline must produce, and how long each
 * one is needed for. `conform.sh` reads the same numbers — keep them in step.
 */
export const SLOTS = {
  'messy-room': {frames: BEATS.messy.duration, label: 'Live 1 — messy room'},
  'clean-room': {frames: BEATS.clean.duration, label: 'Live 2 — cleaned'},
  relaxed: {frames: BEATS.payoff.duration, label: 'Live 3 — relaxed'},
} as const;

export type SlotName = keyof typeof SLOTS;
export const SLOT_NAMES = Object.keys(SLOTS) as SlotName[];
