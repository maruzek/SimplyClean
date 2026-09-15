import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const formatCzech = (n: number, decimals: number) => {
  const fixed = n.toFixed(decimals);
  const [int, frac] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return frac ? `${grouped},${frac}` : grouped;
};

// Number that counts up from 0 to `to`, starting at `delay` frames.
export const Counter: React.FC<{
  to: number;
  delay: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}> = ({ to, delay, decimals = 0, suffix = "", prefix = "" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const value = interpolate(frame - delay, [0, 1.6 * fps], [0, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <>
      {prefix}
      {formatCzech(value, decimals)}
      {suffix}
    </>
  );
};
