import React from 'react';
import {useCurrentFrame} from 'remotion';
import {brand, colors, elevation, typography} from '../../brand';
import {fontFamily} from '../../fonts';
import {EASE, progress} from '../../lib/anim';
import {BrandMark, LockIcon} from './Logos';

/**
 * A browser window with macOS chrome.
 *
 * ── WHAT MAKES THIS READ AS A REAL WINDOW RATHER THAN A RECTANGLE ──────────────
 * A macOS window with no tab strip, no favicon and no drop shadow reads as a drawn box.
 * Three cheap things fix that:
 *
 *   1. A TAB STRIP with one inactive tab, its favicon and a close affordance, plus a "+".
 *   2. A window SHADOW from the elevation scale, not an invented blur.
 *   3. A TWO-TONE URL. Real Chrome emphasises the origin and greys the path; rendering the
 *      whole string at one weight is an instant tell.
 *
 * `loadProgress` (0→1) drives Chrome's top loading bar. It is driven from the caller's
 * frame, never a CSS animation — every animated property must be a pure function of
 * `useCurrentFrame()` or the render stops being deterministic.
 */
export const BrowserWindow: React.FC<{
  width?: number;
  height?: number;
  url?: string;
  /** 0→1 progress of the browser loading bar; 1 means finished. */
  loadProgress?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  width = 1400,
  height = 860,
  url = 'simplyclean.co/app/connections',
  loadProgress = 1,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const barDone = loadProgress >= 1;
  const barOpacity = barDone ? 1 - progress(frame, 0, 10, EASE.ui) : 1;

  const origin = url.split('/')[0];
  const path = '/' + url.split('/').slice(1).join('/');

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 12,
        overflow: 'hidden',
        background: colors.paper,
        boxShadow: `${elevation.window}, 0 0 0 1px rgba(255,255,255,0.10), inset 0 1px 0 rgba(255,255,255,0.6)`,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {/* ── Tab strip ─────────────────────────────────────────────────────── */}
      <div
        style={{
          height: 40,
          flexShrink: 0,
          background: '#E4E0D8',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '0 12px',
          gap: 14,
        }}
      >
        <div style={{display: 'flex', gap: 8, paddingBottom: 12, width: 64}}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
            <div key={c} style={{width: 12, height: 12, borderRadius: 6, background: c}} />
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 31,
            padding: '0 12px',
            borderRadius: '8px 8px 0 0',
            background: colors.paperSoft,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
            position: 'relative',
            top: 1,
          }}
        >
          <BrandMark size={13} />
          <span
            style={{
              fontFamily: fontFamily.ui,
              fontSize: 12.5,
              color: colors.textOnPaper,
              letterSpacing: -0.1,
              whiteSpace: 'nowrap',
            }}
          >
            Connections &middot; {brand.name}
          </span>
          <svg width={11} height={11} viewBox="0 0 24 24" style={{opacity: 0.42}}>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke={colors.textOnPaper}
              strokeWidth={2.6}
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div style={{paddingBottom: 8, opacity: 0.4}}>
          <svg width={14} height={14} viewBox="0 0 24 24">
            <path
              d="M12 5v14M5 12h14"
              stroke={colors.textOnPaper}
              strokeWidth={2.2}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* ── URL bar ───────────────────────────────────────────────────────── */}
      <div
        style={{
          height: 42,
          flexShrink: 0,
          background: colors.paperSoft,
          borderBottom: `1px solid ${colors.hairline}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          gap: 12,
        }}
      >
        <div style={{width: 40}} />
        <div style={{flex: 1, display: 'flex', justifyContent: 'center'}}>
          <div
            style={{
              minWidth: 440,
              height: 28,
              borderRadius: 14,
              background: 'rgba(13,17,23,0.055)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              padding: '0 16px',
            }}
          >
            <LockIcon size={11} color={colors.textOnPaperMuted} />
            {/* Two-tone, as Chrome renders it: origin emphasised, path greyed. */}
            <span
              style={{
                fontFamily: fontFamily.ui,
                fontSize: 13,
                color: colors.textOnPaper,
                fontWeight: typography.weights.medium,
                letterSpacing: -0.1,
              }}
            >
              {origin}
            </span>
            <span
              style={{
                fontFamily: fontFamily.ui,
                fontSize: 13,
                color: colors.textOnPaperFaint,
                letterSpacing: -0.1,
              }}
            >
              {path}
            </span>
          </div>
        </div>
        <div style={{width: 40}} />
      </div>

      {/* ── Chrome's loading bar ──────────────────────────────────────────── */}
      {!barDone || barOpacity > 0.02 ? (
        <div
          style={{
            height: 2.5,
            flexShrink: 0,
            background: 'transparent',
            position: 'relative',
            marginTop: -2.5,
            zIndex: 20,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(1, loadProgress) * 100}%`,
              background: '#1A73E8',
              opacity: barOpacity,
              boxShadow: '0 0 6px rgba(26,115,232,0.6)',
            }}
          />
        </div>
      ) : null}

      {/* ── Page ──────────────────────────────────────────────────────────── */}
      <div style={{flex: 1, position: 'relative', overflow: 'hidden'}}>{children}</div>
    </div>
  );
};

/** In-app top navigation bar. */
export const AppHeader: React.FC<{name: string; style?: React.CSSProperties}> = ({name, style}) => (
  <div
    style={{
      height: 68,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px',
      borderBottom: `1px solid ${colors.hairline}`,
      ...style,
    }}
  >
    <div style={{display: 'flex', alignItems: 'center', gap: 11}}>
      <BrandMark size={27} />
      <span
        style={{
          fontFamily: fontFamily.display,
          fontSize: 21,
          fontWeight: typography.weights.bold,
          color: colors.textOnPaper,
          letterSpacing: -0.5,
        }}
      >
        {name}
      </span>
    </div>

    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
      <span
        style={{
          fontFamily: fontFamily.ui,
          fontSize: 14,
          color: colors.textOnPaperMuted,
        }}
      >
        {brand.accountName}
      </span>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          background: 'linear-gradient(140deg, #E9A23B, #12A17A)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
        }}
      />
    </div>
  </div>
);
