import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {resolveCursor} from '@remotion/mac-cursors';
import {EASE, smoothText} from '../../lib/anim';

export type CursorKey = {frame: number; x: number; y: number};

/**
 * A real macOS cursor.
 *
 * ── WHY THIS IS NOT A HAND-DRAWN SVG ──────────────────────────────────────────
 * A hand-drawn arrow is one of the fastest tells that a UI is fake — everyone has seen a
 * real cursor thousands of times and the silhouette is burned in. `@remotion/mac-cursors`
 * ships 39 genuine macOS cursor assets, and `resolveCursor()` returns the asset as a data
 * URI **together with its hotspot**.
 *
 * That hotspot is the other reason to use it: it is the exact pixel that registers a click.
 * Positioning the image so the hotspot lands on the target coordinate is what makes the
 * click land on the button instead of near it — an earlier build used a hand-drawn arrow
 * and was 14px off, which is the kind of error that quietly makes a demo feel wrong.
 *
 * Useful names: `default` (arrow), `handpointing` (link/hand), `busy`, `textcursor`,
 * `notallowed`. Pass `cursor` to switch; the hand should appear over anything clickable.
 */
export const Cursor: React.FC<{
  /** Position keyframes, absolute within the enclosing Sequence. */
  keys: CursorKey[];
  /** Frames at which a click occurs — the pointer dips in scale. */
  clicks?: number[];
  /** macOS cursor asset name. See @remotion/mac-cursors for the full list. */
  cursor?: string;
  /** Rendered width in px. Real macOS cursors are ~28px tall at 1x. */
  size?: number;
  opacity?: number;
}> = ({keys, clicks = [], cursor = 'default', size = 30, opacity = 1}) => {
  const frame = useCurrentFrame();
  const resolved = resolveCursor(cursor);

  if (keys.length === 0 || !resolved) {
    return null;
  }

  const assetW = resolved.width ?? 32;
  const assetH = resolved.height ?? 32;

  const frames = keys.map((k) => k.frame);

  /**
   * X and Y are interpolated on slightly different time bases — Y lags X by two frames.
   * Real hands do not move a cursor in a straight line; the lag bends the path into an arc,
   * and it costs nothing. A perfectly linear-diagonal cursor is noticeably robotic.
   */
  const x = interpolate(frame, frames, keys.map((k) => k.x), {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE.ui,
  });
  const y = interpolate(
    frame,
    frames.map((f) => f + 2),
    keys.map((k) => k.y),
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: EASE.ui,
    },
  );

  // Click compress: a fast dip and a slightly slower recovery, like a real button.
  let scale = 1;
  for (const c of clicks) {
    if (frame >= c && frame <= c + 8) {
      scale = Math.min(
        scale,
        interpolate(frame, [c, c + 2, c + 8], [1, 0.9, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EASE.ui,
        }),
      );
    }
  }

  const scaleFactor = size / assetW;

  return (
    <div
      style={{
        position: 'absolute',
        // Place the HOTSPOT on the target coordinate, not the image's top-left corner.
        left: x - resolved.hotspot.x * scaleFactor,
        top: y - resolved.hotspot.y * scaleFactor,
        width: size,
        height: assetH * scaleFactor,
        opacity,
        pointerEvents: 'none',
        transform: `scale(${scale})`,
        transformOrigin: `${resolved.hotspot.x * scaleFactor}px ${resolved.hotspot.y * scaleFactor}px`,
        filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.38))',
        zIndex: 50,
        ...smoothText,
      }}
    >
      <img
        src={resolved.src}
        width={size}
        height={assetH * scaleFactor}
        alt=""
        style={{display: 'block', width: '100%', height: '100%'}}
      />
    </div>
  );
};
