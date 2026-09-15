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

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill name="Intro" style={{ fontFamily, color: "#12303f" }}>
      <Background />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 120,
        }}
      >
        <FadeUp
          name="Course badge"
          delay={0.2 * fps}
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#157a78",
            backgroundColor: "#ffffff",
            padding: "14px 32px",
            borderRadius: 999,
            marginBottom: 48,
          }}
        >
          Metadovednosti pro praxi I · Projektová dokumentace
        </FadeUp>

        <Interactive.Div
          name="Logo mark"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 36,
            scale: interpolate(frame, [0.4 * fps, 1.4 * fps], [0.7, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 14 }),
              output: "perceptual-scale",
            }),
            opacity: interpolate(frame, [0.4 * fps, 0.8 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <Interactive.Div
            name="Logo icon"
            style={{
              width: 140,
              height: 140,
              borderRadius: 40,
              backgroundColor: "#157a78",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 90,
              boxShadow: "0 30px 60px rgba(21,122,120,0.35)",
            }}
          >
            ✦
          </Interactive.Div>
          <Interactive.Div
            name="Title"
            style={{ fontSize: 160, fontWeight: 800, letterSpacing: -6 }}
          >
            SimplyClean
          </Interactive.Div>
        </Interactive.Div>

        <FadeUp
          name="Subtitle"
          delay={1.2 * fps}
          style={{
            fontSize: 52,
            fontWeight: 400,
            color: "#5b6b72",
            marginTop: 40,
            textAlign: "center",
            maxWidth: 1400,
            lineHeight: 1.25,
          }}
        >
          Automatické objednávání úklidu krátkodobých pronájmů
        </FadeUp>

        <FadeUp
          name="Team"
          delay={2 * fps}
          style={{
            position: "absolute",
            bottom: 100,
            fontSize: 30,
            fontWeight: 600,
            color: "#157a78",
          }}
        >
          Tým č. 3 „Mladé svaly“ · Skupina S4 · Mentor prof. Josef Hynek
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
