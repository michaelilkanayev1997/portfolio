export const MATERIAL_IDS = {
  glass: 0,
  metal: 1,
  cloth: 2,
  skin: 3,
  hair: 4,
} as const;

export type MaterialName = keyof typeof MATERIAL_IDS;
export type QualityTier = "high" | "medium" | "low";

export type Point = {
  x: number;
  y: number;
};

type Seed = Point & {
  id: string;
  material: MaterialName;
  priority: 0 | 1 | 2;
};

export type FragmentDefinition = {
  id: string;
  index: number;
  material: MaterialName;
  materialId: number;
  center: Point;
  polygon: Point[];
  randomA: number;
  randomB: number;
};

const seed = (
  id: string,
  material: MaterialName,
  x: number,
  y: number,
  priority: 0 | 1 | 2,
): Seed => ({ id, material, x, y, priority });

// The points follow actual landmarks in Michael's portrait. Both supplied hero
// assets share the same normalized crop, so this map is resolution-independent.
const PORTRAIT_SEEDS: Seed[] = [
  seed("hair-crown-left", "hair", 0.45, 0.06, 0),
  seed("hair-crown-center", "hair", 0.57, 0.05, 1),
  seed("hair-crown-right", "hair", 0.66, 0.1, 0),
  seed("hair-temple-left", "hair", 0.39, 0.15, 2),
  seed("hair-fringe", "hair", 0.5, 0.15, 0),
  seed("hair-temple-right", "hair", 0.62, 0.17, 1),
  seed("hair-edge-right", "hair", 0.7, 0.19, 2),

  seed("glass-left-outer", "glass", 0.43, 0.27, 0),
  seed("glass-left-inner", "glass", 0.49, 0.27, 1),
  seed("glass-left-lower", "glass", 0.44, 0.32, 2),
  seed("glass-left-feature", "glass", 0.51, 0.32, 0),
  seed("glass-bridge", "glass", 0.55, 0.29, 1),
  seed("glass-right-feature", "glass", 0.59, 0.28, 0),
  seed("glass-right-inner", "glass", 0.66, 0.27, 1),
  seed("glass-right-lower", "glass", 0.61, 0.33, 2),
  seed("glass-right-outer", "glass", 0.68, 0.32, 0),

  seed("skin-forehead", "skin", 0.54, 0.21, 0),
  seed("skin-temple-left", "skin", 0.38, 0.27, 1),
  seed("skin-temple-right", "skin", 0.72, 0.28, 1),
  seed("skin-cheek-left", "skin", 0.45, 0.37, 0),
  seed("skin-nose", "skin", 0.55, 0.36, 0),
  seed("skin-cheek-right", "skin", 0.64, 0.38, 1),
  seed("skin-brow-left", "skin", 0.47, 0.23, 2),
  seed("skin-brow-right", "skin", 0.63, 0.23, 2),
  seed("skin-nose-left", "skin", 0.51, 0.35, 2),
  seed("skin-nose-right", "skin", 0.59, 0.35, 2),
  seed("skin-lip-left", "skin", 0.51, 0.41, 2),
  seed("skin-lip-right", "skin", 0.61, 0.41, 2),
  seed("skin-jaw-left", "skin", 0.42, 0.47, 2),
  seed("skin-jaw-right", "skin", 0.67, 0.47, 2),
  seed("skin-ear-left", "skin", 0.38, 0.33, 0),
  seed("skin-ear-right", "skin", 0.73, 0.31, 0),
  seed("skin-mouth", "skin", 0.55, 0.43, 0),

  seed("beard-left", "hair", 0.45, 0.43, 0),
  seed("beard-center", "hair", 0.54, 0.48, 1),
  seed("beard-right", "hair", 0.64, 0.43, 0),
  seed("beard-chin-left", "hair", 0.49, 0.52, 2),
  seed("beard-chin-right", "hair", 0.59, 0.52, 2),
  seed("beard-mustache", "hair", 0.56, 0.4, 1),

  seed("hand-index-tip", "skin", 0.7, 0.38, 0),
  seed("hand-index", "skin", 0.68, 0.45, 1),
  seed("hand-palm", "skin", 0.62, 0.53, 0),
  seed("hand-knuckle", "skin", 0.58, 0.47, 1),
  seed("hand-lower", "skin", 0.59, 0.61, 0),
  seed("hand-thumb", "skin", 0.53, 0.54, 0),
  seed("hand-side", "skin", 0.64, 0.6, 2),
  seed("hand-wrist", "skin", 0.64, 0.67, 1),

  seed("watch-left", "metal", 0.62, 0.7, 0),
  seed("watch-link-one", "metal", 0.65, 0.71, 1),
  seed("watch-center", "metal", 0.68, 0.7, 0),
  seed("watch-link-two", "metal", 0.71, 0.71, 1),
  seed("watch-lower-left", "metal", 0.64, 0.75, 2),
  seed("watch-lower", "metal", 0.69, 0.75, 0),
  seed("watch-case", "metal", 0.73, 0.74, 2),

  seed("arm-upper", "skin", 0.65, 0.81, 0),
  seed("arm-upper-right", "skin", 0.72, 0.81, 1),
  seed("arm-center", "skin", 0.69, 0.9, 2),
  seed("arm-right", "skin", 0.79, 0.88, 0),
  seed("arm-outer", "skin", 0.86, 0.94, 1),
  seed("arm-lower", "skin", 0.72, 0.96, 2),

  seed("cloth-shoulder-left", "cloth", 0.16, 0.62, 0),
  seed("cloth-collar-left", "cloth", 0.29, 0.57, 1),
  seed("cloth-collar", "cloth", 0.4, 0.59, 0),
  seed("cloth-neckline", "cloth", 0.5, 0.62, 1),
  seed("cloth-fold-left", "cloth", 0.2, 0.73, 2),
  seed("cloth-chest-left", "cloth", 0.34, 0.72, 0),
  seed("cloth-chest-center", "cloth", 0.48, 0.74, 2),
  seed("cloth-chest-right", "cloth", 0.55, 0.7, 1),
  seed("cloth-lower-edge", "cloth", 0.12, 0.85, 1),
  seed("cloth-lower-left", "cloth", 0.26, 0.86, 2),
  seed("cloth-logo", "cloth", 0.41, 0.86, 0),
  seed("cloth-lower-center", "cloth", 0.55, 0.86, 1),
  seed("cloth-hem-left", "cloth", 0.18, 0.96, 0),
  seed("cloth-hem-center", "cloth", 0.34, 0.96, 2),
  seed("cloth-hem-right", "cloth", 0.5, 0.96, 1),
  seed("cloth-shoulder-right", "cloth", 0.78, 0.67, 0),
  seed("cloth-sleeve-upper", "cloth", 0.87, 0.75, 1),
  seed("cloth-sleeve-fold", "cloth", 0.82, 0.85, 2),
  seed("cloth-sleeve-outer", "cloth", 0.92, 0.91, 0),
  seed("cloth-sleeve-lower", "cloth", 0.86, 0.97, 1),
];

