import type { MaterialName } from "./fragmentMesh";

export const MAX_DELTA = 1 / 30;
export const CLICK_RETURN_DELAY = 1_450;
export const SCROLL_DRIFT_WINDOW = 1_050;
export const TOP_EPSILON = 18;
export const TAU = Math.PI * 2;

// These are recognizable landmarks from the portrait, not arbitrary particles.
// They become the bright nodes of a miniature portrait-shaped star map.
export const CONSTELLATION_LANDMARKS = new Map<string, number>([
  ["hair-crown-left", 0],
  ["hair-fringe", 1],
  ["hair-crown-right", 2],
  ["skin-forehead", 3],
  ["skin-cheek-right", 4],
  ["skin-nose", 5],
  ["skin-cheek-left", 6],
  ["skin-ear-left", 7],
  ["beard-left", 8],
  ["skin-mouth", 9],
  ["beard-right", 10],
  ["hand-index-tip", 11],
  ["hand-lower", 12],
  ["cloth-logo", 13],
  ["cloth-shoulder-left", 14],
  ["cloth-shoulder-right", 15],
]);

type MaterialProfile = {
  hoverDepth: number;
  scatter: number;
  impulse: number;
  stiffness: number;
  damping: number;
  rotation: number;
  shear: number;
  returnDelay: number;
  returnStiffness: number;
  returnDamping: number;
};

export const MATERIAL_PROFILES: Record<MaterialName, MaterialProfile> = {
  glass: {
    hoverDepth: 1.3,
    scatter: 0.3,
    impulse: 1.05,
    stiffness: 34,
    damping: 7.2,
    rotation: 0.26,
    shear: 0,
    returnDelay: 0.035,
    returnStiffness: 31,
    returnDamping: 9.6,
  },
  metal: {
    hoverDepth: 0.86,
    scatter: 0.2,
    impulse: 0.66,
    stiffness: 48,
    damping: 10.5,
    rotation: 0.12,
    shear: 0,
    returnDelay: 0.02,
    returnStiffness: 34,
    returnDamping: 10.2,
  },
  cloth: {
    hoverDepth: 1.02,
    scatter: 0.42,
    impulse: 1.14,
    stiffness: 19,
    damping: 5.8,
    rotation: 0.48,
    shear: 0.14,
    returnDelay: 0.055,
    returnStiffness: 24,
    returnDamping: 8.2,
  },
  skin: {
    hoverDepth: 0.86,
    scatter: 0.19,
    impulse: 0.56,
    stiffness: 25,
    damping: 8.6,
    rotation: 0.13,
    shear: 0,
    returnDelay: 0.035,
    returnStiffness: 29,
    returnDamping: 9,
  },
  hair: {
    hoverDepth: 0.94,
    scatter: 0.25,
    impulse: 0.78,
    stiffness: 29,
    damping: 8,
    rotation: 0.2,
    shear: 0,
    returnDelay: 0.025,
    returnStiffness: 30,
    returnDamping: 9,
  },
};
