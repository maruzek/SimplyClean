import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {brand, colors, typography as typeTokens} from '../../brand';
import {fontFamily} from '../../fonts';
import {easeOutQuint, progress} from '../../lib/anim';
import {BrandMark} from '../ui/Logos';
import {Rule} from '../ui/Rule';

/**
 * BEAT 7 — END CARD, over the closing live-action shot. 180 frames.
 *
 * Two deliberate choices:
 *
 *  1. It resolves by ~frame 135 and then holds completely still. No drift, no pulse, no
 *     fade to black. Cutting to black at the last second reads as amateur; a held final
 *     frame reads as confident.
 *  2. The scrim is a soft gradient, not a hard bar, so the host's face still reads
 *     behind the type. We want the last thing the audience sees to be his relief, with
 *     the brand attached to it — not a graphic that replaced him.
 */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();

  const cardIn = progress(frame, 45, 26, easeOutQuint);
  const ctaIn = progress(frame, 88, 22, easeOutQuint);

  return (
    <AbsoluteFill>
      {/* Soft gradient scrim across the lower half */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(to top, rgba(6,8,11,0.88) 0%, rgba(6,8,11,0.62) 34%, rgba(6,8,11,0.16) 62%, rgba(6,8,11,0) 84%)',
          opacity: cardIn,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 108,
          bottom: 92,
          opacity: cardIn,
          transform: `translateY(${(1 - cardIn) * 22}px)`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20}}>
          <BrandMark size={46} />
          <span
            style={{
              fontFamily: fontFamily.display,
              fontSize: 36,
              fontWeight: typeTokens.weights.extrabold,
              color: colors.textOnInk,
              letterSpacing: -1.2,
            }}
          >
            {brand.name}
          </span>
        </div>

        <div
          style={{
            fontFamily: fontFamily.display,
            fontSize: 42,
            fontWeight: typeTokens.weights.semibold,
            color: 'rgba(245,243,239,0.94)',
            lineHeight: 1.28,
            letterSpacing: -1.2,
            whiteSpace: 'pre',
            marginBottom: 24,
          }}
        >
          {brand.tagline}
        </div>

        <Rule start={60} duration={18} width={132} height={4} color={colors.emerald} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            marginTop: 28,
            opacity: ctaIn,
            transform: `translateY(${(1 - ctaIn) * 14}px)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '17px 32px',
              borderRadius: 15,
              background: colors.emerald,
              boxShadow: `0 14px 34px rgba(18,161,122,0.36)`,
            }}
          >
            <span
              style={{
                fontFamily: fontFamily.ui,
                fontSize: 20,
                fontWeight: typeTokens.weights.semibold,
                color: '#FFFFFF',
                letterSpacing: -0.2,
              }}
            >
              {brand.cta}
            </span>
            <svg width={19} height={19} viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h13M13 6.5l5.5 5.5L13 17.5"
                stroke="#FFFFFF"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <span
            style={{
              fontFamily: fontFamily.ui,
              fontSize: 21,
              color: 'rgba(245,243,239,0.72)',
              letterSpacing: 0.2,
            }}
          >
            {brand.domain}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * A very subtle grain across the whole live-action frame.
 *
 * Two clips shot on the same day can still differ in noise floor, and the jump in grain
 * is one of the tells that gives away a two-source edit. A light grain unifies them.
 *
 * Implementation note: the texture is generated ONCE and then scrolled by animating
 * `backgroundPosition`. Regenerating a feTurbulence data-URI for every one of 1800 frames
 * would be a large, pointless cost in the render.
 */
const GRAIN_TEXTURE = `data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' seed='4'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.65'/></svg>",
)}`;

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.035}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
        backgroundImage: `url("${GRAIN_TEXTURE}")`,
        backgroundRepeat: 'repeat',
        backgroundPosition: `${(frame * 17) % 200}px ${(frame * 29) % 200}px`,
      }}
    />
  );
};
