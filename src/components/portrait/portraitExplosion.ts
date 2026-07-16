import {
  CLICK_RETURN_DELAY,
  MATERIAL_PROFILES,
  TAU,
} from "./portraitConfig";
import { isFacialFragment } from "./portraitMotion";
import type { PortraitRect } from "./portraitRenderer";
import type { Runtime } from "./portraitRuntime";

export const explodePortrait = (
  runtime: Runtime,
  clientX: number,
  clientY: number,
) => {
  runtime.readRect();
  runtime.ensureCanvasSize();
  const portrait: PortraitRect = {
    left: runtime.rectDocument.left - window.scrollX,
    top: runtime.rectDocument.top - window.scrollY,
    width: runtime.rectDocument.width,
    height: runtime.rectDocument.height,
  };
  const clickX = clientX || portrait.left + portrait.width / 2;
  const clickY = clientY || portrait.top + portrait.height / 2;

  const activationTime = performance.now();
  runtime.exploded = true;
  runtime.journeyStarted = false;
  runtime.returning = false;
  runtime.activationSource = "click";
  runtime.activationAt = activationTime;
  runtime.autoReturnAt = activationTime + CLICK_RETURN_DELAY;
  runtime.returnStartedAt = 0;
  runtime.pointer = {
    x: clickX,
    y: clickY,
    active: runtime.canHover,
    seen: true,
  };
  runtime.scrollY = window.scrollY;
  runtime.previousScrollY = window.scrollY;
  runtime.burstStart = activationTime;
  runtime.lastTime = 0;
  runtime.flowClock = 0;

  runtime.pieces.forEach((piece) => {
    const profile = MATERIAL_PROFILES[piece.definition.material];
    const faceFactor = isFacialFragment(piece.definition) ? 0.58 : 1;
    const centerX = portrait.left + piece.definition.center.x * portrait.width;
    const centerY = portrait.top + piece.definition.center.y * portrait.height;
    const baseAngle = Math.atan2(centerY - clickY, centerX - clickX);
    const angle = baseAngle + (piece.definition.randomA - 0.5) * 0.42;
    const directionX = Math.cos(angle);
    const directionY = Math.sin(angle);
    const horizontalSpread = directionX < 0 ? 0.62 : 1;
    const radius =
      portrait.width *
      profile.scatter *
      faceFactor *
      (0.92 + piece.definition.randomB * 0.5);
    piece.scatterX = directionX * radius * horizontalSpread;
    piece.scatterY = directionY * radius - portrait.width * 0.025;
    piece.scatterRotation =
      (piece.definition.randomA - 0.5) * 2 * profile.rotation * faceFactor;
    piece.scatterShear = piece.definition.material === "cloth"
      ? (piece.definition.randomB - 0.5) * 2 * profile.shear
      : 0;
    const velocity =
      portrait.width * profile.impulse * faceFactor *
      (1.28 + piece.definition.randomB * 0.9);
    piece.vx += directionX * velocity * horizontalSpread;
    piece.vy += directionY * velocity - portrait.width * 0.22;
    piece.rotationVelocity +=
      (piece.definition.randomA - 0.5) * profile.rotation * 7;
    piece.scaleVelocity -= 0.28 + piece.definition.randomB * 0.24;
    piece.zVelocity += 0.7 + piece.definition.randomA * 1.15;
    piece.edge = 0.42;
  });

  const sparkCount =
    runtime.tier === "high" ? 11 : runtime.tier === "medium" ? 8 : 5;
  runtime.sparks = Array.from({ length: sparkCount }, (_, index) => {
    const seed = runtime.pieces[index].definition.randomA;
    const isCore = index === 0;
    const rayIndex = Math.max(0, index - 1);
    const rayCount = Math.max(1, sparkCount - 1);
    const angle =
      (rayIndex / rayCount) * TAU +
      (seed - 0.5) * 0.22;
    const speed = isCore ? 0 : portrait.width * (0.36 + seed * 0.34);
    const life = isCore ? 0.34 : 0.46 + seed * 0.24;
    return {
      x: clickX,
      y: clickY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (isCore ? 0 : 18),
      size: isCore ? 40 : 12 + seed * 11,
      alpha: 1,
      peakAlpha: 1,
      warmth: isCore ? 0.18 : seed * 0.08,
      life,
      maxLife: life,
      source: "burst" as const,
    };
  });
};
