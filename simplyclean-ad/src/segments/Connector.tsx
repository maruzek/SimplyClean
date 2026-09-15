import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {brand, colors, dur, elevation, typography} from '../brand';
import {
  EASE,
  easeInOutCubic,
  easeOutCubic,
  progress,
  smoothText,
  tabularNums,
  track,
  uiEnter,
  uiExit,
} from '../lib/anim';
import {fontFamily} from '../fonts';
import {AppHeader, BrowserWindow} from '../components/ui/AppWindow';
import {ConnectorTile} from '../components/ui/ConnectorTile';
import {Cursor} from '../components/ui/Cursor';
import {ConsentDialog} from '../components/ui/ConsentDialog';
import {PlatformMark, platforms} from '../components/ui/PlatformMark';
import {
  BrandMark,
  CalendarIcon,
  CheckIcon,
  SparkleIcon,
  StatusDot,
} from '../components/ui/Logos';

/**
 * BEAT 4 — THE CONNECTOR (hero). 660 frames = 22s.
 *
 * This is a third of the ad, so it carries the most craft. It was rebuilt after studying
 * how production Remotion studios and real product teams build connector flows. Four
 * decisions are worth recording, because each one is the difference between "a picture of
 * software" and "a screen recording":
 *
 *  1. **It has the states real flows have.** Consent → loading → connected → properties
 *     loading → resolved. The previous version jumped from the button straight to the
 *     result, skipping the two states every user actually recognises. Real connector flows
 *     (Plaid's, notably) have named LOADING and CONNECTED views between the permission
 *     screen and completion.
 *
 *  2. **The cursor hovers before it clicks.** A click with no preceding hover is the most
 *     common fake-UI tell. The tile visibly responds ~26 frames before the click, using
 *     Material's state-layer idea rather than an ad-hoc colour.
 *
 *  3. **Interface motion is bezier, not spring.** A hover is 6 frames; a dialog entrance is
 *     9. At 30 fps there is no room for a spring to resolve, which is exactly why a spring
 *     reads as animation rather than response. Springs now appear only on the on-screen
 *     text overlays over live action.
 *
 *  4. **Animating text is promoted to its own layer** (see `smoothText`) so Chrome stops
 *     snapping glyph baselines to whole pixels, which otherwise makes smooth moves stutter.
 */

// ── Layout ──────────────────────────────────────────────────────────────────────
// Window is 1400×860 centred in 1920×1080. These two cursor targets are the only
// hardcoded screen coordinates in the segment, and both were measured from rendered
// frames rather than derived on paper — an earlier version was 57px out and the cursor
// clicked the edge of the tile instead of its centre.
//
// ⚠️ If the empty-state padding, the tile size, or the window chrome height changes,
// re-render `--frame=172` (tile) and `--frame=280` (button) and re-measure.
const LAYOUT = {
  winW: 1400,
  winH: 860,
  /** Centre of the left-hand (primary) connector tile. */
  tile: {x: 861, y: 662},
  /** Centre of the primary "Continue" button in the consent dialog. */
  primary: {x: 1166, y: 757},
} as const;

// ── Beat timing, relative to this Sequence ──────────────────────────────────────
const T = {
  windowIn: 0,
  /** Browser loading bar reaches 100%. */
  loadDone: 26,
  tilesIn: 44,
  captionIn: 78,
  cursorIn: 112,
  /** Hover state lands well before the click, as it does in real use. */
  hoverTile: 146,
  clickTile: 172,
  dialogIn: 184,
  cursorToContinue: 246,
  hoverContinue: 264,
  clickContinue: 280,
  loadingState: 290,
  connectedState: 326,
  checkDone: 348,
  dialogOut: 368,
  skeletonIn: 378,
  propertyIn: 420,
  timelineIn: 470,
  jobIn: 522,
  /** Everything settles and holds from here. */
  settle: 600,
} as const;

