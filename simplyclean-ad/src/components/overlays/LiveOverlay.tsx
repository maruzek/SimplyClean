import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors, typography as typeTokens} from '../../brand';
import {fontFamily} from '../../fonts';
import {easeOutCubic, easeOutQuint, progress, track} from '../../lib/anim';
import {TextScrim, Vignette} from '../ui/Vignette';

/**
 * Overlays for the two live-action beats.
 *
 * Both are deliberately restrained. The footage is doing the emotional work and the
 * audience is watching with the sound off, so the copy has to be readable in a glance
 * and then get out of the way. Anything animated on top of a performance competes
 * with it.
 *
 * Beat-relative timings below come straight from docs/SCRIPT.md (absolute time minus
 * the beat's start frame at 30fps).
 */

/** A single line in an accumulating stack. */
const Line: React.FC<{
  text: string;
  at: number;
  fontSize?: number;
  weight?: number;
  color?: string;
  /** Rises slightly as it settles, so lines feel placed rather than pasted. */
  accentBar?: boolean;
}> = ({text, at, fontSize = 46, weight = 600, color = colors.textOnInk, accentBar}) => {
  const frame = useCurrentFrame();
  const s = progress(frame, at, 20, easeOutQuint);
  const bar = progress(frame, at + 4, 16, easeOutQuint);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        opacity: s,
        transform: `translateY(${(1 - s) * 14}px)`,
      }}
    >
      {accentBar ? (
        <div
          style={{
            width: 4 * bar,
            height: fontSize * 0.92,
            borderRadius: 2,
            background: color,
            flexShrink: 0,
          }}
        />
      ) : null}
      <span
        style={{
          fontFamily: fontFamily.display,
          fontSize,
          fontWeight: weight,
          color,
          letterSpacing: -1.1,
          textShadow: '0 3px 22px rgba(0,0,0,0.55)',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
    </div>
  );
};

/**
 * BEAT 2 — over the messy-room footage. 330 frames.
 *
 * The lines accumulate rather than replace: pressure building. By the end of the beat
 * all four are on screen, which is exactly the feeling of a host staring at a checkout
 * deadline. The vignette tightens across the beat so the frame is visibly colder by the
 * cut — the audience feels the temperature change without knowing why.
 */
export const MessyOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const vignette = track(frame, [[0, 0.16], [330, 0.52]], easeOutQuint);

  return (
    <AbsoluteFill>
      <TextScrim opacity={0.74} height={68} />

      <div
        style={{
          position: 'absolute',
          left: 108,
          bottom: 96,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* 0:04.5, 0:06.3 — the two times, as a flat pair */}
        <Line text="11:00 checkout." at={45} color="rgba(245,243,239,0.92)" />
        <Line text="15:00 check-in." at={99} color="rgba(245,243,239,0.92)" />

        {/* 0:09.0 — the realisation, heavier */}
        <Line
          text="Four hours."
          at={180}
          fontSize={62}
          weight={800}
          color={colors.textOnInk}
        />

        {/* 0:11.0 — the actual problem, in the problem colour */}
        <Line
          text="No cleaning company to call."
          at={240}
          fontSize={42}
          weight={600}
          color={colors.amber}
          accentBar
        />
      </div>

      <Vignette strength={vignette} />
    </AbsoluteFill>
  );
};

/**
 * BEAT 5 — over the clean-room footage. 270 frames.
 *
 * Two lines only. The relief needs silence, and a host's own face sells this beat far
 * better than any copy we could write over it.
 */
export const CleanOverlay: React.FC = () => {
  return (
    <AbsoluteFill>
      <TextScrim opacity={0.55} height={54} />

      <div
        style={{
          position: 'absolute',
          left: 108,
          bottom: 96,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* 0:37.0 */}
        <Line text="Done before the next guest." at={30} fontSize={50} weight={700} />
        {/* 0:41.5 — the problem from beat 2, now resolved */}
        <Line
          text="11:00 → 15:00, handled."
          at={165}
          fontSize={40}
          weight={600}
          color={colors.emerald}
          accentBar
        />
      </div>

      <Vignette strength={0.24} />
    </AbsoluteFill>
  );
};

/**
 * A slow, subtle drift applied to live-action footage.
 *
 * Static footage on a 1080p timeline reads as "unedited". A 3% push across a beat costs
 * nothing and is the difference between a clip and a shot. Applied to the video element
 * itself so overlays stay locked to the frame.
 */
export const useShotDrift = (frames: number, amount = 0.03) => {
  const frame = useCurrentFrame();
  return track(frame, [[0, 1], [frames, 1 + amount]], easeOutCubic);
};
