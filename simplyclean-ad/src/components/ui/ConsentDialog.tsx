import React from 'react';
import {useCurrentFrame} from 'remotion';
import {brand, colors, dur, elevation, typography} from '../../brand';
import {fontFamily} from '../../fonts';
import {EASE, progress, smoothText} from '../../lib/anim';
import {BrandMark, CheckIcon, LockIcon, Spinner} from './Logos';
import {PlatformMark} from './PlatformMark';
import type {Platform} from '../../brand';

/**
 * The OAuth consent dialog — the most important screen in the ad, because it is the moment
 * the product idea becomes legible. Every structural choice below is taken from how real
 * consent screens are actually built, not from what looks dramatic.
 *
 * ── THE FIVE THINGS THIS GETS RIGHT, AND WHY ───────────────────────────────────
 *
 *  1. **The requesting app is the subject.** Google: "[App] wants access to your Google
 *     Account". Plaid: "[App] uses Plaid to connect your [thing]". In both, the *app* is the
 *     grammatical subject and the provider is the object. An earlier revision had this
 *     inverted ("Airbnb wants to connect to SimplyClean"), which is the exact inverse of
 *     every real implementation — and, incidentally, would have put a third party's
 *     trademark in the headline position, which their guidelines prohibit.
 *
 *  2. **Permission rows are NOT green checkmarks.** This was a real mistake in the previous
 *     version. A green check is a *success/complete* affordance, so putting one on a consent
 *     row reads as "already granted" — a genuine mock-UI tell. Real screens use one of three
 *     treatments: per-scope checkboxes (Google), expandable chevron rows in a single bordered
 *     container (Plaid), or no per-scope list at all (Stripe). We use Plaid's: one bordered
 *     container, hairline separators, chevron-down per row. The green check is now reserved
 *     exclusively for the actual success moment, which lands much harder as a result.
 *
 *  3. **A trust line immediately above the buttons.** Google's consent screen ends with
 *     "Make sure you trust [App]" directly before the decision. Putting the doubt at the
 *     point of decision is what makes a consent screen feel honest rather than promotional.
 *
 *  4. **Two permissions, not three.** Plaid's own messaging guidance: "When providing value
 *     props, two bullets is best. Only use more than two if the additional bullets convey
 *     financial benefits." Three rows was one past the recommended count.
 *
 *  5. **Cancel left, Continue right.** Google's order, and the most recognisable consent
 *     layout. Plaid puts the primary on top and Stripe stacks primary-above-secondary; the
 *     convention genuinely varies, so the rule is just to pick one deliberately. We pick
 *     Google's.
 *
 * Motion is clamped bezier at Material 3 durations. No springs — a spring on a dialog is the
 * signature of a mockup rather than software.
 */