const selectedSeeds = (quality: QualityTier) => {
  const maxPriority = quality === "high" ? 2 : quality === "medium" ? 1 : 0;
  return PORTRAIT_SEEDS.filter(({ priority }) => priority <= maxPriority);
};

const clipToBisector = (polygon: Point[], source: Point, other: Point) => {
  if (!polygon.length) return polygon;

  const normalX = 2 * (other.x - source.x);
  const normalY = 2 * (other.y - source.y);
  const limit =
    other.x * other.x +
    other.y * other.y -
    source.x * source.x -
    source.y * source.y;
  const signedDistance = (point: Point) =>
    normalX * point.x + normalY * point.y - limit;

  const clipped: Point[] = [];
  for (let index = 0; index < polygon.length; index += 1) {
    const current = polygon[index];
    const previous = polygon[(index + polygon.length - 1) % polygon.length];
    const currentDistance = signedDistance(current);
    const previousDistance = signedDistance(previous);
    const currentInside = currentDistance <= 0.000001;
    const previousInside = previousDistance <= 0.000001;

    if (currentInside !== previousInside) {
      const denominator = previousDistance - currentDistance;
      const amount = Math.abs(denominator) < 0.000001
        ? 0
        : previousDistance / denominator;
      clipped.push({
        x: previous.x + (current.x - previous.x) * amount,
        y: previous.y + (current.y - previous.y) * amount,
      });
    }
    if (currentInside) clipped.push(current);
  }
  return clipped;
};

