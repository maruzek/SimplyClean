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

const steps = [
  { icon: "🗓", title: "Nová rezervace", sub: "host rezervuje termín" },
  { icon: "🔗", title: "Kalendář (iCal)", sub: "připojen jednorázově" },
  { icon: "⏱", title: "Úklidový slot", sub: "okno mezi odjezdem a příjezdem" },
  { icon: "📍", title: "Nabídka & přijetí", sub: "uklízečka v okolí, první bere" },
  { icon: "📸", title: "Úklid + fotoprotokol", sub: "majitel dostane jen potvrzení" },
];

export const Flow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill name="Flow" style={{ fontFamily, color: "#12303f" }}>
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
          Řešení · bez ručních objednávek
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
          Od rezervace k uklizenému bytu
        </FadeUp>

        <Interactive.Div
          name="Steps"
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 0,
            marginTop: 90,
          }}
        >
          {steps.map((s, i) => (
            <div key={s.title} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <FadeUp
                name={`Step ${i + 1}`}
                delay={1 * fps + i * 0.6 * fps}
                style={{
                  flex: 1,
                  backgroundColor: "#ffffff",
                  borderRadius: 28,
                  padding: "32px 28px",
                  minHeight: 300,
                  boxShadow: "0 20px 50px rgba(18,48,63,0.08)",
                  borderTop: "8px solid #157a78",
                }}
              >
                <div style={{ fontSize: 60, marginBottom: 20 }}>{s.icon}</div>
                <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15 }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 26, color: "#5b6b72", marginTop: 14, lineHeight: 1.3 }}>
                  {s.sub}
                </div>
              </FadeUp>
              {i < steps.length - 1 ? (
                <div
                  style={{
                    width: 56,
                    display: "flex",
                    justifyContent: "center",
                    fontSize: 40,
                    color: "#157a78",
                    fontWeight: 800,
                    opacity: interpolate(
                      frame,
                      [1.4 * fps + i * 0.6 * fps, 1.7 * fps + i * 0.6 * fps],
                      [0, 1],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                    ),
                  }}
                >
                  →
                </div>
              ) : null}
            </div>
          ))}
        </Interactive.Div>

        {/* Bottom row */}
        <Interactive.Div
          name="Bottom row"
          style={{
            position: "absolute",
            left: 120,
            right: 120,
            bottom: 90,
            display: "flex",
            alignItems: "center",
            gap: 40,
          }}
        >
          <Interactive.Div
            name="Exception note"
            style={{
              flex: 1,
              display: "flex",
              gap: 24,
              alignItems: "center",
              backgroundColor: "#fbe6d9",
              border: "3px dashed #d9622b",
              borderRadius: 24,
              padding: "22px 32px",
              fontSize: 28,
              fontWeight: 600,
              lineHeight: 1.3,
              color: "#8a3c14",
              opacity: interpolate(frame, [4.6 * fps, 5 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: interpolate(frame, [4.6 * fps, 5.4 * fps], ["-30px 0px", "0px 0px"], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.spring({ damping: 200 }),
              }),
            }}
          >
            <span style={{ fontSize: 44 }}>↻</span>
            <span>
              Změna nebo zrušení rezervace → slot se přeplánuje sám.
              <br />
              Výpadek uklízečky → záskok na jedno kliknutí.
            </span>
          </Interactive.Div>

          <Interactive.Div
            name="Owner effort"
            style={{
              textAlign: "right",
              opacity: interpolate(frame, [6 * fps, 6.5 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div style={{ fontSize: 24, color: "#5b6b72", fontWeight: 600, letterSpacing: 3 }}>ZÁSAH MAJITELE</div>
            <div style={{ fontSize: 40, fontWeight: 800, color: "#157a78", whiteSpace: "nowrap" }}>
              1× při registraci · dál žádný
            </div>
          </Interactive.Div>
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
