import React from 'react';
import {useCurrentFrame} from 'remotion';
import {colors, dur, elevation, typography} from '../../brand';
import {fontFamily} from '../../fonts';
import {smoothText, uiEnter} from '../../lib/anim';
import {CheckIcon} from './Logos';

/**
 * A booking-platform connector tile.
 *
 * ── THE SPEC IS MEASURED, NOT GUESSED ─────────────────────────────────────────
 * The previous version sized this tile by eye — 244px wide with a 68px icon — which is
 * oversized for real interface chrome and is one of the quieter reasons it read as a
 * mockup. The dimensions here follow the one documented, production-quality connector tile
 * grid available (n8n's credential app tile), proportionally:
 *
 *   n8n (measured)            here (scaled up slightly for 1080p legibility)
 *   ----------------------    -------------------------------------------
 *   tile    140 × 110 px      tile    176 × 130 px
 *   radius  20 px             radius  16 px
 *   icon box  40 px           icon box  44 px
 *   icon      32 px           icon      36 px
 *   label UNDER icon, centred, 2-line clamp
 *   hover   translateY(-2px) + shadow 0 8px 25px rgba(0,0,0,0.1) over 0.2s
 *   connected  2px success border
 *   badge  20px circular success, white check, top-right
 *
 * Proportion matters more than absolute size here: an app rendered at 1400px wide in a
 * 1080p frame is roughly 1:1, so real values are the right target, with a small deliberate
 * oversizing for legibility on a phone.
 *
 * ── THE HOVER IS THE POINT ────────────────────────────────────────────────────
 * A click with no preceding hover is the most common tell of a faked interface. The hover
 * here lands in 6 frames (200ms — Material's token for selection controls) and the cursor
 * switches to a pointing hand at the same moment. Note that the real spec *replaces the
 * focus outline with a border + shadow change* rather than drawing a ring on hover; a
 * coloured outline on hover is not what a shipped product does.
 */
export const ConnectorTile: React.FC<{
  name: string;
  brandColor: string;
  mark: React.ReactNode;
  /** Frame at which this tile animates in, relative to the enclosing Sequence. */
  delay?: number;
  /** 0→1 hover progress, driven by the parent from cursor position. */
  hover?: number;
  /** 0→1 press progress. */
  press?: number;
  state?: 'idle' | 'connecting' | 'connected';
  style?: React.CSSProperties;
}> = ({name, brandColor, mark, delay = 0, hover = 0, press = 0, state = 'idle', style}) => {
  const frame = useCurrentFrame();
  const enter = uiEnter(frame, delay, dur.small + 3);
  const connected = state === 'connected';
  const hovered = hover > 0.02;

  const borderColor = connected
    ? colors.emerald
    : hovered
      ? `${brandColor}80`
      : colors.hairline;

  return (
    <div
      style={{
        width: 176,
        height: 130,
        borderRadius: 16,
        background: connected
          ? colors.emeraldSoft
          : hovered
            ? '#FFFFFF'
            : 'rgba(255,255,255,0.6)',
        border: `${connected ? 2 : 1.5}px solid ${borderColor}`,
        // Hover lifts 2px and steps the shadow up — the measured real behaviour.
        boxShadow: press > 0.4 ? elevation.sm : hovered ? '0 8px 25px rgba(0,0,0,0.10)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 11,
        position: 'relative',
        // Layer promotion stops Chrome snapping the label to whole pixels mid-move.
        transform: `translateY(${(1 - enter) * 10 - 2 * hover + 2 * press}px) scale(${1 - 0.012 * press})`,
        opacity: enter,
        ...smoothText,
        ...style,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: brandColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {mark}
      </div>

      <span
        style={{
          fontFamily: fontFamily.ui,
          fontSize: 14.5,
          fontWeight: typography.weights.medium,
          color: colors.textOnPaper,
          letterSpacing: -0.1,
          textAlign: 'center',
          lineHeight: 1.3,
          maxWidth: 140,
        }}
      >
        {name}
      </span>

      {/* The connected affordance from the measured spec: a 20px circular success badge
          with a white check, top-right. A bare grey text badge does not read as state. */}
      {connected ? (
        <div
          style={{
            position: 'absolute',
            top: 7,
            right: 7,
            width: 20,
            height: 20,
            borderRadius: 10,
            background: colors.emerald,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckIcon size={13} progress={1} ring={false} color="#fff" />
        </div>
      ) : null}
    </div>
  );
};
