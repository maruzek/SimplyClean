/**
 * Brand configuration — SINGLE SOURCE OF TRUTH.
 *
 * Swap `name`, `domain` and `tagline` here and every composition updates.
 * Nothing else in the codebase hardcodes the brand name.
 */
export const brand = {
  name: 'SimplyClean',
  domain: 'simplyclean.co',
  tagline: 'Turnover cleaning for hosts\nwho do it themselves.',
  cta: 'Connect your first property',
  /** Shown in the mock OAuth dialog: "<App> wants to access your <provider> account" */
  legalName: 'SimplyClean',
  /** Shown on the mock account row and in the consent dialog, for realism. */
  accountEmail: 'anna.k@simplyclean.co',
  accountName: 'Anna K.',

  /**
   * WHICH BOOKING-PLATFORM MARKS THE CONNECTOR SCREENS SHOW.
   *
   *   'official' — the real Airbnb and Booking.com glyphs and names.
   *                This is what was asked for, and it is what most real products do in
   *                an integrations directory. It is ALSO the setting with legal exposure,
   *                because Airbnb's trademark terms forbid using the Bélo, featuring the
   *                Rausch colour, putting "Airbnb" in a headline, or implying endorsement
   *                without written permission — and an advertisement is commercial use.
   *                ⚠️  Read docs/LEGAL-BRAND-USE.md before shipping this.
   *
   *   'standin'  — invented platform names with abstract marks. Visually equivalent, and
   *                it ships with no third-party trademark question at all.
   *
   * One-word change; both variants are implemented and rendered from this flag.
   */
  logoMode: 'official' as LogoMode,
} as const;

export type LogoMode = 'official' | 'standin';

/**
 * The platform shown in the left-hand connector tile.
 * Both a real and a stand-in identity, selected by `brand.logoMode`.
 */
export type Platform = {
  name: string;
  /** Colour of the tile behind the glyph. */
  color: string;
  /** The mark to draw inside the tile. */
  mark: 'airbnb' | 'booking' | 'standinA' | 'standinB';
};

export type PlatformPair = {primary: Platform; secondary: Platform};

export const PLATFORMS: Record<LogoMode, PlatformPair> = {
  official: {
    primary: {name: 'Airbnb', color: '#FF5A5F', mark: 'airbnb'},
    secondary: {name: 'Booking.com', color: '#003B95', mark: 'booking'},
  },
  standin: {
    // Invented platforms. Deliberately given their own colours so nothing here reads as
    // a recoloured version of a real brand.
    primary: {name: 'StayNest', color: '#E0607A', mark: 'standinA'},
    secondary: {name: 'RoomBook', color: '#2F6F6B', mark: 'standinB'},
  },
};

/**
 * Colour system.
 *
 * The narrative logic matters more than the palette itself: amber is the colour of an
 * UNRESOLVED problem (the "Cleaning: not scheduled" notification, the gap in the booking
 * timeline). Emerald is the colour of RESOLUTION. The ad literally watches amber turn into
 * emerald, so these two are reserved and must not be used decoratively.
 */
export const colors = {
  // Neutrals
  ink: '#0D1117',
  inkSoft: '#1A2028',
  inkLine: '#2A323D',
  paper: '#FAF8F4',
  paperSoft: '#F1EDE6',
  paperLine: '#E2DCD2',

  /**
   * Hairlines.
   *
   * Near-neutral and low-chroma ON PURPOSE. H.264 4:2:0 subsamples colour, so a saturated
   * 1px line smears and shimmers between frames while a desaturated one survives. These
   * are the values to use for borders and dividers — not `paperLine`, which is warm enough
   * to crawl at 1px, and definitely not `#ccc`.
   */
  hairline: 'rgba(13,17,23,0.09)',
  hairlineStrong: 'rgba(13,17,23,0.14)',

  // Reserved narrative colours — do not use for decoration
  amber: '#E9A23B', // problem / pending
  amberSoft: '#FDF3E2',
  amberDeep: '#B87A1E',
  emerald: '#12A17A', // resolved / success
  emeraldSoft: '#E6F6F1',
  emeraldDeep: '#0B7A5B',

  // Type
  textOnPaper: '#14181F',
  textOnPaperMuted: '#6B7280',
  textOnPaperFaint: '#9AA1AC',
  textOnInk: '#F5F3EF',
  textOnInkMuted: '#9AA4B2',

  // Phone notification chrome
  notifyBg: 'rgba(28, 32, 38, 0.86)',
} as const;

/**
 * Typography.
 *
 * Manrope for display (geometric, warm, slightly humanist — reads friendly rather than
 * corporate). Inter for UI chrome and body (neutral, excellent at small sizes, which
 * matters because we simulate real product UI at 1080p).
 */
export const typography = {
  display: 'Manrope',
  ui: 'Inter',
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
} as const;

/**
 * Elevation system.
 *
 * Exactly three steps, borrowed from Tailwind's scale and never interpolated. Inventing
 * intermediate blur values is how a UI starts to look hand-drawn. `hairline` on top of
 * `sm` is what makes a card read as a real surface at 1080p.
 */
export const elevation = {
  sm: '0 1px 3px 0 rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)',
  md: '0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)',
  xl: '0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)',
  /** The browser window gets its own, larger, because it is the "device". */
  window: '0 40px 80px -12px rgba(13,17,23,0.42), 0 12px 28px -8px rgba(13,17,23,0.24)',
} as const;

/**
 * Motion language.
 *
 * ── THE RULE, AND WHY IT CHANGED ──────────────────────────────────────────────
 * Earlier revisions drove almost every UI animation with `spring()`. That was wrong, and
 * it was the main reason the mock UI read as motion graphics rather than software.
 *
 * Real interface motion is SHORT and DECISIVE: a hover is ~150–200 ms, a dialog entrance
 * is ~300–400 ms, and nothing overshoots unless it is deliberately playful. At 30 fps a
 * 150 ms hover is only 4.5 frames — there is physically no room for a spring to resolve,
 * so a spring there reads as animation rather than response.
 *
 * So: `bezier` + `dur` (Material 3 tokens, in FRAMES at 30 fps) for all interface motion.
 * Springs are kept only for entrances that should feel physical, and one UI spring that is
 * heavily damped (no visible overshoot).
 */
export const motion = {
  /** Heavily damped — no visible overshoot. The only spring used on UI surfaces. */
  springUI: {damping: 200},
  /** Entrances on live-action overlays, where a little personality is welcome. */
  spring: {damping: 22, mass: 0.9, stiffness: 130},
  /** Large surfaces on the live-action beats. */
  springSoft: {damping: 30, mass: 1.1, stiffness: 110},
  /** Snappy response for on-screen text accents. */
  springSnap: {damping: 18, mass: 0.6, stiffness: 220},
} as const;

/**
 * Duration tokens, converted from Material 3's milliseconds to frames at 30 fps.
 *
 *   200 ms  →  6 frames   selection controls, hover in/out, press
 *   300 ms  →  9 frames   dialog and panel entrances (M3 "medium2")
 *   400 ms  → 12 frames   larger surfaces, emphasised transitions
 *   500 ms  → 15 frames   card → full screen
 */
export const dur = {
  hover: 6,
  press: 4,
  small: 9,
  medium: 12,
  large: 15,
  /** Loading states are deliberately slower — real networks are not instant. */
  loading: 27,
} as const;
