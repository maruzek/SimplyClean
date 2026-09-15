import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, motion, typography as typeTokens} from '../../brand';
import {fontFamily} from '../../fonts';

/**
 * A push notification card, modelled on iOS.
 *
 * The entrance is a spring with a slight overshoot and then a settle — a
 * notification that simply fades in does not read as a real notification, and this
 * card is the ad's opening hook so it has to feel genuine.
 */
export const Notification: React.FC<{
  icon: React.ReactNode;
  app: string;
  title: string;
  body: string;
  time?: string;
  /** Frame to appear, relative to the enclosing Sequence. */
  start: number;
  /** Tints the card's border and title, for the amber warning variant. */
  accent?: string;
  width?: number;
  style?: React.CSSProperties;
}> = ({icon, app, title, body, time = 'now', start, accent, width = 620, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const s = spring({
    frame,
    fps,
    delay: start,
    config: {damping: 20, mass: 0.85, stiffness: 150},
    durationInFrames: 30,
  });

  const settled = Math.min(1, Math.max(0, s));

  return (
    <div
      style={{
        width,
        padding: '20px 24px',
        borderRadius: 28,
        background: colors.notifyBg,
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: `1px solid ${accent ? `${accent}55` : 'rgba(255,255,255,0.10)'}`,
        boxShadow: '0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)',
        display: 'flex',
        gap: 18,
        alignItems: 'flex-start',
        opacity: settled,
        transform: `translateY(${(1 - settled) * -34}px) scale(${0.93 + settled * 0.07})`,
        transformOrigin: 'top center',
        ...style,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: accent ? colors.amberSoft : 'rgba(255,255,255,0.10)',
        }}
      >
        {icon}
      </div>

      <div style={{flex: 1, minWidth: 0}}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontFamily: fontFamily.ui,
              fontSize: 24,
              fontWeight: typeTokens.weights.semibold,
              color: colors.textOnInkMuted,
              letterSpacing: 0.2,
            }}
          >
            {app}
          </span>
          <span
            style={{
              fontFamily: fontFamily.ui,
              fontSize: 22,
              color: colors.textOnInkMuted,
            }}
          >
            {time}
          </span>
        </div>

        <div
          style={{
            fontFamily: fontFamily.ui,
            fontSize: 30,
            fontWeight: typeTokens.weights.semibold,
            color: accent ?? colors.textOnInk,
            letterSpacing: -0.2,
            marginBottom: 3,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: fontFamily.ui,
            fontSize: 27,
            fontWeight: typeTokens.weights.regular,
            color: colors.textOnInkMuted,
            letterSpacing: -0.1,
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
};
