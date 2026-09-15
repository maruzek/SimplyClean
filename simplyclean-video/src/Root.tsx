import "./index.css";
import { Composition, Folder } from "remotion";
import { SimplyCleanVideo } from "./SimplyCleanVideo";
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

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SimplyClean"
        component={SimplyCleanVideo}
        durationInFrames={2535}
        fps={30}
        width={1920}
        height={1080}
      />
      <Folder name="Scenes">
        <Composition id="Intro" component={Intro} durationInFrames={150} fps={30} width={1920} height={1080} />
        <Composition id="Problem" component={Problem} durationInFrames={300} fps={30} width={1920} height={1080} />
        <Composition id="RootCause" component={RootCause} durationInFrames={240} fps={30} width={1920} height={1080} />
        <Composition id="Flow" component={Flow} durationInFrames={360} fps={30} width={1920} height={1080} />
        <Composition id="Algorithm" component={Algorithm} durationInFrames={270} fps={30} width={1920} height={1080} />
        <Composition id="Market" component={Market} durationInFrames={270} fps={30} width={1920} height={1080} />
        <Composition id="Economics" component={Economics} durationInFrames={330} fps={30} width={1920} height={1080} />
        <Composition id="Legal" component={Legal} durationInFrames={300} fps={30} width={1920} height={1080} />
        <Composition id="Goal" component={Goal} durationInFrames={240} fps={30} width={1920} height={1080} />
        <Composition id="Outro" component={Outro} durationInFrames={210} fps={30} width={1920} height={1080} />
      </Folder>
    </>
  );
};
