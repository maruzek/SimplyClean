import React from 'react';
import {AbsoluteFill} from 'remotion';
import {brand, colors, typography} from './brand';
import {fontFamily} from './fonts';
import {BrandMark} from './components/ui/Logos';

/**
 * Standalone logo compositions, for exporting the brand mark as an asset for the website,
 * decks and social profiles.
 *
 * Why render it rather than crop it out of a video frame: the mark is pure SVG, so it
 * renders crisply at any size, and because nothing here paints an opaque background the PNG
 * comes out with a real alpha channel. Cropping a frame would bake in whatever background
 * that frame happened to have.
 *
 * Rendered with:
 *   npx remotion still src/index.ts BrandLogo        out/logo/simplyclean-mark-1024.png
 *   npx remotion still src/index.ts BrandLogoWhite   out/logo/simplyclean-mark-white-1024.png
 *   npx remotion still src/index.ts BrandLockup      out/logo/simplyclean-lockup.png
 *
 * Compositions are registered in src/Root.tsx.
 */
export type LogoVariant = 'colour' | 'white' | 'ink';

export const BrandLogo: React.FC<{
  variant?: LogoVariant;
  /** Show the wordmark beside the mark — a site-header lockup rather than a standalone mark. */
  lockup?: boolean;
}> = ({variant = 'colour', lockup = false}) => {
  const arcColor =
    variant === 'white' ? '#FFFFFF' : variant === 'ink' ? colors.ink : colors.emerald;
  const sparkColor =
    variant === 'white' ? '#FFFFFF' : variant === 'ink' ? colors.ink : colors.amber;
  const wordColor =
    variant === 'white' ? '#FFFFFF' : variant === 'ink' ? colors.ink : colors.textOnPaper;

  return (
    <AbsoluteFill
      style={{
        // Deliberately no background — transparency is the whole point of this composition.
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: lockup ? 44 : 0,
      }}
    >
      {/* The mark sits inside a 100-unit viewBox whose visible content spans roughly
          6–94, so there is already inherent clear space; no extra padding needed. */}
      <BrandMark
        size={lockup ? 300 : 800}
        color={arcColor}
        accentColor={sparkColor}
      />

      {lockup ? (
        <span
          style={{
            fontFamily: fontFamily.display,
            fontSize: 190,
            fontWeight: typography.weights.extrabold,
            color: wordColor,
            letterSpacing: -7,
            lineHeight: 1,
          }}
        >
          {brand.name}
        </span>
      ) : null}
    </AbsoluteFill>
  );
};