const pointInPolygon = (point: Point, polygon: Point[]) => {
  let inside = false;
  for (
    let current = 0, previous = polygon.length - 1;
    current < polygon.length;
    previous = current, current += 1
  ) {
    const a = polygon[current];
    const b = polygon[previous];
    const intersects =
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
};

const hasVisiblePixels = (
  seedPoint: Point,
  polygon: Point[],
  alpha: Uint8ClampedArray,
  width: number,
  height: number,
) => {
  const alphaAt = (point: Point) => {
    const x = Math.max(0, Math.min(width - 1, Math.round(point.x * (width - 1))));
    const y = Math.max(0, Math.min(height - 1, Math.round(point.y * (height - 1))));
    return alpha[(y * width + x) * 4 + 3];
  };
  if (alphaAt(seedPoint) > 12) return true;

  const xs = polygon.map(({ x }) => x);
  const ys = polygon.map(({ y }) => y);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  let visibleSamples = 0;

  for (let row = 0; row < 7; row += 1) {
    for (let column = 0; column < 7; column += 1) {
      const point = {
        x: left + ((column + 0.5) / 7) * (right - left),
        y: top + ((row + 0.5) / 7) * (bottom - top),
      };
      if (pointInPolygon(point, polygon) && alphaAt(point) > 12) {
        visibleSamples += 1;
        if (visibleSamples >= 2) return true;
      }
    }
  }
  return false;
};

const deterministicRandom = (index: number, salt: number) => {
  const value = Math.sin((index + 1) * (12.9898 + salt * 31.17)) * 43758.5453;
  return value - Math.floor(value);
};

export const createFragmentDefinitions = (
  quality: QualityTier,
  imageData: ImageData,
): FragmentDefinition[] => {
  let seeds = selectedSeeds(quality);
  const square: Point[] = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ];

  const createCells = (activeSeeds: Seed[]) =>
    activeSeeds.map((item, seedIndex) => {
      let polygon = square.map((point) => ({ ...point }));
      activeSeeds.forEach((other, otherIndex) => {
        if (seedIndex === otherIndex || !polygon.length) return;
        polygon = clipToBisector(polygon, item, other);
      });
      return { item, polygon };
    });

  // If an alpha-missed seed is removed after tessellation, its original cell
  // would otherwise remain unclaimed and show as a hole in the portrait.
  // Rebuild against only visible seeds until every surviving cell owns pixels.
  let cells = createCells(seeds);
  for (let pass = 0; pass < 3; pass += 1) {
    const visibleCells = cells.filter(
      ({ item, polygon }) =>
        polygon.length >= 3 &&
        hasVisiblePixels(
          item,
          polygon,
          imageData.data,
          imageData.width,
          imageData.height,
        ),
    );
    if (visibleCells.length === cells.length) break;
    seeds = visibleCells.map(({ item }) => item);
    cells = createCells(seeds);
  }

  return cells
    .map(({ item, polygon }, index) => ({
      id: item.id,
      index,
      material: item.material,
      materialId: MATERIAL_IDS[item.material],
      center: { x: item.x, y: item.y },
      polygon,
      randomA: deterministicRandom(index, 0.17),
      randomB: deterministicRandom(index, 0.73),
    }));
};