export const ConsentDialog: React.FC<{
  provider: Platform;
  state: 'prompt' | 'loading' | 'connected';
  primaryHover?: number;
  primaryPress?: number;
  checkProgress?: number;
  opacity?: number;
  width?: number;
  style?: React.CSSProperties;
}> = ({
  provider,
  state,
  primaryHover = 0,
  primaryPress = 0,
  checkProgress = 0,
  opacity = 1,
  width = 660,
  style,
}) => {
  const frame = useCurrentFrame();

  const permissions = [
    {label: 'Listings and bookings', Icon: ListIcon},
    {label: 'Check-in and check-out times', Icon: CalendarLineIcon},
  ];

  const providerOrigin = `${provider.name.toLowerCase().replace(/[^a-z]/g, '')}.com`;

  return (
    <div
      style={{
        width,
        borderRadius: 12,
        background: '#FFFFFF',
        boxShadow: `${elevation.xl}, 0 0 0 1px ${colors.hairline}`,
        overflow: 'hidden',
        opacity,
        ...style,
      }}
    >
      {/* ── Provider origin ───────────────────────────────────────────────
          The strongest trust affordance a consent screen has: which site is asking. */}
      <div
        style={{
          height: 40,
          background: colors.paperSoft,
          borderBottom: `1px solid ${colors.hairline}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <LockIcon size={11} color={colors.textOnPaperMuted} />
        <span
          style={{
            fontFamily: fontFamily.ui,
            fontSize: 12.5,
            fontWeight: typography.weights.medium,
            color: colors.textOnPaperMuted,
            letterSpacing: 0.1,
          }}
        >
          {providerOrigin}
        </span>
      </div>

      {state === 'connected' ? (
        /* ── Connected ─────────────────────────────────────────────────── */
        <div
          style={{
            padding: '42px 44px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <CheckIcon size={88} progress={checkProgress} />
          <div
            style={{
              fontFamily: fontFamily.display,
              fontSize: 28,
              fontWeight: typography.weights.bold,
              color: colors.textOnPaper,
              letterSpacing: -0.8,
              ...smoothText,
            }}
          >
            Connected
          </div>
          {/* Real screens name the account, not just the provider. */}
          <div
            style={{
              fontFamily: fontFamily.ui,
              fontSize: 15,
              color: colors.textOnPaperMuted,
            }}
          >
            Connected as {brand.accountEmail}
          </div>
        </div>
      ) : state === 'loading' ? (
        /* ── Loading ───────────────────────────────────────────────────────
            A real flow has an explicit loading state between the permission screen and
            completion. Skipping it is why mockups feel instant and unreal. */
        <div
          style={{
            padding: '50px 44px 46px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
          }}
        >
          <Spinner size={32} color={colors.emerald} />
          <div
            style={{
              fontFamily: fontFamily.ui,
              fontSize: 16,
              color: colors.textOnPaperMuted,
            }}
          >
            Connecting to {provider.name}&hellip;
          </div>
        </div>
      ) : (
        /* ── Consent prompt ────────────────────────────────────────────── */
        <div style={{padding: '30px 40px 30px'}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 13,
                background: provider.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PlatformMark mark={provider.mark} size={32} />
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{width: 5, height: 5, borderRadius: 3, background: colors.paperLine}}
                />
              ))}
            </div>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 13,
                background: colors.paperSoft,
                border: `1px solid ${colors.hairline}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BrandMark size={30} />
            </div>
          </div>

          {/* Correct role direction: the APP is the subject, the provider is the object.
              Mirrors Google's "[App] wants access to your Google Account". */}
          <div
            style={{
              fontFamily: fontFamily.display,
              fontSize: 24,
              fontWeight: typography.weights.bold,
              color: colors.textOnPaper,
              textAlign: 'center',
              letterSpacing: -0.6,
              lineHeight: 1.3,
              marginBottom: 18,
              ...smoothText,
            }}
          >
            {brand.name} wants access to
            <br />
            your {provider.name} account
          </div>

          {/* "Select what X can access" — Google's own wording for this step. */}
          <div
            style={{
              fontFamily: fontFamily.ui,
              fontSize: 14,
              fontWeight: typography.weights.medium,
              color: colors.textOnPaperMuted,
              marginBottom: 9,
            }}
          >
            Select what {brand.name} can access
          </div>

          {/* ONE bordered container with hairline separators and a chevron per row —
              Plaid's treatment. Explicitly NOT green checkmarks: those mean "done". */}
          <div
            style={{
              border: `1px solid ${colors.hairlineStrong}`,
              borderRadius: 10,
              overflow: 'hidden',
              marginBottom: 16,
            }}
          >
            {permissions.map(({label, Icon}, i) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '13px 15px',
                  borderTop: i === 0 ? 'none' : `1px solid ${colors.hairline}`,
                  opacity: uiRow(frame, i),
                  transform: `translateY(${(1 - uiRow(frame, i)) * 5}px)`,
                  ...smoothText,
                }}
              >
                <Icon size={17} color={colors.textOnPaperMuted} />
                <span
                  style={{
                    flex: 1,
                    fontFamily: fontFamily.ui,
                    fontSize: 15.5,
                    color: colors.textOnPaper,
                  }}
                >
                  {label}
                </span>
                <ChevronDown size={15} color={colors.textOnPaperFaint} />
              </div>
            ))}
          </div>

          {/* Single prose disclosure above the CTA, per Plaid's pattern. */}
          <div
            style={{
              fontFamily: fontFamily.ui,
              fontSize: 12.5,
              lineHeight: 1.5,
              color: colors.textOnPaperMuted,
              marginBottom: 18,
            }}
          >
            We use this to schedule cleaning around your guests. Your password is never shared
            with us, and you can disconnect at any time.
          </div>

          {/* Trust line immediately before the decision — Google's ladder ends here. */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              paddingBottom: 14,
              marginBottom: 16,
              borderBottom: `1px solid ${colors.hairline}`,
            }}
          >
            <LockIcon size={13} color={colors.emeraldDeep} />
            <span
              style={{
                fontFamily: fontFamily.ui,
                fontSize: 12.5,
                color: colors.emeraldDeep,
                fontWeight: typography.weights.medium,
              }}
            >
              Make sure you trust {brand.name}. Secured with 256-bit encryption.
            </span>
          </div>

          <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end'}}>
            {/* Google's order: secondary left, primary right. */}
            <div
              style={{
                padding: '11px 22px',
                borderRadius: 8,
                fontFamily: fontFamily.ui,
                fontSize: 15,
                fontWeight: typography.weights.medium,
                color: colors.textOnPaperMuted,
              }}
            >
              Cancel
            </div>

            <div
              style={{
                minWidth: 124,
                padding: '11px 22px',
                borderRadius: 8,
                background: colors.emerald,
                color: '#FFFFFF',
                fontFamily: fontFamily.ui,
                fontSize: 15,
                fontWeight: typography.weights.semibold,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow:
                  primaryHover > 0.02
                    ? `${elevation.md}, 0 0 0 2px rgba(250,248,244,1), 0 0 0 4px rgba(18,161,122,0.55)`
                    : elevation.sm,
                transform: `translateY(${-1 * primaryHover + 1.5 * primaryPress}px) scale(${1 - 0.012 * primaryPress})`,
                ...smoothText,
              }}
            >
              Continue
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/** Staggered row entrance, so the list reads as being reviewed rather than pre-rendered. */
const uiRow = (frame: number, i: number) => progress(frame, 12 + i * 5, 9, EASE.ui);

// ── Small inline line-icons ─────────────────────────────────────────────────────
// Kept local because they exist only for this dialog. One icon family, one stroke weight.

const ListIcon: React.FC<{size?: number; color?: string}> = ({size = 17, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </svg>
);

const CalendarLineIcon: React.FC<{size?: number; color?: string}> = ({size = 17, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke={color} strokeWidth={2} />
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </svg>
);

const ChevronDown: React.FC<{size?: number; color?: string}> = ({size = 15, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M6 9.5l6 6 6-6"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
