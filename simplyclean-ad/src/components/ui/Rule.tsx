import React from 'react';
import {useCurrentFrame} from 'remotion';
import {colors} from '../../brand';
import {easeOutQuint, progress} from '../../lib/anim';

/**
 * An animated horizontal rule that draws itself left-to-right.
 *
 * This is the ad's recurring punctuation mark: it appears under the title card,
 * in the notification stack, and beside the closing line. It is also the carrier
 * of the amber→emerald transition, so its colour is always meaningful.
 */
export const Rule: React.FC<{
  /** Frame at which the draw-on begins, relative to the enclosing Sequence. */
  start: number;
  duration?: number;
  width?: number;
  height?: number;
  color?: string;
  /** Optional colour to animate toward, for the amber→emerald resolution. */
  colorTo?: string;
  /** 0→1 how far along the amber→emerald shift is. */
  shift?: number;
  style?: React.CSSProperties;
}> = ({
  start,
  duration = 12,
  width = 120,
  height = 4,
  color = colors.amber,
  colorTo,
  shift = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, start, duration, easeOutQuint);
  const fill = colorTo && shift > 0 ? blend(color, colorTo, shift) : color;

  return (
    <div
      style={{
        width: width * p,
        height,
        borderRadius: height / 2,
        background: fill,
        ...style,
      }}
    />
  );
};

/** Naive sRGB blend. Good enough for UI colour transitions. */
export const blend = (from: string, to: string, t: number): string => {
  const c = Math.max(0, Math.min(1, t));
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const m = (i: number) => Math.round(a[i] + (b[i] - a[i]) * c);
  return `rgb(${m(0)}, ${m(1)}, ${m(2)})`;
};

export const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((x) => x + x)
          .join('')
      : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
};
