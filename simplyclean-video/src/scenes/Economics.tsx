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
import { Counter } from "../components/Counter";

export const Economics: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill name="Economics" style={{ fontFamily, color: "#12303f" }}>
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
          Byznys model
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
          Provize 18 %. Žádné předplatné.
        </FadeUp>

        {/* Split bar: 800 Kč */}
        <FadeUp name="Split label" delay={0.9 * fps} style={{ marginTop: 50, fontSize: 30, fontWeight: 600, color: "#5b6b72" }}>
          Jeden úklid · 800 Kč (2,5 h × 300 Kč + materiál)
        </FadeUp>
        <Interactive.Div
          name="Split bar"
          style={{
            marginTop: 16,
            height: 110,
            display: "flex",
            borderRadius: 30,
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(18,48,63,0.10)",
            opacity: interpolate(frame, [1.1 * fps, 1.4 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              width: `${interpolate(frame, [1.3 * fps, 2.6 * fps], [100, 82], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              })}%`,
              backgroundColor: "#157a78",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 44px",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            <span>Uklízečka · 82 %</span>
            <span>656 Kč</span>
          </div>
          <div
            style={{
              flex: 1,
              backgroundColor: "#d9622b",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 800,
              whiteSpace: "nowrap",
            }}
          >
            18 % · 144 Kč
          </div>
        </Interactive.Div>

        {/* Margin chain */}
        <Interactive.Div
          name="Margin chain"
          style={{ display: "flex", alignItems: "center", gap: 32, marginTop: 44 }}
        >
          <FadeUp name="Margin per clean" delay={3 * fps} style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 28, padding: "26px 32px", boxShadow: "0 20px 50px rgba(18,48,63,0.08)" }}>
            <div style={{ fontSize: 24, color: "#5b6b72", fontWeight: 600, whiteSpace: "nowrap" }}>Marže na úklid (po platební bráně)</div>
            <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2 }}>
              <Counter to={180} delay={3.1 * fps} suffix=" Kč" />
            </div>
          </FadeUp>
          <FadeUp name="Times" delay={3.5 * fps} style={{ fontSize: 60, fontWeight: 800, color: "#157a78" }}>
            × 8
          </FadeUp>
          <FadeUp name="Margin per flat" delay={3.8 * fps} style={{ flex: 1, backgroundColor: "#157a78", color: "#ffffff", borderRadius: 28, padding: "26px 32px", boxShadow: "0 30px 70px rgba(21,122,120,0.35)" }}>
            <div style={{ fontSize: 24, color: "#bfe7e4", fontWeight: 600, whiteSpace: "nowrap" }}>Marže na byt měsíčně (8 úklidů)</div>
            <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2 }}>
              <Counter to={1440} delay={3.9 * fps} suffix=" Kč" />
            </div>
          </FadeUp>
          <FadeUp name="Arrow" delay={4.4 * fps} style={{ fontSize: 60, fontWeight: 800, color: "#157a78" }}>
            →
          </FadeUp>
          <FadeUp name="Payback" delay={4.7 * fps} style={{ flex: 1, backgroundColor: "#12303f", color: "#ffffff", borderRadius: 28, padding: "26px 32px" }}>
            <div style={{ fontSize: 24, color: "#9fb3ba", fontWeight: 600, whiteSpace: "nowrap" }}>Návratnost akvizice (800–1 500 Kč)</div>
            <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2 }}>&lt; 1 měsíc</div>
          </FadeUp>
        </Interactive.Div>

        <FadeUp
          name="Breakeven"
          delay={6 * fps}
          style={{
            marginTop: 44,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 30,
            fontWeight: 600,
            color: "#5b6b72",
          }}
        >
          <span><b style={{ color: "#12303f" }}>Fixní náklady:</b> 260 tis. Kč / měsíc</span>
          <span><b style={{ color: "#12303f" }}>Bod zvratu:</b> 180–220 bytů (≈ 5 % SAM)</span>
          <span><b style={{ color: "#12303f" }}>Strop SAM:</b> 56–67 mil. Kč ročně</span>
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
