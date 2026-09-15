import { AbsoluteFill, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// Shared off-white backdrop with a slowly drifting teal blob.
export const Background: React.FC<{ accent?: "teal" | "navy" }> = ({
  accent = "teal",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill
      name="Background"
      style={{ backgroundColor: accent === "navy" ? "#12303f" : "#f3f6f5" }}
    >
      <Interactive.Div
        name="Blob"
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          borderRadius: 550,
          right: -350,
          top: -450,
          backgroundColor: accent === "navy" ? "#1b4a55" : "#d9ecea",
          opacity: 0.9,
          translate: interpolate(
            frame,
            [0, durationInFrames],
            ["0px 0px", "-60px 40px"],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      />
      <Interactive.Div
        name="Blob small"
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: 260,
          left: -200,
          bottom: -260,
          backgroundColor: accent === "navy" ? "#0f3a44" : "#fbe6d9",
          opacity: 0.8,
        }}
      />
    </AbsoluteFill>
  );
};
