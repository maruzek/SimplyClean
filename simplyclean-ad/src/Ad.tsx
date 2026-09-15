import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {BEATS} from './timeline';
import {Hook} from './segments/Hook';
import {TitleCard} from './segments/TitleCard';
import {Connector} from './segments/Connector';
import {Automate} from './segments/Automate';
import {CleanOverlay, MessyOverlay, useShotDrift} from './components/overlays/LiveOverlay';
import {EndCard, Grain} from './components/overlays/EndCard';
import {Sweep} from './components/ui/Sweep';
import {colors} from './brand';

/**
 * THE AD — 1800 frames @ 30fps = 60.000s.
 *
 * Layer order per beat is important and deliberate:
 *
 *   1. the live-action shot (with a slow drift applied to the video itself)
 *   2. the text overlay, locked to the frame
 *   3. grain, on top of both, so the grain unifies footage and graphics
 *
 * Transitions are <Sweep> elements that sit ABOVE everything and span the cut point. They
 * are opaque at the midpoint, which is what lets us cut between shots without ever having
 * to extend a live-action clip past its length to cover a dissolve. The one exception is
 * the cut at 0:36, which the script calls for as a hard cut — the release from the amber
 * "unscheduled" state into the clean room should land as a jolt, not a glide.
 */

/**
 * One live-action shot: footage + a slow push so static footage does not read as unedited.
 * The drift is applied to the video element only, so overlays stay locked to the frame.
 */
const Shot: React.FC<{src: string; frames: number; drift?: number}> = ({
  src,
  frames,
  drift = 0.03,
}) => {
  const scale = useShotDrift(frames, drift);

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: '50% 50%'}}>
        <OffthreadVideo
          src={staticFile(src)}
          muted
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** A transition overlay spanning a cut. `at` is the absolute frame of the cut. */
const TransitionAt: React.FC<{
  at: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}> = ({at, duration = 20, direction = 'up'}) => {
  const half = duration / 2;
  return (
    <Sequence from={at - half} durationInFrames={duration} name={`Sweep @${at}`}>
      <Sweep duration={duration} direction={direction} />
    </Sequence>
  );
};

export const Ad: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {/* ── Music ─────────────────────────────────────────────────────────
          Pre-mastered to -14 LUFS / -1 dBTP by scripts/music.sh. The bed is the only
          audio in the film — there is no voiceover by design, so the track carries the
          whole emotional arc and must not be buried. */}
      <Audio src={staticFile('music/track.mp3')} />

      {/* ── BEAT 1 · 0:00.0 — the hook ─────────────────────────────────── */}
      <Sequence from={BEATS.hook.from} durationInFrames={BEATS.hook.duration} name="1 Hook">
        <Hook />
      </Sequence>

      {/* ── BEAT 2 · 0:03.0 — the mess (LIVE 1) ────────────────────────── */}
      <Sequence from={BEATS.messy.from} durationInFrames={BEATS.messy.duration} name="2 Messy">
        <Shot src="footage/messy-room.mp4" frames={BEATS.messy.duration} drift={0.035} />
        <MessyOverlay />
        <Grain opacity={0.04} />
      </Sequence>

      {/* ── BEAT 3 · 0:14.0 — title card ───────────────────────────────── */}
      <Sequence from={BEATS.title.from} durationInFrames={BEATS.title.duration} name="3 Title">
        <TitleCard />
      </Sequence>

      {/* ── BEAT 4 · 0:17.0 — the connector (HERO) ─────────────────────── */}
      <Sequence
        from={BEATS.connector.from}
        durationInFrames={BEATS.connector.duration}
        name="4 Connector"
      >
        <Connector />
      </Sequence>

      {/* ── BEAT 5 · 0:36.0 — cleaned (LIVE 2). Hard cut, deliberately. ── */}
      <Sequence from={BEATS.clean.from} durationInFrames={BEATS.clean.duration} name="5 Clean">
        <Shot src="footage/clean-room.mp4" frames={BEATS.clean.duration} drift={0.028} />
        <CleanOverlay />
        <Grain opacity={0.035} />
      </Sequence>

      {/* ── BEAT 6 · 0:45.0 — automation opt-in ────────────────────────── */}
      <Sequence from={BEATS.automate.from} durationInFrames={BEATS.automate.duration} name="6 Automate">
        <Automate />
      </Sequence>

      {/* ── BEAT 7 · 0:54.0 — payoff + end card (LIVE 3) ───────────────── */}
      <Sequence from={BEATS.payoff.from} durationInFrames={BEATS.payoff.duration} name="7 Payoff">
        <Shot src="footage/relaxed.mp4" frames={BEATS.payoff.duration} drift={0.025} />
        <EndCard />
        <Grain opacity={0.03} />
      </Sequence>

      {/* ── Transitions, above everything ──────────────────────────────── */}
      <TransitionAt at={BEATS.title.from} direction="up" />
      <TransitionAt at={BEATS.connector.from} direction="up" />
      <TransitionAt at={BEATS.automate.from} direction="up" />
      <TransitionAt at={BEATS.payoff.from} direction="up" />
    </AbsoluteFill>
  );
};

/**
 * FOOTAGE CHECK — plays the three conformed clips back to back with a label.
 *
 * This exists so that the moment your friend's files land, we can verify in one render
 * that they were conformed correctly (resolution, duration, grade, and that the messy and
 * clean shots really are the same room from the same angle). Cheap insurance.
 */
export const FootageCheck: React.FC = () => {
  const clip = (
    src: string,
    label: string,
    from: number,
    duration: number,
  ) => (
    <Sequence from={from} durationInFrames={duration} key={src}>
      <Shot src={src} frames={duration} drift={0.02} />
      <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'flex-start', padding: 40}}>
        <div
          style={{
            background: 'rgba(6,8,11,0.78)',
            color: colors.textOnInk,
            padding: '12px 22px',
            borderRadius: 12,
            fontSize: 26,
            letterSpacing: 1,
          }}
        >
          {label}
        </div>
      </AbsoluteFill>
    </Sequence>
  );

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {clip('footage/messy-room.mp4', 'LIVE 1 — messy-room', 0, 330)}
      {clip('footage/clean-room.mp4', 'LIVE 2 — clean-room', 330, 270)}
      {clip('footage/relaxed.mp4', 'LIVE 3 — relaxed', 600, 180)}
    </AbsoluteFill>
  );
};

export const FOOTAGE_CHECK_FRAMES = 780;
