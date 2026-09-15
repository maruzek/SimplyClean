import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors, typography as typeTokens} from '../brand';
import {fontFamily} from '../fonts';
import {easeOutCubic, easeOutQuint, progress, track} from '../lib/anim';
import {Notification} from '../components/ui/Notification';
import {AirbnbMark, WarningIcon} from '../components/ui/Logos';
import {Vignette} from '../components/ui/Vignette';

/**
 * BEAT 1 — THE HOOK. 90 frames = 3s.
 *
 * Two notifications, and the entire product thesis is in them: a guest is arriving
 * tomorrow and nobody is coming to clean. No logo, no product name, no explanation.
 *
 * We frame it on a faint panel that hints at a phone screen without drawing a literal
 * phone — a drawn device at this scale would shrink the type below the size where it
 * reads on a phone viewing the ad, and text is our only storytelling device.
 */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();

  // A slow push-in so the frame is never static.
  const scale = track(frame, [[0, 1.0], [90, 1.035]], easeOutQuint);
  const lift = track(frame, [[0, 10], [90, -6]], easeOutQuint);
  const sceneIn = progress(frame, 0, 16, easeOutCubic);

  return (
    <AbsoluteFill style={{background: colors.ink, justifyContent: 'center', alignItems: 'center'}}>
      {/* Pool of screen light behind the device panel */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 46% 52% at 50% 46%, rgba(122,150,180,0.20) 0%, rgba(13,17,23,0) 72%)',
        }}
      />

      <div
        style={{
          transform: `scale(${scale}) translateY(${lift}px)`,
          opacity: sceneIn,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Faint device panel — implies a screen without drawing a phone */}
        <div
          style={{
            position: 'absolute',
            top: -74,
            width: 760,
            height: 620,
            borderRadius: 52,
            background: 'rgba(255,255,255,0.028)',
            border: '1px solid rgba(255,255,255,0.055)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        />

        <div
          style={{
            fontFamily: fontFamily.ui,
            fontSize: 19,
            fontWeight: typeTokens.weights.semibold,
            color: colors.textOnInkMuted,
            letterSpacing: 5,
            textTransform: 'uppercase',
            marginBottom: 30,
            opacity: progress(frame, 4, 16, easeOutCubic),
          }}
        >
          Thursday &middot; 11:04
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: 16, position: 'relative'}}>
          <Notification
            start={14}
            icon={<AirbnbMark size={36} />}
            app="Airbnb"
            title="New booking"
            body="Guest arrives tomorrow · 15:00"
          />
          <Notification
            start={44}
            icon={<WarningIcon size={34} />}
            app="Cleaning"
            title="Not scheduled"
            body="No cleaner assigned for this turnover"
            accent={colors.amber}
          />
        </div>
      </div>

      <Vignette strength={0.62} />
    </AbsoluteFill>
  );
};
