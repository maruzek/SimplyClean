import type {CSSProperties} from 'react';
import {Easing, interpolate} from 'remotion';

/**
 * Custom easing curves.
 *
 * Remotion ships `Easing`, but these are written out explicitly so the motion
 * language stays consistent and tunable in one place. Every animation in the
 * project should reach for one of these rather than inventing a curve.
 */
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeInOutQuint = (t: number) =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
export const easeInQuad = (t: number) => t * t;
export const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);

/** Slight overshoot — for things that should feel physical, not mechanical. */
export const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export type EasingFn = (t: number) => number;

/**
 * Interpolate through a list of [frame, value] stops with clamping on both ends.
 * The everyday workhorse for scripted motion.
 */
export const track = (
  frame: number,
  stops: Array<[number, number]>,
  easing: EasingFn = easeInOutCubic,
): number => {
  if (stops.length === 0) {
    throw new Error('track() needs at least one stop');
  }
  return interpolate(
    frame,
    stops.map((s) => s[0]),
    stops.map((s) => s[1]),
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing},
  );
};

/** A 0→1 progress value that starts at `start` and completes after `duration` frames. */
export const progress = (
  frame: number,
  start: number,
  duration: number,
  easing: EasingFn = easeOutCubic,
): number => {
  if (duration <= 0) {
    return frame >= start ? 1 : 0;
  }
  return track(frame, [[start, 0], [start + duration, 1]], easing);
};

/** Shorthand: has `frame` reached `at`? Useful for hard cuts inside a segment. */
export const after = (frame: number, at: number) => frame >= at;

/**
 * Deterministic pseudo-random in [0,1). Used instead of Math.random() so that
 * every frame of a render is reproducible — a hard requirement for video.
 */
export const noise = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Staggered delay for lists, so items cascade instead of appearing together. */
export const stagger = (index: number, step: number, base = 0) => base + index * step;

// ─────────────────────────────────────────────────────────────────────────────
// UI MOTION
//
// Real interface motion, as opposed to motion-graphics motion. These curves and
// durations are what production product UI actually uses; the comments record why.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The curves. `ui` is the system deceleration curve — a strong, fast ease-out with no
 * overshoot, which is what makes an element read as "appearing" rather than "animating".
 * This is the default for everything in the mock product interface.
 */
export const EASE = {
  /** Crisp UI entrance. The workhorse. */
  ui: Easing.bezier(0.16, 1, 0.3, 1),
  /** Material 3 standard. Symmetric, for state-to-state moves. */
  standard: Easing.bezier(0.2, 0, 0, 1),
  /** Material 3 emphasised decelerate. For large surfaces arriving. */
  emphasizedDecel: Easing.bezier(0.05, 0.7, 0.1, 1),
  /** Material 3 emphasised accelerate. For large surfaces leaving. */
  emphasizedAccel: Easing.bezier(0.3, 0, 0.8, 0.15),
  /** Slower, balanced. For editorial fades over live action. */
  editorial: Easing.bezier(0.45, 0, 0.55, 1),
} as const;

/**
 * UI entrance progress, 0→1, clamped on both sides.
 *
 * `delay` is in frames, relative to the enclosing Sequence. Use this instead of a spring
 * for anything that represents software responding to input.
 */
export const uiEnter = (
  frame: number,
  delay: number,
  duration: number = 9,
  easing: EasingFn = EASE.ui,
): number => progress(frame, delay, duration, easing);

/** UI exit progress, 0→1 where 1 is fully gone. Accelerates out, as real UI does. */
export const uiExit = (
  frame: number,
  delay: number,
  duration: number = 9,
  easing: EasingFn = EASE.emphasizedAccel,
): number => progress(frame, delay, duration, easing);



/**
 * THE SUBPIXEL FIX.
 *
 * Chrome snaps text to whole pixels during layout, so animating a text element's
 * positional properties produces visible stepping — `margin-top: 10px` and `10.4px` lay
 * out identically, so the glyphs sit still and then jump. Promoting the element to its own
 * compositing layer stops the snapping and the motion becomes smooth.
 *
 * Apply to any text or UI node whose position or scale is animated. Remotion recommends
 * using this only in renders — hence gating it on the rendering environment, so the Studio
 * preview stays truthful about what will be rendered.
 */
export const smoothText: CSSProperties = {
  transform: 'perspective(100px)',
  willChange: 'transform',
};

/**
 * `font-variant-numeric: tabular-nums` for any number that animates or changes.
 * Proportional digits change width as they change value, so a clock or a counter visibly
 * jitters. Tabular figures are fixed-width and do not.
 */
export const tabularNums: CSSProperties = {
  fontVariantNumeric: 'tabular-nums',
};
