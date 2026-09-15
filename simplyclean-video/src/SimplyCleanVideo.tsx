import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Intro } from "./scenes/Intro";
import { Problem } from "./scenes/Problem";
import { RootCause } from "./scenes/RootCause";
import { Flow } from "./scenes/Flow";
import { Algorithm } from "./scenes/Algorithm";
import { Market } from "./scenes/Market";
import { Economics } from "./scenes/Economics";
import { Legal } from "./scenes/Legal";
import { Goal } from "./scenes/Goal";
import { Outro } from "./scenes/Outro";

// Scene durations at 30 fps. Total = sum - 9 transitions × 15 = 2535 frames (84.5 s).
export const SimplyCleanVideo: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={150} name="Intro">
        <Intro />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

      <TransitionSeries.Sequence durationInFrames={300} name="Problem">
        <Problem />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 15 })} />

      <TransitionSeries.Sequence durationInFrames={240} name="RootCause">
        <RootCause />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

      <TransitionSeries.Sequence durationInFrames={360} name="Flow">
        <Flow />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 15 })} />

      <TransitionSeries.Sequence durationInFrames={270} name="Algorithm">
        <Algorithm />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

      <TransitionSeries.Sequence durationInFrames={270} name="Market">
        <Market />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 15 })} />

      <TransitionSeries.Sequence durationInFrames={330} name="Economics">
        <Economics />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

      <TransitionSeries.Sequence durationInFrames={300} name="Legal">
        <Legal />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 15 })} />

      <TransitionSeries.Sequence durationInFrames={240} name="Goal">
        <Goal />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

      <TransitionSeries.Sequence durationInFrames={210} name="Outro">
        <Outro />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
