import { AbsoluteFill, Interactive, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { Background } from "../components/Background";
import { FadeUp } from "../components/FadeUp";
import { Counter } from "../components/Counter";

export const Goal: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill name="Goal" style={{ fontFamily, color: "#12303f" }}>
      <Background />
      <AbsoluteFill style={{ padding: "100px 120px" }}>
        <FadeUp
          name="Kicker"
          delay={0}
          style={{
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#157a78",
          }}
        >
          SMART cíl · 6 měsíců od spuštění v Praze
        </FadeUp>
        <FadeUp
          name="Headline"
          delay={0.2 * fps}
          style={{
            fontSize: 84,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1.1,
            marginTop: 16,
          }}
        >
          Co budeme měřit
        </FadeUp>

        <Interactive.Div name="Goals" style={{ display: "flex", gap: 32, marginTop: 90 }}>
          <FadeUp name="Goal 1" delay={0.9 * fps} style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 32, padding: 48, boxShadow: "0 20px 50px rgba(18,48,63,0.08)", borderTop: "10px solid #157a78" }}>
            <div style={{ fontSize: 140, fontWeight: 800, letterSpacing: -6, lineHeight: 1 }}>
              <Counter to={150} delay={1.1 * fps} />
            </div>
            <div style={{ fontSize: 40, fontWeight: 600, marginTop: 20, lineHeight: 1.2 }}>aktivních bytů</div>
          </FadeUp>
          <FadeUp name="Goal 2" delay={1.3 * fps} style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 32, padding: 48, boxShadow: "0 20px 50px rgba(18,48,63,0.08)", borderTop: "10px solid #157a78" }}>
            <div style={{ fontSize: 140, fontWeight: 800, letterSpacing: -6, lineHeight: 1 }}>
              <Counter to={95} delay={1.5 * fps} suffix=" %" />
            </div>
            <div style={{ fontSize: 40, fontWeight: 600, marginTop: 20, lineHeight: 1.2 }}>úklidů objednaných bez zásahu majitele</div>
          </FadeUp>
          <FadeUp name="Goal 3" delay={1.7 * fps} style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 32, padding: 48, boxShadow: "0 20px 50px rgba(18,48,63,0.08)", borderTop: "10px solid #d9622b" }}>
            <div style={{ fontSize: 140, fontWeight: 800, letterSpacing: -6, lineHeight: 1, color: "#d9622b" }}>
              &lt; 1 min
            </div>
            <div style={{ fontSize: 40, fontWeight: 600, marginTop: 20, lineHeight: 1.2 }}>času majitele na jeden úklid</div>
          </FadeUp>
        </Interactive.Div>

        <FadeUp
          name="Risk note"
          delay={3.6 * fps}
          style={{
            position: "absolute",
            left: 120,
            right: 120,
            bottom: 100,
            fontSize: 32,
            fontWeight: 600,
            color: "#5b6b72",
            lineHeight: 1.4,
          }}
        >
          <b style={{ color: "#12303f" }}>Hlavní riziko:</b> málo uklízeček na startu → spouštíme v jedné části města s hustou
          nabídkou bytů. <b style={{ color: "#12303f" }}>Záloha:</b> iCal jako nezávislý kanál, ruční fallback.
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
