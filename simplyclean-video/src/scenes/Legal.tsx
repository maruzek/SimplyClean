import { AbsoluteFill, Interactive, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";
import { Background } from "../components/Background";
import { FadeUp } from "../components/FadeUp";

const rows = [
  { risk: "Platforma určuje odměnu", ours: "Sazbu si uklízečka stanovuje sama v doporučeném pásmu" },
  { risk: "Sankce za odmítnutí zakázky", ours: "Odmítnutí nemá žádný dopad na skóre ani přístup" },
  { risk: "Exkluzivita a povinná dostupnost", ours: "Žádná — čas, oblast i další klienty volí sama" },
  { risk: "Rozhoduje algoritmus", ours: "Vysvětlitelné skóre, lidský přezkum, jmenovitá kontaktní osoba" },
];

export const Legal: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill name="Legal" style={{ fontFamily, color: "#ffffff" }}>
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
          Etika a legislativa · zákon o platformové práci (účinnost 12/2026)
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
          Uklízečky zůstávají nezávislé
        </FadeUp>

        <Interactive.Div
          name="Table"
          style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 44 }}
        >
          <FadeUp name="Table head" delay={0.8 * fps} style={{ display: "flex", gap: 32, fontSize: 26, fontWeight: 600, letterSpacing: 3, color: "#9fb3ba", padding: "0 36px" }}>
            <div style={{ flex: 1 }}>RIZIKOVÁ PRAXE</div>
            <div style={{ flex: 1.4 }}>NAŠE ŘEŠENÍ</div>
          </FadeUp>
          {rows.map((r, i) => (
            <FadeUp
              key={r.risk}
              name={`Row ${i + 1}`}
              delay={1.1 * fps + i * 0.5 * fps}
              style={{
                display: "flex",
                gap: 32,
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "2px solid rgba(255,255,255,0.12)",
                borderRadius: 22,
                padding: "18px 36px",
              }}
            >
              <div style={{ flex: 1, fontSize: 30, fontWeight: 600, color: "#f0a07a", display: "flex", gap: 18, alignItems: "center" }}>
                <span style={{ fontSize: 34 }}>✕</span>
                {r.risk}
              </div>
              <div style={{ flex: 1.4, fontSize: 30, fontWeight: 600, display: "flex", gap: 18, alignItems: "center" }}>
                <span style={{ color: "#7fd1cd", fontSize: 34 }}>✓</span>
                {r.ours}
              </div>
            </FadeUp>
          ))}
        </Interactive.Div>

        <FadeUp
          name="Extra principles"
          delay={3.6 * fps}
          style={{
            marginTop: 40,
            display: "flex",
            gap: 20,
          }}
        >
          {["Transparentní cena", "Výplata každý týden", "Žádné soutěžení cenou dolů", "CZ · UA · EN rozhraní"].map((t) => (
            <div
              key={t}
              style={{
                flex: 1,
                backgroundColor: "#157a78",
                borderRadius: 18,
                padding: "18px 22px",
                fontSize: 27,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {t}
            </div>
          ))}
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
