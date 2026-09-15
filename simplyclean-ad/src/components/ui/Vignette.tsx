import React from 'react';
import {AbsoluteFill} from 'remotion';

/**
 * Film-look finishing layer.
 *
 * Applied over live-action footage to make two separately-shot clips feel like one
 * film: a vignette to pull the eye centre-frame, and a very light grain that hides
 * compression differences between the two sources.
 *
 * Grain is generated deterministically from the frame number, never Math.random(),
 * so renders are reproducible.
 */
export const Vignette: React.FC<{
  /** 0→1 strength of the corner darkening. */
  strength?: number;
  /** Warm or cool tint pushed into the corners. */
  tint?: string;
}> = ({strength = 0.5, tint = 'rgba(0,0,0,1)'}) => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 78% 78% at 50% 48%, rgba(0,0,0,0) 42%, ${tint} 100%)`,
        opacity: strength,
        pointerEvents: 'none',
      }}
    />
  );
};

/** A scrim behind lower-left text so overlaid copy stays legible on any footage.
 * Asymmetric on purpose — a symmetric dark box would read as a mistake.
 */
export const TextScrim: React.FC<{opacity?: number; height?: number}> = ({
  opacity = 0.72,
  height = 62,
}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(to top, rgba(6,8,11,${opacity}) 0%, rgba(6,8,11,${opacity * 0.55}) ${height * 0.45}%, rgba(6,8,11,0) ${height}%)`,
      pointerEvents: 'none',
    }}
  />
);
