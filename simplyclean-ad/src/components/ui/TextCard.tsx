import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, motion, typography as typeTokens} from '../../brand';
import {fontFamily} from '../../fonts';

/**
 * A stack of text lines that rise and fade in on a stagger.
 *
 * `emphasisIndex` renders one line heavier — used to land the punchline of a card
 * ("Four hours." / "Not scheduled") without changing size and breaking the rhythm.
 */
export const TextCard: React.FC<{
  lines: string[];
  /** Frame the first line starts, relative to the enclosing Sequence. */
  start?: number;
  /** Frames between each line's entrance. */
  step?: number;
  fontSize?: number;
  lineHeight?: number;
  color?: string;
  emphasisIndex?: number;
  emphasisColor?: string;
  weight?: number;
  family?: 'display' | 'ui';
  letterSpacing?: number;
  align?: 'left' | 'center';
  /** Extra pixels of rise on entrance. */
  rise?: number;
  style?: React.CSSProperties;
}> = ({
  lines,
  start = 0,
  step = 7,
  fontSize = 44,
  lineHeight = 1.32,
  color = colors.textOnInk,
  emphasisIndex,
  emphasisColor,
  weight = typeTokens.weights.semibold,
  family = 'display',
  letterSpacing = -0.4,
  align = 'left',
  rise = 16,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        textAlign: align,
        ...style,
      }}
    >
      {lines.map((line, i) => {
        const s = spring({
          frame,
          fps,
          delay: start + i * step,
          config: motion.spring,
          durationInFrames: 26,
        });
        const isEmphasis = emphasisIndex === i;
        return (
          <div
            key={`${line}-${i}`}
            style={{
              fontFamily: family === 'display' ? fontFamily.display : fontFamily.ui,
              fontSize,
              lineHeight,
              letterSpacing,
              fontWeight: isEmphasis ? typeTokens.weights.extrabold : weight,
              color: isEmphasis ? (emphasisColor ?? color) : color,
              opacity: s,
              transform: `translateY(${(1 - s) * rise}px)`,
              whiteSpace: 'pre',
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};
