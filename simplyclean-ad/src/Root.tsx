import React from 'react';
import {Composition} from 'remotion';
import {Ad, FOOTAGE_CHECK_FRAMES, FootageCheck} from './Ad';
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
    </>
  );
};
