import type { CSSProperties, PropsWithChildren } from "react";
import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Element that fades in and slides up after `delay` frames.
export const FadeUp: React.FC<
  PropsWithChildren<{ name: string; delay: number; style?: CSSProperties }>
> = ({ name, delay, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - delay;

  return (
    <Interactive.Div
      name={name}
      style={{
        ...style,
        opacity: interpolate(t, [0, 0.4 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        translate: interpolate(t, [0, 0.7 * fps], ["0px 40px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 200 }),
        }),
      }}
    >
      {children}
    </Interactive.Div>
  );
};
