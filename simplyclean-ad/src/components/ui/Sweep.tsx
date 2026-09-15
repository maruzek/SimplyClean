import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors} from '../../brand';
import {easeInOutCubic, easeOutQuint, progress} from '../../lib/anim';

/**
 * A wipe that hides a cut.
 *
 * Transitions between beats are implemented as an opaque bar that sweeps across the
 * frame: at the cut point it fully covers the picture, so the outgoing and incoming
 * shots never have to overlap on the timeline. That matters because it means we never
 * have to extend a live-action clip past its length to cover a dissolve — the clips
 * can stay exactly as long as they are.
 *
 * The bar is a soft brand-tinted gradient rather than a flat colour, so the wipe reads
 * as a designed light sweep instead of a moving rectangle.
 */export const Sweep: React.FC<{
  /** Total length of the transition in frames. The cut sits at the midpoint. */
  duration?: number;
  /** Direction the bar travels. */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Tint at the leading edge. Defaults to the brand amber. */
  tint?: string;
  style?: React.CSSProperties;
}> = ({duration = 20, direction = 'up', tint = colors.amber, style}) => {
  const frame = useCurrentFrame();
  const half = duration / 2;

  // 0 → 1 covers the frame, then 1 → 0 uncovers it, so the cut at `half` is hidden.
  const enter = progress(frame, 0, half, easeOutQuint);
  const exit = progress(frame, half, half, easeInOutCubic);
  const coverage = enter - exit;

  if (coverage <= 0.0005) {
    return null;
  }

  // A skewed leading edge gives the sweep some energy; a flat edge reads mechanical.
  const pct = coverage * 118;
  const inset =
    direction === 'up'
      ? `inset(${100 - pct}% 0 0 0)`
      : direction === 'down'
        ? `inset(0 0 ${100 - pct}% 0)`
        : direction === 'left'
          ? `inset(0 0 0 ${100 - pct}%)`
          : `inset(0 ${100 - pct}% 0 0)`;

  return (
    <AbsoluteFill style={{clipPath: inset, ...style}}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(${
            direction === 'up' ? '0deg' : direction === 'down' ? '180deg' : direction === 'left' ? '90deg' : '270deg'
          }, ${tint} 0%, #F7F4EE 26%, #FAF8F4 52%, #F1EDE6 100%)`,
        }}
      />
      {/* Soft bloom at the leading edge, so the wipe feels like light passing over */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${
            direction === 'up' ? '0deg' : '180deg'
          }, ${tint}66 0%, rgba(255,255,255,0) 30%)`,
        }}
      />
    </AbsoluteFill>
  );
};
