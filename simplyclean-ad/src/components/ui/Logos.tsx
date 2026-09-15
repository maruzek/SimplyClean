import React from 'react';
import {useCurrentFrame} from 'remotion';
import {colors} from '../../brand';

/**
 * Iconography.
 *
 * ── THIRD-PARTY BRAND MARKS ────────────────────────────────────────────────────
 * `AirbnbMark` and `BookingMark` use the REAL brand glyph geometry, taken from the
 * Simple Icons dataset (https://simpleicons.org), which is published under CC0 1.0.
 * The source SVGs are kept in `assets/logos/` alongside their licence, so the
 * provenance is auditable rather than being a hand-drawn approximation.
 *
 *   Airbnb      glyph from simple-icons "airbnb"       brand colour #FF5A5F
 *   Booking.com glyph from simple-icons "bookingdotcom" brand colour #003B95
 *
 * Displaying a third party's mark to indicate an integration is nominative use, which
 * is exactly what an integration directory does. These are still trademarks of their
 * owners and SimplyClean is not affiliated with them.
 *
 * Note the Booking.com icon is a solid square with the "B" knocked out (it relies on
 * an even-odd fill). Because our connector tile already draws the brand-coloured
 * rounded square, we render ONLY the "B" and the dot in white on top of it — which
 * reproduces the real app icon more faithfully than the knockout version would.
 */

type IconProps = {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
};

/** Official Airbnb "bélo" glyph. Designed for a 24×24 viewBox. */
export const AirbnbMark: React.FC<IconProps> = ({size = 40, color = '#fff', style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <path
      fill={color}
      d="M12.001 18.275c-1.353-1.697-2.148-3.184-2.413-4.457-.263-1.027-.16-1.848.291-2.465.477-.71 1.188-1.056 2.121-1.056s1.643.345 2.12 1.063c.446.61.558 1.432.286 2.465-.291 1.298-1.085 2.785-2.412 4.458zm9.601 1.14c-.185 1.246-1.034 2.28-2.2 2.783-2.253.98-4.483-.583-6.392-2.704 3.157-3.951 3.74-7.028 2.385-9.018-.795-1.14-1.933-1.695-3.394-1.695-2.944 0-4.563 2.49-3.927 5.382.37 1.565 1.352 3.343 2.917 5.332-.98 1.085-1.91 1.856-2.732 2.333-.636.344-1.245.558-1.828.609-2.679.399-4.778-2.2-3.825-4.88.132-.345.395-.98.845-1.961l.025-.053c1.464-3.178 3.242-6.79 5.285-10.795l.053-.132.58-1.116c.45-.822.635-1.19 1.351-1.643.346-.21.77-.315 1.246-.315.954 0 1.698.558 2.016 1.007.158.239.345.557.582.953l.558 1.089.08.159c2.041 4.004 3.821 7.608 5.279 10.794l.026.025.533 1.22.318.764c.243.613.294 1.222.213 1.858zm1.22-2.39c-.186-.583-.505-1.271-.9-2.094v-.03c-1.889-4.006-3.642-7.608-5.307-10.844l-.111-.163C15.317 1.461 14.468 0 12.001 0c-2.44 0-3.476 1.695-4.535 3.898l-.081.16c-1.669 3.236-3.421 6.843-5.303 10.847v.053l-.559 1.22c-.21.504-.317.768-.345.847C-.172 20.74 2.611 24 5.98 24c.027 0 .132 0 .265-.027h.372c1.75-.213 3.554-1.325 5.384-3.317 1.829 1.989 3.635 3.104 5.382 3.317h.372c.133.027.239.027.265.027 3.37.003 6.152-3.261 4.802-6.975z"
    />
  </svg>
);

/** Official Booking.com "B" + accent dot, to sit on a #003B95 tile. */
export const BookingMark: React.FC<IconProps> = ({size = 40, color = '#fff', style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <path
      fill={color}
      d="M8.575 6.563h2.658c2.108 0 3.473 1.15 3.473 2.898 0 1.15-.575 1.82-.91 2.108l-.287.263.335.192c.815.479 1.318 1.389 1.318 2.395 0 1.988-1.51 3.257-3.857 3.257H7.449V7.713c0-.623.503-1.126 1.126-1.15zm1.7 1.868c-.479.024-.694.264-.694.79v1.893h1.676c.958 0 1.294-.743 1.294-1.365 0-.815-.503-1.318-1.318-1.318zm-.096 4.36c-.407.071-.598.31-.598.79v2.251h1.868c.934 0 1.509-.55 1.509-1.533 0-.934-.599-1.509-1.51-1.509zm7.737 2.394c.743 0 1.341.599 1.341 1.342a1.34 1.34 0 0 1-1.341 1.341 1.355 1.355 0 0 1-1.341-1.341c0-.743.598-1.342 1.34-1.342z"
    />
  </svg>
);

/**
 * The product mark: two broken arcs forming a cycle (turnover repeats) with a
 * sparkle at the centre (the room comes back clean). Meaningful rather than arbitrary.
 */
export const BrandMark: React.FC<IconProps & {accentColor?: string}> = ({
  size = 64,
  color = colors.emerald,
  accentColor = colors.amber,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style} fill="none">
    <path
      d="M18.1 38.4 A34 34 0 0 1 81.9 38.4"
      stroke={color}
      strokeWidth={11}
      strokeLinecap="round"
    />
    <path
      d="M81.9 61.6 A34 34 0 0 1 18.1 61.6"
      stroke={color}
      strokeWidth={11}
      strokeLinecap="round"
    />
    <path
      d="M50 36 L54.4 45.6 L64 50 L54.4 54.4 L50 64 L45.6 54.4 L36 50 L45.6 45.6 Z"
      fill={accentColor}
    />
  </svg>
);

/** Amber warning triangle — the "Cleaning: not scheduled" state. */
export const WarningIcon: React.FC<IconProps> = ({size = 40, color = colors.amber, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style} fill="none">
    <path d="M50 14 L92 86 H8 Z" stroke={color} strokeWidth={9} strokeLinejoin="round" />
    <rect x="45.5" y="40" width="9" height="24" rx="4.5" fill={color} />
    <circle cx="50" cy="73" r="5.5" fill={color} />
  </svg>
);

/**
 * The success checkmark. `progress` (0→1) drives a stroke draw-on.
 * `pathLength={1}` normalises the path so the dash maths works without measuring.
 */
export const CheckIcon: React.FC<IconProps & {progress?: number; ring?: boolean}> = ({
  size = 40,
  color = colors.emerald,
  progress = 1,
  ring = true,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style} fill="none">
    {ring ? (
      <circle cx="50" cy="50" r="38" stroke={color} strokeWidth={7} opacity={0.22} />
    ) : null}
    <path
      d="M30 51.5 L44 65 L70 36"
      stroke={color}
      strokeWidth={10}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - Math.max(0, Math.min(1, progress))}
    />
  </svg>
);

/** Calendar glyph for the booking timeline rows. */
export const CalendarIcon: React.FC<IconProps> = ({
  size = 40,
  color = colors.textOnInkMuted,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style} fill="none">
    <rect x="12" y="20" width="76" height="68" rx="10" stroke={color} strokeWidth={7} />
    <path d="M12 40 H88" stroke={color} strokeWidth={7} />
    <path d="M32 10 V26 M68 10 V26" stroke={color} strokeWidth={7} strokeLinecap="round" />
  </svg>
);

/** Sparkle used for the "cleaned" accent. */
export const SparkleIcon: React.FC<IconProps> = ({size = 40, color = colors.emerald, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style} fill="none">
    <path
      d="M50 8 L58.5 41.5 L92 50 L58.5 58.5 L50 92 L41.5 58.5 L8 50 L41.5 41.5 Z"
      fill={color}
    />
  </svg>
);

/** Small status dot with an optional expanding pulse ring. */
export const StatusDot: React.FC<IconProps & {pulse?: number}> = ({
  size = 14,
  color = colors.emerald,
  pulse = 0,
  style,
}) => (
  <span
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: color,
      display: 'inline-block',
      boxShadow: `0 0 0 ${pulse * 10}px ${color}${pulse > 0 ? '22' : '00'}`,
      ...style,
    }}
  />
);

