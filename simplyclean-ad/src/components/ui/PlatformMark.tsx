import React from 'react';
import {PLATFORMS, brand, type Platform} from '../../brand';
import {AirbnbMark, BookingMark} from './Logos';
import {RoomBookMark, StayNestMark} from './StandInMarks';

/** The two platforms shown in the connector grid, chosen by `brand.logoMode`. */
export const platforms = PLATFORMS[brand.logoMode];

/**
 * Renders whichever mark a platform declares.
 *
 * Swapping `brand.logoMode` in src/brand.ts swaps every appearance of these marks across
 * the whole ad — tiles, the consent dialog, badges — with no other edit. See
 * docs/LEGAL-BRAND-USE.md for why both variants exist.
 */
export const PlatformMark: React.FC<{
  mark: Platform['mark'];
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({mark, size = 44, color = '#fff', style}) => {
  switch (mark) {
    case 'airbnb':
      return <AirbnbMark size={size} color={color} style={style} />;
    case 'booking':
      return <BookingMark size={size} color={color} style={style} />;
    case 'standinA':
      return <StayNestMark size={size} color={color} style={style} />;
    case 'standinB':
      return <RoomBookMark size={size} color={color} style={style} />;
    default:
      return null;
  }
};
