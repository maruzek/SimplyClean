import { AbsoluteFill, Interactive, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { Background } from "../components/Background";
import { FadeUp } from "../components/FadeUp";
import { Counter } from "../components/Counter";

export const Market: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill name="Market" style={{ fontFamily, color: "#12303f" }}>
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
          Velikost trhu · Praha
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
          Malí hostitelé, které nikdo neobsluhuje
        </FadeUp>

        <Interactive.Div
          name="Stats"
          style={{ display: "flex", gap: 32, marginTop: 80 }}
        >
          <FadeUp
            name="TAM"
            delay={0.9 * fps}
            style={{
              flex: 1,
              backgroundColor: "#ffffff",
              borderRadius: 32,
              padding: 44,
              boxShadow: "0 20px 50px rgba(18,48,63,0.08)",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 600, color: "#5b6b72", letterSpacing: 3 }}>TAM</div>
            <div style={{ fontSize: 112, fontWeight: 800, letterSpacing: -4, color: "#12303f", lineHeight: 1.1 }}>
              <Counter to={7878} delay={1.1 * fps} />
            </div>
            <div style={{ fontSize: 32, fontWeight: 600, marginTop: 8 }}>aktivních bytů na Airbnb</div>
            <div style={{ fontSize: 26, color: "#5b6b72", marginTop: 8 }}>≈ 1,1 % bytového fondu (IPR, 6/2026)</div>
          </FadeUp>

          <FadeUp
            name="SAM"
            delay={1.3 * fps}
            style={{
              flex: 1,
              backgroundColor: "#157a78",
              color: "#ffffff",
              borderRadius: 32,
              padding: 44,
              boxShadow: "0 30px 70px rgba(21,122,120,0.35)",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 600, color: "#bfe7e4", letterSpacing: 3 }}>SAM · náš trh</div>
            <div style={{ fontSize: 112, fontWeight: 800, letterSpacing: -4, lineHeight: 1.1 }}>
              <Counter to={3900} delay={1.5 * fps} />
            </div>
            <div style={{ fontSize: 32, fontWeight: 600, marginTop: 8 }}>bytů majitelů 1–5 jednotek</div>
            <div style={{ fontSize: 26, color: "#bfe7e4", marginTop: 8 }}>≈ 1 400 hostitelů bez profesionální správy</div>
          </FadeUp>

          <FadeUp
            name="Demand"
            delay={1.7 * fps}
            style={{
              flex: 1,
              backgroundColor: "#ffffff",
              borderRadius: 32,
              padding: 44,
              boxShadow: "0 20px 50px rgba(18,48,63,0.08)",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 600, color: "#5b6b72", letterSpacing: 3 }}>POPTÁVKA 2025</div>
            <div style={{ fontSize: 112, fontWeight: 800, letterSpacing: -4, color: "#d9622b", lineHeight: 1.1 }}>
              <Counter to={8.27} delay={1.9 * fps} decimals={2} />
            </div>
            <div style={{ fontSize: 32, fontWeight: 600, marginTop: 8 }}>milionu hostů v Praze</div>
            <div style={{ fontSize: 26, color: "#5b6b72", marginTop: 8 }}>nejvíce v historii (ČSÚ)</div>
          </FadeUp>
        </Interactive.Div>

        <FadeUp
          name="Footnote"
          delay={4 * fps}
          style={{
            position: "absolute",
            left: 120,
            right: 120,
            bottom: 100,
            fontSize: 34,
            fontWeight: 600,
            color: "#5b6b72",
            lineHeight: 1.35,
          }}
        >
          Full-service správci berou 15–20 % výnosu a kontrolu nad bytem. Úklidové firmy neznají
          kalendář. <span style={{ color: "#157a78" }}>Mezi tím chybí samoobslužná vrstva — to je SimplyClean.</span>
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
