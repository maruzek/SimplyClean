import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {brand, colors} from '../brand';
import {fontFamily} from '../fonts';
import {easeOutCubic, easeOutQuint, progress} from '../lib/anim';
import {TextCard} from '../components/ui/TextCard';
import {Rule} from '../components/ui/Rule';
import {BrandMark} from '../components/ui/Logos';

/**
 * BEAT 3 — TITLE CARD. 90 frames = 3s.
 *
 * The emotional hinge: the room was cold and unresolved, and this is where the film
 * warms up and the music resolves. Kept deliberately spare — mark, two lines, a rule.
 * Anything more here competes with the connector demo that follows.
 *
 * The cut into this beat is hidden by <Sweep> in the Ad composition, so this component
 * holds a single static (if slowly drifting) card.
 */
export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();

  // Very slow scale so the card breathes rather than sitting dead.
  const scale = 1 + progress(frame, 0, 90, easeOutQuint) * 0.016;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(165deg, #FBF9F5 0%, #F5F1E9 60%, #EFE9DE 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Warm pool of light behind the lockup */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 54% 50% at 50% 48%, rgba(233,162,59,0.10) 0%, rgba(250,248,244,0) 70%)',
        }}
      />

      <div
        style={{
          transform: `scale(${scale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{opacity: progress(frame, 6, 16, easeOutCubic), marginBottom: 34}}>
          <BrandMark size={78} />
        </div>

        <TextCard
          align="center"
          lines={['Cleaning that runs', 'on your bookings.']}
          start={14}
          step={9}
          fontSize={86}
          lineHeight={1.14}
          letterSpacing={-2.6}
          color={colors.textOnPaper}
          weight={800}
        />

        <Rule
          start={34}
          duration={18}
          width={210}
          height={5}
          color={colors.amber}
          style={{marginTop: 38}}
        />

        <div
          style={{
            fontFamily: fontFamily.ui,
            fontSize: 20,
            color: colors.textOnPaperMuted,
            letterSpacing: 4,
            textTransform: 'uppercase',
            fontWeight: 600,
            marginTop: 26,
            opacity: progress(frame, 46, 18, easeOutCubic),
          }}
        >
          {brand.domain}
        </div>
      </div>
    </AbsoluteFill>
  );
};
