import type { FragmentDefinition, QualityTier } from "./fragmentMesh";
import type { FragmentTransform, SparkRender } from "./portraitRenderer";

export type PieceMotion = FragmentTransform & {
  definition: FragmentDefinition;
  vx: number;
  vy: number;
  rotationVelocity: number;
  scaleVelocity: number;
  zVelocity: number;
  shearVelocity: number;
  scatterX: number;
  scatterY: number;
  scatterRotation: number;
  scatterShear: number;
  dustScale: number;
  dustOpacity: number;
  returnHoldX: number;
  returnHoldY: number;
  returnHoldRotation: number;
  returnHoldScale: number;
  returnHoldZ: number;
  returnHoldShear: number;
};

export type Spark = SparkRender & {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  peakAlpha: number;
  source: "burst" | "hover";
};

export const isFacialFragment = (definition: FragmentDefinition) =>
  definition.id.startsWith("skin-") || definition.id.startsWith("beard-");

export const makePiece = (
  definition: FragmentDefinition,
  tier: QualityTier,
): PieceMotion => ({
  definition,
  x: 0,
  y: 0,
  rotation: 0,
  scale: 1,
  z: 0,
  alpha: 1,
  edge: 0,
  shear: 0,
  vx: 0,
  vy: 0,
  rotationVelocity: 0,
  scaleVelocity: 0,
  zVelocity: 0,
  shearVelocity: 0,
  scatterX: 0,
  scatterY: 0,
  scatterRotation: 0,
  scatterShear: 0,
  dustScale:
    tier === "high"
      ? 0.06 + definition.randomA * 0.04
      : tier === "medium"
        ? 0.052 + definition.randomA * 0.034
        : 0.042 + definition.randomA * 0.024,
  dustOpacity:
    tier === "high"
      ? 0.25 + definition.randomB * 0.21
      : tier === "medium"
        ? 0.22 + definition.randomB * 0.18
        : 0.19 + definition.randomB * 0.15,
  returnHoldX: 0,
  returnHoldY: 0,
  returnHoldRotation: 0,
  returnHoldScale: 1,
  returnHoldZ: 0,
  returnHoldShear: 0,
});
