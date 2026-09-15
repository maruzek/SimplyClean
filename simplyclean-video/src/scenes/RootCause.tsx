import { AbsoluteFill, Interactive, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { Background } from "../components/Background";
import { FadeUp } from "../components/FadeUp";

const causes = [
  { title: "Kalendář nikam nevede", sub: "systémová příčina" },
  { title: "7–9 úklidů měsíčně na byt", sub: "chybí měřítko pro vlastní nástroj" },
  { title: "Každý majitel to dělá jinak", sub: "behaviorální příčina" },
];

export const RootCause: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill name="RootCause" style={{ fontFamily, color: "#ffffff" }}>
      <Background accent="navy" />
      <AbsoluteFill style={{ padding: "100px 120px" }}>
        <FadeUp
          name="Kicker"
          delay={0}
          style={{
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#7fd1cd",
          }}
        >
          5 Whys · Ishikawa
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
          Proč se úklid objednává ručně?
        </FadeUp>

        <Interactive.Div
          name="Cause cards"
          style={{
            display: "flex",
            gap: 32,
            marginTop: 70,
          }}
        >
          {causes.map((c, i) => (
            <FadeUp
              key={c.title}
              name={`Cause ${i + 1}`}
              delay={1 * fps + i * 0.5 * fps}
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "2px solid rgba(255,255,255,0.14)",
                borderRadius: 32,
                padding: 40,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  border: "5px solid #d9622b",
                  fontSize: 30,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 28,
                  color: "#d9622b",
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontSize: 44, fontWeight: 600, lineHeight: 1.2 }}>
                {c.title}
              </div>
              <div style={{ fontSize: 28, color: "#9fb3ba", marginTop: 14 }}>
                {c.sub}
              </div>
            </FadeUp>
          ))}
        </Interactive.Div>

        <FadeUp
          name="Root cause statement"
          delay={3.2 * fps}
          style={{
            position: "absolute",
            left: 120,
            right: 120,
            bottom: 100,
            backgroundColor: "#157a78",
            borderRadius: 32,
            padding: "44px 56px",
            fontSize: 44,
            fontWeight: 600,
            lineHeight: 1.3,
          }}
        >
          <span style={{ color: "#7fd1cd", fontWeight: 800 }}>Kořenová příčina: </span>
          úklid mezi hosty je častý, ale roztříštěný proces bez sdílené
          infrastruktury. Vyplatí se až při agregaci mnoha majitelů.
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
