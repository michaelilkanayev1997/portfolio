import { clamp } from "./portraitMath";
import type { Runtime } from "./portraitRuntime";

export const emitHoverGlint = (
  runtime: Runtime,
  x: number,
  y: number,
) => {
  const now = performance.now();
  const previous = runtime.hoverTrace;
  const deltaTime = now - previous.time;
  const deltaX = x - previous.x;
  const deltaY = y - previous.y;
  const distance = Math.hypot(deltaX, deltaY);

  runtime.hoverTrace = { x, y, time: now };

  if (
    runtime.tier === "low" ||
    deltaTime < (runtime.tier === "high" ? 38 : 64) ||
    distance < 7
  ) {
    return;
  }

  const hoverLimit = runtime.tier === "high" ? 4 : 2;
  const hoverCount = runtime.sparks.reduce(
    (count, spark) => count + Number(spark.source === "hover"),
    0,
  );
  if (hoverCount >= hoverLimit) return;

  const pointerSpeed = distance / Math.max(12, deltaTime);
  const energy = clamp(pointerSpeed / 1.15);
  if (energy < 0.16) return;

  const life = 0.15 + energy * 0.1;
  const trailVelocity = 72 + energy * 44;
  runtime.sparks.push({
    x: x - deltaX * 0.16,
    y: y - deltaY * 0.16,
    vx: -(deltaX / Math.max(12, deltaTime)) * trailVelocity,
    vy:
      -(deltaY / Math.max(12, deltaTime)) * trailVelocity -
      10 -
      energy * 12,
    size: 5.5 + energy * 6.5,
    alpha: 0.38 + energy * 0.34,
    peakAlpha: 0.38 + energy * 0.34,
    warmth: 0.015 + energy * 0.025,
    life,
    maxLife: life,
    source: "hover",
  });
};
