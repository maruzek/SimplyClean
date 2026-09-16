import React from 'react';
import {Composition} from 'remotion';
import {Ad, FOOTAGE_CHECK_FRAMES, FootageCheck} from './Ad';
import {BrandLogo} from './BrandLogo';
import {Hook} from './segments/Hook';
import {TitleCard} from './segments/TitleCard';
import {Connector} from './segments/Connector';
import {Automate} from './segments/Automate';
import {BEATS, FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './timeline';

/**
 * Composition registry.
 *
 * `Ad` is the deliverable. The individual segment compositions exist so a single beat can
 * be previewed or re-rendered in isolation — iterating on the 19-second connector demo
 * without re-rendering the live-action beats around it is the difference between a 20
 * second feedback loop and a 4 minute one.
 *
 * All compositions share the 1920×1080 / 30fps canvas from timeline.ts, so nothing ever
 * drifts out of sync with the edit.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ── The deliverable ────────────────────────────────────────────── */}
      <Composition
        id="Ad"
        component={Ad}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      {/* ── Beat-by-beat previews ─────────────────────────────────────── */}
      <Composition
        id="SegmentHook"
        component={Hook}
        durationInFrames={BEATS.hook.duration}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="SegmentTitle"
        component={TitleCard}
        durationInFrames={BEATS.title.duration}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="SegmentConnector"
        component={Connector}
        durationInFrames={BEATS.connector.duration}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="SegmentAutomate"
        component={Automate}
        durationInFrames={BEATS.automate.duration}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      {/* ── Verification: the three conformed clips, back to back ─────── */}
      <Composition
        id="FootageCheck"
        component={FootageCheck}
        durationInFrames={FOOTAGE_CHECK_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      {/* ── Logo exports ──────────────────────────────────────────────────
          Single-frame compositions for producing brand assets as transparent PNGs.
          Render with:
            npx remotion still src/index.ts BrandLogo out/logo/mark-1024.png
          Nothing paints a background, so the PNG carries a real alpha channel. */}
      <Composition
        id="BrandLogo"
        component={BrandLogo}
        durationInFrames={1}
        fps={FPS}
        width={1024}
        height={1024}
        defaultProps={{variant: 'colour' as const, lockup: false}}
      />
      <Composition
        id="BrandLogoWhite"
        component={BrandLogo}
        durationInFrames={1}
        fps={FPS}
        width={1024}
        height={1024}
        defaultProps={{variant: 'white' as const, lockup: false}}
      />
      <Composition
        id="BrandLogoInk"
        component={BrandLogo}
        durationInFrames={1}
        fps={FPS}
        width={1024}
        height={1024}
        defaultProps={{variant: 'ink' as const, lockup: false}}
      />
      <Composition
        id="BrandLockup"
        component={BrandLogo}
        durationInFrames={1}
        fps={FPS}
        width={2048}
        height={512}
        defaultProps={{variant: 'colour' as const, lockup: true}}
      />
      <Composition
        id="BrandLockupWhite"
        component={BrandLogo}
        durationInFrames={1}
        fps={FPS}
        width={2048}
        height={512}
        defaultProps={{variant: 'white' as const, lockup: true}}
      />
    </>
  );
};
