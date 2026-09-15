import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {brand, colors, dur, elevation, typography} from '../brand';
import {fontFamily} from '../fonts';
import {EASE, easeOutCubic, progress, smoothText, track, uiEnter, uiExit} from '../lib/anim';
import {AppHeader, BrowserWindow} from '../components/ui/AppWindow';
import {Cursor} from '../components/ui/Cursor';
import {CheckIcon, ChevronRight} from '../components/ui/Logos';
import {BookingTimeline, PropertyCard} from './Connector';

/**
 * BEAT 6 — AUTOMATION OPT-IN. 300 frames = 10s.
 *
 * ── WHY THIS WAS REBUILT ──────────────────────────────────────────────────────
 * The earlier version was a modal asking "Want this every time?" with two toggle switches
 * and an Approve button. A designer flags that immediately: no real product sets up a
 * recurring task that way. Recurring work is configured as an **automation rule** — a
 * sentence with slots — which is how Zapier, Make, Linear and Notion all do it.
 *
 * So the beat is now a rule builder:
 *
 *     When   Guest checks out
 *     Then   Schedule a cleaning
 *     With   Marta · your usual cleaner
 *
 * It reads as a real product, it is *clearer* to a viewer than two unlabelled toggles, and
 * it keeps the ad's point intact: the host opts in rather than being signed up. SimplyClean
 * also does one-off ad-hoc cleaning, so this must read as an offer, not a default.
 */

const T = {
  dialogIn: 0,
  row1: 42,
  row2: 62,
  row3: 82,
  cursorIn: 128,
  hoverCreate: 150,
  clickCreate: 172,
  confirmed: 190,
  burst: 206,
  finalLine: 236,
} as const;

/**
 * Derived from the dialog layout below and VERIFIED by rendering frame 172.
 * If the dialog's padding, row heights or the window chrome height change, re-render and
 * re-measure — a stale cursor target is the easiest bug to ship in this segment.
 */
const CURSOR_CREATE = {x: 1180, y: 806};

/** A one-shot UI sound at an absolute frame within this Sequence. */
const Sfx: React.FC<{file: string; at: number; volume?: number}> = ({file, at, volume = 0.6}) => (
  <Sequence from={at} durationInFrames={40} name={`sfx ${file}`}>
    <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
  </Sequence>
);

