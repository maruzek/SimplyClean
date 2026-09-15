import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../fonts";
import { Background } from "../components/Background";
import { FadeUp } from "../components/FadeUp";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill name="Outro" style={{ fontFamily, color: "#ffffff" }}>
      <Background accent="navy" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 120 }}>
        <Interactive.Div
          name="Quote"
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1.15,
            textAlign: "center",
            maxWidth: 1500,
            opacity: interpolate(frame, [0.2 * fps, 0.8 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [0.2 * fps, 1.2 * fps], [0.92, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 200 }),
              output: "perceptual-scale",
            }),
          }}
        >
          „Nula zpráv měsíčně.
          <br />
          <span style={{ color: "#7fd1cd" }}>Kalendář připojíte jednou.“</span>
        </Interactive.Div>

        <FadeUp
          name="Logo row"
          delay={1.6 * fps}
          style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 70 }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              backgroundColor: "#157a78",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
            }}
          >
            ✦
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -2 }}>SimplyClean</div>
        </FadeUp>

        <FadeUp
          name="Credits"
          delay={2.4 * fps}
          style={{
            position: "absolute",
            bottom: 100,
            textAlign: "center",
            fontSize: 30,
            color: "#9fb3ba",
            lineHeight: 1.6,
          }}
        >
          <div style={{ color: "#ffffff", fontWeight: 600 }}>
            Michael Černý · Jakub Lisý · Anna Štefanková · Oliver Slivka · Martin Růžek
          </div>
          <div>Tým č. 3 „Mladé svaly“ · Skupina S4 · Mentor prof. Josef Hynek · VŠE</div>
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
