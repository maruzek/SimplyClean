import React from 'react';

/**
 * INVENTED STAND-IN PLATFORM MARKS.
 *
 * These exist for one reason: shipping a real third party's trademark in a commercial
 * advertisement is a legal question, and Airbnb's published terms appear to prohibit the
 * way this ad uses theirs. See `docs/LEGAL-BRAND-USE.md`.
 *
 * They are deliberately ABSTRACT — an arch, a listing card — and deliberately given their
 * own colours, so that nothing here reads as a recoloured version of somebody else's brand.
 * The integration story lands exactly the same way; only the risk goes away.
 *
 * These are original shapes drawn for this project, not derived from any existing mark.
 */

type IconProps = {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
};

/**
 * StayNest — the left-hand tile.
 * An arched doorway with a handle: read as "lodging", without resembling any real logo.
 */
export const StayNestMark: React.FC<IconProps> = ({size = 44, color = '#fff', style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <path
      d="M5 21V11.5a7 7 0 0 1 14 0V21"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
    />
    <circle cx="12" cy="14.4" r="2.5" fill={color} />
    <path d="M3.2 21h17.6" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
  </svg>
);

/**
 * RoomBook — the right-hand tile.
 * A listing card with a folded corner: read as "a booked stay".
 */
export const RoomBookMark: React.FC<IconProps> = ({size = 44, color = '#fff', style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <path
      d="M5.5 3.2h8.2l5.1 5.1v12.5c0 .6-.5 1.1-1.1 1.1H5.5c-.6 0-1.1-.5-1.1-1.1V4.3c0-.6.5-1.1 1.1-1.1z"
      stroke={color}
      strokeWidth={2.3}
      strokeLinejoin="round"
    />
    <path
      d="M13.4 3.4v5h5"
      stroke={color}
      strokeWidth={2.3}
      strokeLinejoin="round"
    />
    <path d="M8 14.2h7" stroke={color} strokeWidth={2.3} strokeLinecap="round" />
    <path d="M8 17.6h4" stroke={color} strokeWidth={2.3} strokeLinecap="round" />
  </svg>
);
