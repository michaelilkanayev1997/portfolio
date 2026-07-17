import type { QualityTier } from "./fragmentMesh";

const ALPHA_MAP_SIZE = 192;

export const detectQualityTier = (): QualityTier => {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const memory = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  if (
    nav.connection?.saveData ||
    memory <= 4 ||
    cores <= 4 ||
    (coarsePointer && window.innerWidth < 820)
  ) {
    return "low";
  }
  if (memory <= 6 || cores <= 6 || window.innerWidth < 1080) return "medium";
  return "high";
};

export const calculatePixelRatio = (
  tier: QualityTier,
  width: number,
  height: number,
) => {
  const isNarrowViewport = width < 760;
  const cap = isNarrowViewport
    ? 2.5
    : tier === "high"
      ? 1.75
      : tier === "medium"
        ? 1.5
        : 1.25;
  const pixelBudget =
    isNarrowViewport
      ? 2_600_000
      : tier === "high"
      ? 4_400_000
      : tier === "medium"
        ? 2_800_000
        : 1_400_000;
  const budgetRatio = Math.sqrt(pixelBudget / Math.max(1, width * height));
  return Math.max(1, Math.min(window.devicePixelRatio || 1, cap, budgetRatio));
};

export const createAlphaMap = (image: HTMLImageElement) => {
  const canvas = document.createElement("canvas");
  canvas.width = ALPHA_MAP_SIZE;
  canvas.height = ALPHA_MAP_SIZE;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Unable to inspect portrait alpha");
  context.clearRect(0, 0, ALPHA_MAP_SIZE, ALPHA_MAP_SIZE);
  context.drawImage(image, 0, 0, ALPHA_MAP_SIZE, ALPHA_MAP_SIZE);
  return context.getImageData(0, 0, ALPHA_MAP_SIZE, ALPHA_MAP_SIZE);
};

export const waitForImage = async (image: HTMLImageElement) => {
  if (!image.complete) {
    await new Promise<void>((resolve, reject) => {
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => reject(new Error("Portrait failed to load")), {
        once: true,
      });
    });
  }
  if (image.decode) await image.decode().catch(() => undefined);
  if (!image.naturalWidth || !image.naturalHeight) {
    throw new Error("Portrait has no intrinsic size");
  }
};