/** Padlock, used in the URL bar and on the consent dialog. Real OAuth screens show one. */
export const LockIcon: React.FC<IconProps> = ({
  size = 16,
  color = colors.textOnPaperMuted,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <rect x="4" y="10.5" width="16" height="11" rx="2.6" stroke={color} strokeWidth="2" />
    <path d="M7.5 10.5V7.8a4.5 4.5 0 0 1 9 0v2.7" stroke={color} strokeWidth="2" />
  </svg>
);

/** Shield with a tick — the "your data is safe" cue on consent screens. */
export const ShieldIcon: React.FC<IconProps> = ({size = 18, color = colors.emerald, style}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <path
      d="M12 2.5 20 6v6c0 5-3.4 8.4-8 9.5C7.4 20.4 4 17 4 12V6z"
      stroke={color}
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
    <path
      d="M8.6 12.2l2.4 2.4 4.4-4.8"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Chevron for "next" affordances and list rows. */
export const ChevronRight: React.FC<IconProps> = ({
  size = 18,
  color = colors.textOnPaperMuted,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <path
      d="M9 5l7 7-7 7"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Circular arrow, for the "syncing" state. */
export const RefreshIcon: React.FC<IconProps> = ({
  size = 18,
  color = colors.textOnPaperMuted,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style} fill="none">
    <path
      d="M20 12a8 8 0 1 1-2.6-5.9"
      stroke={color}
      strokeWidth="2.1"
      strokeLinecap="round"
    />
    <path
      d="M20 4.5V10h-5.5"
      stroke={color}
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * A realistic indeterminate spinner.
 *
 * A fixed-length arc rotating at constant speed is the giveaway of a fake UI. Real
 * spinners (Material, iOS) sweep and retract: the arc grows to roughly three quarters
 * and shrinks back, while the whole thing rotates continuously. This reproduces that.
 *
 * One full sweep-and-retract cycle is 42 frames (1.4 s) at 30 fps.
 */
export const Spinner: React.FC<{
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}> = ({size = 22, color = '#fff', strokeWidth = 2.6, style}) => {
  const frame = useCurrentFrame();

  const CYCLE = 42;
  const t = (frame % CYCLE) / CYCLE;
  // grow over the first half, retract over the second — eased at both ends
  const eased = t < 0.5 ? 1 - Math.pow(1 - t * 2, 3) : Math.pow((1 - t) * 2, 3);
  const arc = 8 + 68 * eased;
  const rotation = (frame / CYCLE) * 360;

  const r = (48 - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      style={{transform: `rotate(${rotation}deg)`, ...style}}
    >
      <circle
        cx="48"
        cy="48"
        r={r}
        stroke={color}
        strokeOpacity={0.28}
        strokeWidth={strokeWidth * 2}
        fill="none"
      />
      <circle
        cx="48"
        cy="48"
        r={r}
        stroke={color}
        strokeWidth={strokeWidth * 2}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${(arc / 100) * circumference} ${circumference}`}
      />
    </svg>
  );
};