export const Automate: React.FC = () => {
  const frame = useCurrentFrame();

  const dialogIn = uiEnter(frame, T.dialogIn, dur.medium);
  const confirmed = frame >= T.confirmed;
  const successOpacity = uiEnter(frame, T.confirmed, dur.small);
  const formOpacity = 1 - uiExit(frame, T.confirmed, dur.small);
  const burst = progress(frame, T.burst, 24, EASE.ui);

  const createHover = progress(frame, T.hoverCreate, dur.hover, EASE.ui);
  const createPress = track(
    frame,
    [
      [T.clickCreate, 0],
      [T.clickCreate + 2, 1],
      [T.clickCreate + 8, 0],
    ],
    EASE.ui,
  );

  const scale = track(frame, [[0, 1.02], [300, 1.0]], easeOutCubic);

  const rules: Array<{key: string; value: string; at: number}> = [
    {key: 'When', value: 'Guest checks out', at: T.row1},
    {key: 'Then', value: 'Schedule a cleaning', at: T.row2},
    {key: 'With', value: 'Marta · your usual cleaner', at: T.row3},
  ];

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(150deg, #F7F4EE 0%, #EFEAE1 52%, #E7E1D6 100%)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{transform: `scale(${scale})`, transformOrigin: '50% 50%'}}>
        <BrowserWindow width={1400} height={860} url={`${brand.domain}/app/automations`}>
          <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            <AppHeader name={brand.name} />
            <div style={{flex: 1, position: 'relative', padding: '40px 44px 0'}}>
              <PropertyCard progress={1} />
              <BookingTimeline draw={1} job={1} showLabel />
            </div>
          </div>

          <AbsoluteFill
            style={{
              background: 'rgba(13,17,23,0.34)',
              backdropFilter: 'blur(2px)',
              opacity: dialogIn,
            }}
          />
        </BrowserWindow>
      </div>

      {/* ── The automation dialog ──────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 440,
          width: 720,
          marginLeft: -360,
          transform: `translateY(${(1 - dialogIn) * 14}px)`,
          opacity: dialogIn,
          borderRadius: 14,
          background: '#FFFFFF',
          boxShadow: `${elevation.xl}, 0 0 0 1px ${colors.hairline}`,
          padding: '32px 36px 28px',
          boxSizing: 'border-box',
          ...smoothText,
        }}
      >
        {confirmed ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 18,
              paddingBottom: 18,
              opacity: successOpacity,
            }}
          >
            <div style={{position: 'relative', marginBottom: 18}}>
              {/* A single expanding ring — restrained, not confetti */}
              <div
                style={{
                  position: 'absolute',
                  inset: -7,
                  borderRadius: 999,
                  boxShadow: `0 0 0 ${burst * 42}px rgba(18,161,122,${(1 - burst) * 0.26})`,
                }}
              />
              <CheckIcon size={84} progress={successOpacity} />
            </div>

            <div
              style={{
                fontFamily: fontFamily.display,
                fontSize: 34,
                fontWeight: typography.weights.extrabold,
                color: colors.textOnPaper,
                letterSpacing: -1.1,
                ...smoothText,
              }}
            >
              Automated.
            </div>
            <div
              style={{
                fontFamily: fontFamily.ui,
                fontSize: 18,
                color: colors.textOnPaperMuted,
                marginTop: 9,
                opacity: uiEnter(frame, T.finalLine, 18),
              }}
            >
              We&rsquo;ll handle the rest.
            </div>
          </div>
        ) : (
          <div style={{opacity: formOpacity}}>
            <div
              style={{
                fontFamily: fontFamily.display,
                fontSize: 30,
                fontWeight: typography.weights.extrabold,
                color: colors.textOnPaper,
                letterSpacing: -1,
                marginBottom: 6,
                ...smoothText,
              }}
            >
              Want this every time?
            </div>
            <div
              style={{
                fontFamily: fontFamily.ui,
                fontSize: 17,
                lineHeight: 1.5,
                color: colors.textOnPaperMuted,
                marginBottom: 22,
              }}
            >
              Set up an automation once, and every checkout is handled.
            </div>

            {rules.map((r) => (
              <RuleRow
                key={r.key}
                label={r.key}
                value={r.value}
                progress={uiEnter(frame, r.at, dur.small)}
              />
            ))}

            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 24}}>
              <div
                style={{
                  minWidth: 190,
                  padding: '13px 26px',
                  borderRadius: 9,
                  background: colors.emerald,
                  color: '#FFFFFF',
                  fontFamily: fontFamily.ui,
                  fontSize: 16,
                  fontWeight: typography.weights.semibold,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow:
                    createHover > 0.02
                      ? `${elevation.md}, 0 0 0 3px rgba(18,161,122,0.22)`
                      : elevation.sm,
                  transform: `translateY(${-1.5 * createHover + 1.5 * createPress}px) scale(${1 - 0.012 * createPress})`,
                  ...smoothText,
                }}
              >
                Create automation
              </div>
            </div>
          </div>
        )}
      </div>

      <AbsoluteFill>
        <Cursor
          keys={[
            {frame: T.cursorIn - 14, x: 1520, y: 1010},
            {frame: T.hoverCreate, x: CURSOR_CREATE.x, y: CURSOR_CREATE.y},
            {frame: T.clickCreate, x: CURSOR_CREATE.x, y: CURSOR_CREATE.y},
          ]}
          clicks={[T.clickCreate]}
          cursor="handpointing"
          opacity={track(
            frame,
            [
              [T.cursorIn - 18, 0],
              [T.cursorIn - 8, 1],
              [T.clickCreate + 12, 1],
              [T.clickCreate + 30, 0],
            ],
            EASE.ui,
          )}
        />
      </AbsoluteFill>

      <Sfx file="mouse-click.wav" at={T.clickCreate} volume={0.5} />
      <Sfx file="switch.wav" at={T.row2} volume={0.28} />
      <Sfx file="ding.wav" at={T.confirmed + 2} volume={0.34} />
    </AbsoluteFill>
  );
};

/**
 * One slot of the automation rule: a fixed key, the chosen value, then a chevron.
 * The value is what animates in, because that is what the user is choosing.
 */
const RuleRow: React.FC<{label: string; value: string; progress: number}> = ({
  label,
  value,
  progress: p,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      borderRadius: 10,
      background: colors.paperSoft,
      border: `1px solid ${colors.hairline}`,
      marginBottom: 8,
      opacity: 0.5 + p * 0.5,
    }}
  >
    <span
      style={{
        width: 46,
        fontFamily: fontFamily.ui,
        fontSize: 14,
        fontWeight: typography.weights.semibold,
        color: colors.textOnPaperFaint,
        letterSpacing: 0.4,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: fontFamily.ui,
        fontSize: 16,
        fontWeight: typography.weights.medium,
        color: colors.textOnPaper,
        transform: `translateY(${(1 - p) * 6}px)`,
        opacity: p,
        ...smoothText,
      }}
    >
      {value}
    </span>
    <div style={{flex: 1}} />
    <ChevronRight size={15} color={colors.textOnPaperFaint} />
  </div>
);
