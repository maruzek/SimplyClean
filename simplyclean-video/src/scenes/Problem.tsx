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

const bubbles = [
  { text: "Ahoj, můžeš v úterý ve 13:00?", mine: true },
  { text: "Jo, ale jen do 15. Kde je klíč?", mine: false },
  { text: "Host se posunul, změna na 16:00 😩", mine: true },
  { text: "To už nestíhám, sorry", mine: false },
  { text: "Zrušeno. Sobota? Prosím…", mine: true },
];

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill name="Problem" style={{ fontFamily, color: "#12303f" }}>
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
            color: "#d9622b",
          }}
        >
          Problém
        </FadeUp>
        <FadeUp
          name="Headline"
          delay={0.2 * fps}
          style={{
            fontSize: 76,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1.1,
            marginTop: 16,
            whiteSpace: "nowrap",
          }}
        >
          Každá rezervace = ruční objednávka úklidu
        </FadeUp>

        {/* Calendar card */}
        <FadeUp
          name="Calendar card"
          delay={0.8 * fps}
          style={{
            position: "absolute",
            left: 120,
            top: 300,
            width: 700,
            backgroundColor: "#ffffff",
            borderRadius: 32,
            padding: 40,
            boxShadow: "0 30px 80px rgba(18,48,63,0.10)",
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 600,
              color: "#5b6b72",
              marginBottom: 24,
            }}
          >
            Rezervační kalendář · Byt Vinohrady
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {Array.from({ length: 28 }).map((_, i) => {
              const booked = [1, 2, 3, 5, 6, 8, 9, 10, 11, 13, 14, 16, 17, 18, 20, 21, 22, 24, 25, 27].includes(i);
              const isStart = booked && ![2, 3, 6, 9, 10, 11, 14, 17, 18, 21, 22, 25].includes(i);
              return (
                <div
                  key={i}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    fontWeight: 600,
                    backgroundColor: booked ? "#157a78" : "#eef2f1",
                    color: booked ? "#ffffff" : "#5b6b72",
                    border: isStart ? "4px solid #d9622b" : "4px solid transparent",
                    opacity: interpolate(
                      frame,
                      [1.2 * fps + i * 1.5, 1.2 * fps + i * 1.5 + 8],
                      [0, 1],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                    ),
                  }}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 26, color: "#5b6b72", marginTop: 24 }}>
            <span style={{ color: "#d9622b", fontWeight: 600 }}>▢ oranžově</span>{" "}
            = nový příjezd → je potřeba objednat úklid
          </div>
        </FadeUp>

        {/* Chat bubbles */}
        <Interactive.Div
          name="Chat"
          style={{
            position: "absolute",
            right: 120,
            top: 300,
            width: 760,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {bubbles.map((b, i) => (
            <FadeUp
              key={i}
              name={`Bubble ${i + 1}`}
              delay={2.4 * fps + i * 0.7 * fps}
              style={{
                alignSelf: b.mine ? "flex-end" : "flex-start",
                backgroundColor: b.mine ? "#157a78" : "#ffffff",
                color: b.mine ? "#ffffff" : "#12303f",
                fontSize: 30,
                fontWeight: 400,
                padding: "18px 30px",
                borderRadius: 28,
                maxWidth: 600,
                boxShadow: "0 10px 30px rgba(18,48,63,0.08)",
              }}
            >
              {b.text}
            </FadeUp>
          ))}
        </Interactive.Div>

        {/* Bottom stat */}
        <Interactive.Div
          name="Stat"
          style={{
            position: "absolute",
            left: 120,
            right: 120,
            bottom: 70,
            display: "flex",
            alignItems: "baseline",
            gap: 28,
            opacity: interpolate(frame, [6.4 * fps, 6.9 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [6.4 * fps, 7.2 * fps], [0.9, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 200 }),
              output: "perceptual-scale",
            }),
          }}
        >
          <span style={{ fontSize: 104, fontWeight: 800, color: "#d9622b", letterSpacing: -4 }}>
            7–9×
          </span>
          <span style={{ fontSize: 40, fontWeight: 600, color: "#12303f" }}>
            měsíčně na jeden byt. Desítky minut u každé rezervace.
          </span>
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
