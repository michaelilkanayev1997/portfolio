export const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.max(minimum, Math.min(maximum, value));

export const lerp = (start: number, end: number, amount: number) =>
  start + (end - start) * amount;

export const smoothstep = (value: number) => {
  const normalized = clamp(value);
  return normalized * normalized * (3 - 2 * normalized);
};
