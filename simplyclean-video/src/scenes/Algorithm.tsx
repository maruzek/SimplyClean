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

const weights = [
  { label: "Vzdálenost od ostatních zakázek téhož dne", pct: 40, color: "#157a78" },
  { label: "Historická spolehlivost (dokončeno včas)", pct: 30, color: "#1f9490" },
  { label: "Hodnocení kvality od majitelů", pct: 20, color: "#4fb3ae" },
  { label: "Doba od poslední zakázky (rovnoměrnost)", pct: 10, color: "#8fd0cc" },
];

export const Algorithm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill name="Algorithm" style={{ fontFamily, color: "#12303f" }}>
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
          Automatizace
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
          Komu se úklid nabídne? Rozhoduje vážené skóre
        </FadeUp>

        <Interactive.Div
          name="Bars"
          style={{
            marginTop: 70,
            display: "flex",
            flexDirection: "column",
            gap: 30,
            width: 1100,
          }}
        >
          {weights.map((w, i) => (
            <FadeUp key={w.label} name={`Weight ${i + 1}`} delay={0.8 * fps + i * 0.35 * fps}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, fontWeight: 600, marginBottom: 10 }}>
                <span>{w.label}</span>
                <span style={{ color: w.color, fontWeight: 800 }}>{w.pct} %</span>
              </div>
              <div style={{ height: 44, borderRadius: 22, backgroundColor: "#e3eae8", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    borderRadius: 22,
                    backgroundColor: w.color,
                    width: `${interpolate(
                      frame,
                      [1.2 * fps + i * 0.35 * fps, 2.4 * fps + i * 0.35 * fps],
                      [0, (w.pct / 40) * 100],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) },
                    )}%`,
                  }}
                />
              </div>
            </FadeUp>
          ))}
        </Interactive.Div>

        {/* Routing illustration */}
        <FadeUp
          name="Routing card"
          delay={3.4 * fps}
          style={{
            position: "absolute",
            right: 120,
            top: 380,
            width: 520,
            backgroundColor: "#12303f",
            color: "#ffffff",
            borderRadius: 32,
            padding: 44,
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 600, color: "#7fd1cd", letterSpacing: 3, textTransform: "uppercase" }}>
            Trasování
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.2, marginTop: 14 }}>
            Čtyři byty vedle sebe místo čtyř rozesetých po Praze
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 30 }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 20,
                  backgroundColor: "#157a78",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 44,
                  opacity: interpolate(frame, [4 * fps + i * 8, 4 * fps + i * 8 + 10], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                🏠
              </div>
            ))}
          </div>
          <div style={{ fontSize: 28, color: "#9fb3ba", marginTop: 26, lineHeight: 1.35 }}>
            Uklízečka: 2 600 Kč denně místo 1 950 Kč. Majitel: nižší cena.
          </div>
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
