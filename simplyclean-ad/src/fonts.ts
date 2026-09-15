import {loadFont as loadManrope} from '@remotion/google-fonts/Manrope';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';

/**
 * Fonts are fetched once from Google's CDN and cached by Remotion on first render.
 *
 * We request only the weights and the latin subset we actually use — loading every
 * weight of Inter would add ~1 MB and a few hundred ms to every render for no reason.
 */
const manrope = loadManrope('normal', {
  weights: ['500', '600', '700', '800'],
  subsets: ['latin'],
});

const inter = loadInter('normal', {
  weights: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export const fontFamily = {
  display: manrope.fontFamily,
  ui: inter.fontFamily,
} as const;