/** A one-shot UI sound at an absolute frame within this Sequence. */
const Sfx: React.FC<{file: string; at: number; volume?: number}> = ({file, at, volume = 0.7}) => (
  <Sequence from={at} durationInFrames={40} name={`sfx ${file}`}>
    <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
  </Sequence>
);

export const Connector: React.FC = () => {
  const frame = useCurrentFrame();

  const primary = platforms.primary;
  const secondary = platforms.secondary;

  // Camera: a gentle push-in that never fully stops, so the frame is never dead.
  const camScale = track(frame, [[0, 1.08], [36, 1.0], [T.settle, 1.0], [660, 1.02]], easeOutCubic);
  const camY = track(frame, [[0, 22], [36, 0], [660, -8]], easeOutCubic);

  const windowIn = uiEnter(frame, T.windowIn, 30);
  // A real page load is not instant and does not complete linearly.
  const loadProgress = progress(frame, 2, 24, EASE.standard);

  // ── State machine ──────────────────────────────────────────────────────────
  const dialogVisible = frame >= T.dialogIn && frame < T.dialogOut + dur.small;
  const dialogState: 'prompt' | 'loading' | 'connected' =
    frame >= T.connectedState ? 'connected' : frame >= T.loadingState ? 'loading' : 'prompt';

  const dialogIn = uiEnter(frame, T.dialogIn, dur.small + 2);
  const dialogOut = uiExit(frame, T.dialogOut, dur.small);
  const dialogOpacity = dialogIn * (1 - dialogOut);
  const dialogScale = 0.97 + dialogIn * 0.03 - dialogOut * 0.02;

  const showSkeleton = frame >= T.skeletonIn && frame < T.propertyIn;
  const showConnected = frame >= T.propertyIn;

  // Empty state clears only once the dialog has finished collapsing, so the two never
  // cross-fade into a muddy double exposure (a real bug in an earlier revision).
  const emptyOpacity = 1 - uiExit(frame, T.dialogOut + 2, dur.small);
  const skeletonOpacity = uiEnter(frame, T.skeletonIn, dur.small) * (1 - uiExit(frame, T.propertyIn - 4, 8));

  // ── Interaction state ──────────────────────────────────────────────────────
  const tileHover = progress(frame, T.hoverTile, dur.hover, EASE.ui);
  const tilePress = track(
    frame,
    [
      [T.clickTile, 0],
      [T.clickTile + 2, 1],
      [T.clickTile + 8, 0],
    ],
    EASE.ui,
  );
  const primaryHover = progress(frame, T.hoverContinue, dur.hover, EASE.ui);
  const primaryPress = track(
    frame,
    [
      [T.clickContinue, 0],
      [T.clickContinue + 2, 1],
      [T.clickContinue + 7, 0],
    ],
    EASE.ui,
  );
  const checkProgress = progress(frame, T.connectedState + 6, 18, EASE.ui);

  const timelineProgress = progress(frame, T.timelineIn, 22, EASE.ui);
  const jobProgress = progress(frame, T.jobIn, 20, EASE.ui);

  // The cursor becomes a pointer over anything clickable — a real cursor does.
  const overTile = frame >= T.hoverTile - 4 && frame < T.dialogIn;
  const cursorAsset = overTile || (frame >= T.hoverContinue - 4 && frame < T.clickContinue + 6)
    ? 'handpointing'
    : 'default';

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(150deg, #F7F4EE 0%, #EFEAE1 52%, #E7E1D6 100%)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Soft studio light so the background is not a flat fill */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 62% 58% at 50% 42%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)',
        }}
      />

      <div
        style={{
          transform: `scale(${camScale}) translateY(${camY}px)`,
          opacity: windowIn,
          transformOrigin: '50% 46%',
        }}
      >
        <BrowserWindow
          width={LAYOUT.winW}
          height={LAYOUT.winH}
          loadProgress={loadProgress}
          url={`${brand.domain}/app/connections`}
        >
          <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            <AppHeader name={brand.name} />

            <div style={{flex: 1, position: 'relative', padding: '0 44px'}}>
              {/* ── Empty state ─────────────────────────────────────────── */}
              <div
                style={{
                  position: 'absolute',
                  inset: '0 44px',
                  paddingTop: 118,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: emptyOpacity,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 18,
                    background: colors.paperSoft,
                    border: `1px solid ${colors.hairline}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...smoothText,
                  }}
                >
                  <BrandMarkGlyph />
                </div>

                <div
                  style={{
                    fontFamily: fontFamily.display,
                    fontSize: 36,
                    lineHeight: 1.2,
                    fontWeight: typography.weights.bold,
                    color: colors.textOnPaper,
                    letterSpacing: -1,
                    marginTop: 20,
                    marginBottom: 8,
                    ...smoothText,
                  }}
                >
                  Connect a booking account
                </div>
                <div
                  style={{
                    fontFamily: fontFamily.ui,
                    fontSize: 18,
                    lineHeight: 1.5,
                    color: colors.textOnPaperMuted,
                    textAlign: 'center',
                    marginBottom: 30,
                  }}
                >
                  We&rsquo;ll find your properties and schedule
                  <br />
                  cleaning around your guests.
                </div>

                <div style={{display: 'flex', gap: 22}}>
                  <ConnectorTile
                    name={primary.name}
                    brandColor={primary.color}
                    mark={<PlatformMark mark={primary.mark} size={38} />}
                    hover={showConnected ? 0 : tileHover}
                    press={showConnected ? 0 : tilePress}
                    state={showConnected ? 'connected' : 'idle'}
                    delay={T.tilesIn}
                  />
                  <ConnectorTile
                    name={secondary.name}
                    brandColor={secondary.color}
                    mark={<PlatformMark mark={secondary.mark} size={38} />}
                    delay={T.tilesIn + 7}
                  />
                </div>

                <div
                  style={{
                    fontFamily: fontFamily.ui,
                    fontSize: 17,
                    color: colors.textOnPaperMuted,
                    marginTop: 24,
                    opacity: uiEnter(frame, T.captionIn, dur.small),
                  }}
                >
                  Two clicks. No calls. No contracts.
                </div>
              </div>

              {/* ── Properties loading (skeleton) ──────────────────────── */}
              {showSkeleton ? (
                <div
                  style={{
                    position: 'absolute',
                    inset: '0 44px',
                    paddingTop: 46,
                    opacity: skeletonOpacity,
                  }}
                >
                  <SkeletonRow width={210} height={16} delay={0} />
                  <div style={{height: 22}} />
                  <SkeletonCard frame={frame} />
                </div>
              ) : null}

              {/* ── Connected state ────────────────────────────────────── */}
              {showConnected ? (
                <div
                  style={{
                    position: 'absolute',
                    inset: '0 44px',
                    paddingTop: 40,
                    opacity: uiEnter(frame, T.propertyIn, dur.medium),
                  }}
                >
                  <PropertyCard progress={uiEnter(frame, T.propertyIn, dur.medium)} />
                  <BookingTimeline
                    draw={timelineProgress}
                    job={jobProgress}
                    showLabel={frame >= T.propertyIn + 6}
                    providerName={primary.name}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </BrowserWindow>
      </div>

      {/* ── Consent dialog ─────────────────────────────────────────────── */}
      {dialogVisible ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <AbsoluteFill
            style={{
              background: 'rgba(13,17,23,0.30)',
              opacity: dialogOpacity,
              backdropFilter: 'blur(3px)',
            }}
          />
          <ConsentDialog
            provider={primary}
            state={dialogState}
            primaryHover={primaryHover}
            primaryPress={primaryPress}
            checkProgress={checkProgress}
            opacity={dialogOpacity}
            style={{transform: `scale(${dialogScale})`}}
          />
        </AbsoluteFill>
      ) : null}

      {/* ── Cursor ─────────────────────────────────────────────────────── */}
      <AbsoluteFill>
        <Cursor
          cursor={cursorAsset}
          keys={[
            {frame: T.cursorIn, x: 1720, y: 1010},
            {frame: T.hoverTile, x: LAYOUT.tile.x, y: LAYOUT.tile.y},
            {frame: T.clickTile, x: LAYOUT.tile.x, y: LAYOUT.tile.y},
            {frame: T.cursorToContinue, x: LAYOUT.primary.x, y: LAYOUT.primary.y},
            {frame: T.clickContinue, x: LAYOUT.primary.x, y: LAYOUT.primary.y},
          ]}
          clicks={[T.clickTile, T.clickContinue]}
          opacity={track(
            frame,
            [
              [T.cursorIn - 4, 0],
              [T.cursorIn + 6, 1],
              [T.clickContinue + 12, 1],
              [T.clickContinue + 30, 0],
            ],
            easeInOutCubic,
          )}
        />
      </AbsoluteFill>

      {/* ── UI sounds ──────────────────────────────────────────────────────
          Tactile feedback on individual events. Real software makes these noises; their
          absence is part of why a silent mockup feels lifeless. Mixed under the music
          bed, so they are kept deliberately quiet. */}
      <Sfx file="mouse-click.wav" at={T.clickTile} volume={0.5} />
      <Sfx file="mouse-click.wav" at={T.clickContinue} volume={0.5} />
      <Sfx file="ding.wav" at={T.connectedState + 4} volume={0.38} />
      <Sfx file="whoosh.wav" at={T.jobIn} volume={0.24} />

      {/* Wordmark watermark, so the brand is present through the demo */}
      <div
        style={{
          position: 'absolute',
          left: 54,
          bottom: 44,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: uiEnter(frame, 24, 22) * 0.5,
        }}
      >
        <BrandMarkGlyph size={24} />
        <span
          style={{
            fontFamily: fontFamily.display,
            fontSize: 20,
            fontWeight: typography.weights.bold,
            color: colors.textOnPaper,
            letterSpacing: -0.4,
          }}
        >
          {brand.name}
        </span>
      </div>
    </AbsoluteFill>
  );
};

/** The brand mark at an arbitrary size. */
const BrandMarkGlyph: React.FC<{size?: number}> = ({size = 30}) => <BrandMark size={size} />;

// ── Loading skeleton ────────────────────────────────────────────────────────────

const SkeletonRow: React.FC<{width: number; height: number; delay: number}> = ({
  width,
  height,
  delay,
}) => {
  const frame = useCurrentFrame();
  // A shimmer sweep, not a pulsing opacity — real skeletons sweep.
  const sweep = ((frame - delay) % 34) / 34;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: height / 2,
        background: `linear-gradient(90deg, rgba(13,17,23,0.07) 0%, rgba(13,17,23,0.13) ${sweep * 100}%, rgba(13,17,23,0.07) 100%)`,
      }}
    />
  );
};

const SkeletonCard: React.FC<{frame: number}> = ({frame}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      padding: '18px 22px',
      background: '#fff',
      borderRadius: 14,
      border: `1px solid ${colors.hairline}`,
      boxShadow: elevation.sm,
    }}
  >
    <SkeletonRow width={62} height={62} delay={4} />
    <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
      <SkeletonRow width={190} height={15} delay={6} />
      <SkeletonRow width={250} height={12} delay={10} />
    </div>
  </div>
);

// ── Connected-state pieces ──────────────────────────────────────────────────────

/** The "1 property found" line + property card. */
export const PropertyCard: React.FC<{progress: number}> = ({progress: p}) => {
  return (
    <div style={{opacity: p, transform: `translateY(${(1 - p) * 10}px)`, ...smoothText}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14}}>
        <SparkleIcon size={19} color={colors.emerald} />
        <span
          style={{
            fontFamily: fontFamily.ui,
            fontSize: 16,
            fontWeight: typography.weights.semibold,
            color: colors.emeraldDeep,
            letterSpacing: 0.2,
          }}
        >
          1 property found
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '18px 22px',
          background: '#fff',
          borderRadius: 14,
          border: `1px solid ${colors.hairline}`,
          boxShadow: elevation.sm,
        }}
      >
        <RoomThumb size={62} />

        <div style={{flex: 1}}>
          <div
            style={{
              fontFamily: fontFamily.display,
              fontSize: 22,
              fontWeight: typography.weights.bold,
              color: colors.textOnPaper,
              letterSpacing: -0.5,
            }}
          >
            Sunny 1-bed &middot; Mitte
          </div>
          <div
            style={{
              fontFamily: fontFamily.ui,
              fontSize: 15,
              color: colors.textOnPaperMuted,
              marginTop: 3,
            }}
          >
            1 bedroom &middot; 2 guests &middot; entire apartment
          </div>
        </div>

        {/* A status dot plus a label reads as STATE; a bare string reads as a caption. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            borderRadius: 999,
            background: colors.emeraldSoft,
            border: `1px solid ${colors.emerald}33`,
          }}
        >
          <StatusDot size={8} />
          <span
            style={{
              fontFamily: fontFamily.ui,
              fontSize: 14,
              fontWeight: typography.weights.semibold,
              color: colors.emeraldDeep,
            }}
          >
            Connected
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * The booking timeline.
 *
 * The amber gap between checkout and check-in IS the product's reason to exist, so it is
 * drawn literally and then filled. The gap carries its own label *before* it is filled, and
 * the label swaps to "Cleaning scheduled" afterwards — real interfaces rarely change
 * geometry and copy in the same frame.
 */
export const BookingTimeline: React.FC<{
  draw: number;
  job: number;
  showLabel: boolean;
  providerName?: string;
}> = ({draw, job, showLabel}) => {
  const frame = useCurrentFrame();
  const rowTop = 232;

  return (
    <div style={{marginTop: 32, opacity: showLabel ? 1 : 0}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14}}>
        <CalendarIcon size={17} color={colors.textOnPaperMuted} />
        <span
          style={{
            fontFamily: fontFamily.ui,
            fontSize: 15,
            fontWeight: typography.weights.medium,
            color: colors.textOnPaperMuted,
            letterSpacing: 0.2,
          }}
        >
          Thursday, 14 March
        </span>
      </div>

      <div style={{position: 'relative', height: 200}}>
        <div style={{display: 'flex', alignItems: 'flex-start'}}>
          <TimelineEndpoint
            label="Checkout"
            time="11:00"
            align="left"
            opacity={Math.min(1, draw * 2)}
          />

          <div style={{flex: 1, position: 'relative', height: 92, paddingTop: 28}}>
            <div
              style={{
                height: 5,
                borderRadius: 3,
                background: colors.paperLine,
                width: `${draw * 100}%`,
              }}
            />
            {/* The turnover window — amber, dashed, unresolved */}
            <div
              style={{
                position: 'absolute',
                left: '16%',
                right: '16%',
                top: 28,
                height: 5,
                borderRadius: 3,
                backgroundImage: `repeating-linear-gradient(90deg, ${colors.amber} 0 10px, transparent 10px 19px)`,
                opacity: draw * (1 - job),
              }}
            />
            {/* Filled by the scheduled job — emerald, solid, resolved */}
            <div
              style={{
                position: 'absolute',
                left: '16%',
                right: '16%',
                top: 28,
                height: 5,
                borderRadius: 3,
                background: colors.emerald,
                transform: `scaleX(${job})`,
                transformOrigin: 'left center',
              }}
            />
          </div>

          <TimelineEndpoint
            label="Check-in"
            time="15:00"
            align="right"
            opacity={Math.min(1, draw * 2)}
          />
        </div>

        {/* Label inside the gap, before it fills */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: rowTop - 142,
            transform: 'translateX(-50%)',
            opacity: draw * (1 - job),
            fontFamily: fontFamily.ui,
            fontSize: 14,
            fontWeight: typography.weights.semibold,
            color: colors.amberDeep,
            letterSpacing: 1.3,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          Your turnover window
        </div>

        {/* The scheduled cleaning job sliding up into the gap */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: rowTop - 112,
            transform: `translateX(-50%) translateY(${(1 - job) * 14}px) scale(${0.97 + job * 0.03})`,
            opacity: job,
            display: 'flex',
            alignItems: 'center',
            gap: 13,
            padding: '14px 22px',
            borderRadius: 13,
            background: '#fff',
            border: `1px solid ${colors.emerald}44`,
            boxShadow: `${elevation.md}, 0 0 0 4px rgba(18,161,122,${job * 0.10})`,
            whiteSpace: 'nowrap',
            ...smoothText,
          }}
        >
          <CheckIcon size={24} progress={job} ring={false} />
          <div>
            <div
              style={{
                fontFamily: fontFamily.ui,
                fontSize: 18,
                fontWeight: typography.weights.semibold,
                color: colors.textOnPaper,
                letterSpacing: -0.2,
                ...tabularNums,
              }}
            >
              12:00 &ndash; 14:30 &middot; Cleaner assigned
            </div>
            <div
              style={{
                fontFamily: fontFamily.ui,
                fontSize: 14,
                color: colors.textOnPaperMuted,
                marginTop: 2,
              }}
            >
              Marta &middot; 4.9 &#9733; &middot; 0.8 km away
            </div>
          </div>
        </div>

        {/* The payoff line, which lands last and closes the beat */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: rowTop - 22,
            transform: `translateX(-50%) translateY(${(1 - job) * 10}px)`,
            opacity: job,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: fontFamily.display,
              fontSize: 25,
              fontWeight: typography.weights.bold,
              color: colors.emeraldDeep,
              letterSpacing: -0.6,
              ...smoothText,
            }}
          >
            Cleaning scheduled
          </span>
          {/* A short rule that draws itself on the same curve as everything else */}
          <div
            style={{
              width: 46 * progress(frame, 6, 14, EASE.ui),
              height: 4,
              borderRadius: 2,
              background: colors.emerald,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const TimelineEndpoint: React.FC<{
  label: string;
  time: string;
  align: 'left' | 'right';
  opacity: number;
}> = ({label, time, align, opacity}) => (
  <div style={{width: 156, opacity, textAlign: align, paddingTop: 10}}>
    <div
      style={{
        fontFamily: fontFamily.display,
        fontSize: 27,
        fontWeight: typography.weights.extrabold,
        color: colors.textOnPaper,
        letterSpacing: -1,
        lineHeight: 1,
        // Times change value; tabular figures stop the digits from shuffling width.
        ...tabularNums,
      }}
    >
      {time}
    </div>
    <div
      style={{
        fontFamily: fontFamily.ui,
        fontSize: 14,
        color: colors.textOnPaperMuted,
        marginTop: 5,
        letterSpacing: 0.3,
      }}
    >
      {label}
    </div>
  </div>
);

/**
 * Placeholder property thumbnail.
 *
 * Deliberately an abstract illustration rather than a stock photo: a real photo here would
 * have to match the apartment in the live-action footage, and a mismatched stock interior
 * would break the illusion. If a still from the classmate's footage is available, swapping
 * it in here is the single biggest realism gain left in this segment.
 */
const RoomThumb: React.FC<{size?: number}> = ({size = 62}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 12,
      background: 'linear-gradient(150deg, #DCE6E2 0%, #C7D6D0 60%, #B5C7C0 100%)',
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: '14%',
        bottom: '16%',
        width: '72%',
        height: '34%',
        borderRadius: 3,
        background: '#FFFFFF',
        boxShadow: '0 2px 5px rgba(13,17,23,0.14)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: '28%',
        bottom: '42%',
        width: '44%',
        height: '20%',
        borderRadius: '5px 5px 2px 2px',
        background: '#EFE7DA',
      }}
    />
    <div
      style={{
        position: 'absolute',
        right: '10%',
        top: '12%',
        width: '26%',
        height: '30%',
        borderRadius: 2,
        background: 'rgba(255,255,255,0.75)',
      }}
    />
  </div>
);
