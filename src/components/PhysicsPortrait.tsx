import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";

import { prefersReducedMotion } from "../utils/motion";
import {
  createFragmentDefinitions,
  type FragmentDefinition,
  type MaterialName,
  type QualityTier,
} from "./portrait/fragmentMesh";
import {
  PortraitRenderer,
  type FragmentTransform,
  type PortraitRect,
  type SparkRender,
} from "./portrait/portraitRenderer";

const MAX_DELTA = 1 / 30;
const ALPHA_MAP_SIZE = 192;
const CLICK_RETURN_DELAY = 1_450;
const SCROLL_DRIFT_WINDOW = 1_050;
const HANDOFF_CLEAR_DELAY = 220;
const TOP_EPSILON = 18;
const TAU = Math.PI * 2;

// These are recognizable landmarks from the portrait, not arbitrary particles.
// They become the bright nodes of a miniature portrait-shaped star map.
const CONSTELLATION_LANDMARKS = new Map<string, number>([
  ["hair-crown-left", 0],
  ["hair-fringe", 1],
  ["hair-crown-right", 2],
  ["skin-ear-right", 3],
  ["glass-right-feature", 4],
  ["skin-nose", 5],
  ["glass-left-feature", 6],
  ["skin-ear-left", 7],
  ["beard-left", 8],
  ["skin-mouth", 9],
  ["beard-right", 10],
  ["hand-index-tip", 11],
  ["watch-center", 12],
  ["cloth-logo", 13],
  ["cloth-shoulder-left", 14],
  ["glass-bridge", 15],
]);
const CONSTELLATION_LEAD = "glass-left-feature";

type PortraitState =
  | "assembled"
  | "hover"
  | "exploded"
  | "journey"
  | "dust"
  | "returning"
  | "static";

type QualityLabel = "full" | "low" | "static";
type ActivationSource = "none" | "click" | "scroll";
type FlowSectionName =
  | "hero"
  | "about"
  | "certifications"
  | "portfolio"
  | "experience"
  | "contact";

type FlowObstacle = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  kind: "soft" | "hard";
};

type FlowSection = {
  name: Exclude<FlowSectionName, "hero">;
  top: number;
  bottom: number;
  obstacles: FlowObstacle[];
};

const FLOW_SECTIONS: Array<{
  name: FlowSection["name"];
  soft: string;
  hard: string;
}> = [
  {
    name: "about",
    soft: ".about-heading, .about-intro, .about-lead, .about-item",
    hard: "",
  },
  {
    name: "certifications",
    soft: ".cert-heading, .cert-caption",
    hard: ".cert-swiper",
  },
  {
    name: "portfolio",
    soft: ".portfolio-heading",
    hard: ".portfolio-card",
  },
  {
    name: "experience",
    soft: ".skills-heading, .skill-category-title",
    hard: ".skill-card",
  },
  {
    name: "contact",
    soft: ".contact-heading, .contact-sub",
    hard: "#contact form",
  },
];

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

const MATERIAL_PROFILES: Record<MaterialName, MaterialProfile> = {
  glass: {
    hoverDepth: 1.3,
    scatter: 0.3,
    impulse: 1.05,
    stiffness: 34,
    damping: 7.2,
    rotation: 0.26,
    shear: 0,
    returnDelay: 0.2,
    returnStiffness: 25,
    returnDamping: 8.4,
  },
  metal: {
    hoverDepth: 0.86,
    scatter: 0.2,
    impulse: 0.66,
    stiffness: 48,
    damping: 10.5,
    rotation: 0.12,
    shear: 0,
    returnDelay: 0.03,
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
    returnDelay: 0.1,
    returnStiffness: 16,
    returnDamping: 6.4,
  },
  skin: {
    hoverDepth: 0.86,
    scatter: 0.19,
    impulse: 0.56,
    stiffness: 25,
    damping: 8.6,
    rotation: 0.13,
    shear: 0,
    returnDelay: 0.14,
    returnStiffness: 19,
    returnDamping: 7.2,
  },
  hair: {
    hoverDepth: 0.94,
    scatter: 0.25,
    impulse: 0.78,
    stiffness: 29,
    damping: 8,
    rotation: 0.2,
    shear: 0,
    returnDelay: 0.06,
    returnStiffness: 22,
    returnDamping: 8,
  },
};

type PieceMotion = FragmentTransform & {
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

type Spark = SparkRender & {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
};

type Runtime = {
  renderer: PortraitRenderer;
  fragments: FragmentDefinition[];
  pieces: PieceMotion[];
  sparks: Spark[];
  tier: QualityTier;
  quality: QualityLabel;
  canHover: boolean;
  exploded: boolean;
  journeyStarted: boolean;
  returning: boolean;
  activationSource: ActivationSource;
  activationAt: number;
  autoReturnAt: number;
  returnStartedAt: number;
  assembledAt: number;
  destroyed: boolean;
  canvasSized: boolean;
  releaseTimer: number | null;
  frame: number | null;
  lastTime: number;
  burstStart: number;
  returnStart: number;
  flowClock: number;
  driftUntil: number;
  renderFrames: number;
  rectDocument: PortraitRect;
  viewportWidth: number;
  viewportHeight: number;
  documentHeight: number;
  pixelRatio: number;
  scrollY: number;
  previousScrollY: number;
  scrollDirection: -1 | 0 | 1;
  flowSections: FlowSection[];
  activeSection: FlowSectionName;
  sectionProgress: number;
  pointer: { x: number; y: number; active: boolean };
  readRect: () => void;
  readFlowSections: () => void;
  ensureCanvasSize: () => void;
  scheduleFrame: () => void;
  startReturn: () => void;
};

interface PhysicsPortraitProps {
  src: string;
  alt: string;
}

type DebugWindow = Window & {
  __portraitDebug?: {
    snapshot: () => {
      state: PortraitState;
      quality: QualityLabel;
      renderFrames: number;
      activationSource: ActivationSource;
      activationAt: number;
      returnStartedAt: number;
      assembledAt: number;
      journeyStarted: boolean;
      scrollY: number;
      activeSection: FlowSectionName;
      sectionProgress: number;
      pixelRatio: number;
      canvasActive: boolean;
      sparkCount: number;
      fragments: Array<{
        id: string;
        material: MaterialName;
        sourceUv: [number, number];
        vertices: Array<[number, number]>;
        x: number;
        y: number;
        z: number;
        rotation: number;
        opacity: number;
        size: number;
        edge: number;
        shear: number;
        screenX: number;
        screenY: number;
      }>;
    };
  };
};

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.max(minimum, Math.min(maximum, value));

const lerp = (start: number, end: number, amount: number) =>
  start + (end - start) * amount;

const smoothstep = (value: number) => {
  const normalized = clamp(value);
  return normalized * normalized * (3 - 2 * normalized);
};

const isFacialFragment = (definition: FragmentDefinition) =>
  definition.id.startsWith("skin-") || definition.id.startsWith("beard-");

const detectQualityTier = (): QualityTier => {
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

const calculatePixelRatio = (
  tier: QualityTier,
  width: number,
  height: number,
) => {
  const cap = tier === "high" ? 1.5 : tier === "medium" ? 1.25 : 1;
  const pixelBudget = tier === "high" ? 3_200_000 : tier === "medium" ? 2_000_000 : 1_100_000;
  const budgetRatio = Math.sqrt(pixelBudget / Math.max(1, width * height));
  return Math.max(1, Math.min(window.devicePixelRatio || 1, cap, budgetRatio));
};

const createAlphaMap = (image: HTMLImageElement) => {
  const canvas = document.createElement("canvas");
  canvas.width = ALPHA_MAP_SIZE;
  canvas.height = ALPHA_MAP_SIZE;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Unable to inspect portrait alpha");
  context.clearRect(0, 0, ALPHA_MAP_SIZE, ALPHA_MAP_SIZE);
  context.drawImage(image, 0, 0, ALPHA_MAP_SIZE, ALPHA_MAP_SIZE);
  return context.getImageData(0, 0, ALPHA_MAP_SIZE, ALPHA_MAP_SIZE);
};

const waitForImage = async (image: HTMLImageElement) => {
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

const flowRoot = (name: FlowSection["name"]) => {
  const anchor = document.getElementById(name);
  if (!anchor) return null;
  if (name === "certifications") return anchor.parentElement;
  if (name === "contact") return anchor.parentElement?.parentElement ?? anchor;
  return anchor;
};

const readObstacleRects = (
  root: HTMLElement,
  selector: string,
  kind: FlowObstacle["kind"],
) => {
  if (!selector) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).flatMap(
    (element) => {
      const rect = element.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return [];
      return [
        {
          left: rect.left + window.scrollX,
          top: rect.top + window.scrollY,
          right: rect.right + window.scrollX,
          bottom: rect.bottom + window.scrollY,
          kind,
        } satisfies FlowObstacle,
      ];
    },
  );
};

const collectFlowSections = (): FlowSection[] =>
  FLOW_SECTIONS.flatMap((definition) => {
    const root = flowRoot(definition.name);
    if (!root) return [];
    const rect = root.getBoundingClientRect();
    return [
      {
        name: definition.name,
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
        obstacles: [
          ...readObstacleRects(root, definition.soft, "soft"),
          ...readObstacleRects(root, definition.hard, "hard"),
        ],
      },
    ];
  });

const obstacleVisibilityAt = (
  obstacles: FlowObstacle[] | undefined,
  x: number,
  y: number,
  scrollY: number,
  tier: QualityTier,
) => {
  let visibility = y < 90 ? 0.08 : 1;
  if (window.innerWidth >= 1280 && x < 70 && y > 315 && y < 580) {
    visibility = Math.min(visibility, 0.08);
  }
  if (!obstacles) return visibility;

  for (const obstacle of obstacles) {
    const top = obstacle.top - scrollY;
    const bottom = obstacle.bottom - scrollY;
    const dx = Math.max(obstacle.left - x, 0, x - obstacle.right);
    const dy = Math.max(top - y, 0, y - bottom);
    const influence = obstacle.kind === "hard" ? 30 : 22;
    if (dx >= influence || dy >= influence) continue;
    const distance = Math.hypot(dx, dy);
    if (distance >= influence) continue;
    const minimum = obstacle.kind === "hard"
      ? tier === "low"
        ? 0.2
        : 0.08
      : tier === "low"
        ? 0.38
        : 0.28;
    visibility = Math.min(
      visibility,
      lerp(minimum, 1, smoothstep(distance / influence)),
    );
    if (visibility <= 0.08) break;
  }
  return visibility;
};

const makePiece = (
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

const PhysicsPortrait = ({ src, alt }: PhysicsPortraitProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const runtimeRef = useRef<Runtime | null>(null);
  const visualStateRef = useRef<PortraitState>("assembled");
  const activeRef = useRef(false);
  const [visualState, setVisualState] = useState<PortraitState>("assembled");
  const [quality, setQuality] = useState<QualityLabel>("static");
  const [canvasActive, setCanvasActive] = useState(false);
  const [motionReduced, setMotionReduced] = useState(prefersReducedMotion);

  const updateVisualState = useCallback((nextState: PortraitState) => {
    if (visualStateRef.current === nextState) return;
    visualStateRef.current = nextState;
    setVisualState(nextState);
  }, []);

  const updateCanvasActive = useCallback((isActive: boolean) => {
    if (activeRef.current === isActive) return;
    activeRef.current = isActive;
    setCanvasActive(isActive);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setMotionReduced(query.matches);
    query.addEventListener("change", updatePreference);
    return () => query.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas) return undefined;

    let cancelled = false;
    let runtime: Runtime | null = null;

    updateCanvasActive(false);
    if (motionReduced) {
      canvas.width = 1;
      canvas.height = 1;
      setQuality("static");
      updateVisualState("static");
      return undefined;
    }
    updateVisualState("assembled");

    const initialize = async () => {
      try {
        await waitForImage(image);
        if (cancelled) return;
        const tier = detectQualityTier();
        const fragments = createFragmentDefinitions(tier, createAlphaMap(image));
        const renderer = new PortraitRenderer(canvas, image, fragments);
        const pieces = fragments.map((fragment) => makePiece(fragment, tier));
        const rect = image.getBoundingClientRect();
        const label: QualityLabel = tier === "high" ? "full" : "low";

        runtime = {
          renderer,
          fragments,
          pieces,
          sparks: [],
          tier,
          quality: label,
          canHover: window.matchMedia("(hover: hover) and (pointer: fine)").matches,
          exploded: false,
          journeyStarted: false,
          returning: false,
          activationSource: "none",
          activationAt: 0,
          autoReturnAt: 0,
          returnStartedAt: 0,
          assembledAt: performance.now(),
          destroyed: false,
          canvasSized: false,
          releaseTimer: null,
          frame: null,
          lastTime: 0,
          burstStart: 0,
          returnStart: 0,
          flowClock: 0,
          driftUntil: 0,
          renderFrames: 0,
          rectDocument: {
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height,
          },
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          documentHeight: document.documentElement.scrollHeight,
          pixelRatio: 1,
          scrollY: window.scrollY,
          previousScrollY: window.scrollY,
          scrollDirection: 0,
          flowSections: [],
          activeSection: "hero",
          sectionProgress: 0,
          pointer: { x: 0, y: 0, active: false },
          readRect: () => undefined,
          readFlowSections: () => undefined,
          ensureCanvasSize: () => undefined,
          scheduleFrame: () => undefined,
          startReturn: () => undefined,
        };

        const currentRect = (): PortraitRect => ({
          left: runtime!.rectDocument.left - window.scrollX,
          top: runtime!.rectDocument.top - runtime!.scrollY,
          width: runtime!.rectDocument.width,
          height: runtime!.rectDocument.height,
        });

        const releaseCanvas = () => {
          if (!runtime || runtime.destroyed) return;
          runtime.renderer.clear();
          canvas.width = 1;
          canvas.height = 1;
          runtime.canvasSized = false;
        };

        const scheduleCanvasRelease = () => {
          if (!runtime || runtime.destroyed) return;
          if (runtime.releaseTimer !== null) {
            window.clearTimeout(runtime.releaseTimer);
          }
          runtime.releaseTimer = window.setTimeout(() => {
            if (!runtime || runtime.destroyed) return;
            runtime.releaseTimer = null;
            image.style.removeProperty("opacity");
            image.style.removeProperty("transition");
            if (activeRef.current) return;
            releaseCanvas();
          }, HANDOFF_CLEAR_DELAY);
        };

        runtime.readRect = () => {
          if (!runtime || runtime.destroyed) return;
          const nextRect = image.getBoundingClientRect();
          if (!nextRect.width || !nextRect.height) return;
          runtime.rectDocument = {
            left: nextRect.left + window.scrollX,
            top: nextRect.top + window.scrollY,
            width: nextRect.width,
            height: nextRect.height,
          };
        };

        runtime.readFlowSections = () => {
          if (!runtime || runtime.destroyed) return;
          runtime.flowSections = collectFlowSections();
          runtime.documentHeight = document.documentElement.scrollHeight;
        };
        runtime.readFlowSections();

        runtime.ensureCanvasSize = () => {
          if (!runtime || runtime.destroyed) return;
          const width = window.innerWidth;
          const height = window.innerHeight;
          const baseRatio = calculatePixelRatio(runtime.tier, width, height);
          const isSettledDust =
            runtime.journeyStarted &&
            !runtime.returning &&
            runtime.scrollY > Math.max(260, height * 0.46);
          const ratio = isSettledDust
            ? Math.min(baseRatio, 1)
            : baseRatio;
          if (
            runtime.canvasSized &&
            runtime.viewportWidth === width &&
            runtime.viewportHeight === height &&
            Math.abs(runtime.pixelRatio - ratio) < 0.01
          ) {
            return;
          }
          runtime.viewportWidth = width;
          runtime.viewportHeight = height;
          runtime.pixelRatio = ratio;
          runtime.renderer.resize(width, height, ratio);
          runtime.canvasSized = true;
        };

        const completeAssembly = () => {
          if (!runtime || runtime.destroyed) return;
          // Re-read the live DOM bounds immediately before the handoff. This
          // prevents a stale hero rect from assembling a subtly smaller image.
          runtime.readRect();
          runtime.exploded = false;
          runtime.journeyStarted = false;
          runtime.returning = false;
          runtime.activationSource = "none";
          runtime.autoReturnAt = 0;
          runtime.returnStartedAt = 0;
          runtime.assembledAt = performance.now();
          runtime.activeSection = "hero";
          runtime.sectionProgress = 0;
          runtime.pointer.active = false;
          runtime.sparks = [];
          runtime.pieces.forEach((piece) => {
            piece.x = 0;
            piece.y = 0;
            piece.rotation = 0;
            piece.scale = 1;
            piece.z = 0;
            piece.alpha = 1;
            piece.edge = 0;
            piece.shear = 0;
            piece.vx = 0;
            piece.vy = 0;
            piece.rotationVelocity = 0;
            piece.scaleVelocity = 0;
            piece.zVelocity = 0;
            piece.shearVelocity = 0;
          });
          // The canvas and source image now show the exact same geometry.
          // Reveal the source underneath, then remove the canvas atomically;
          // fading two identical portraits causes a visible doubled silhouette.
          image.style.setProperty("transition", "none");
          image.style.setProperty("opacity", "1");
          // Paint one pixel-exact assembled frame before React starts the
          // canvas-to-image crossfade. The populated canvas stays alive until
          // both opacity transitions have finished, preventing a blank frame.
          runtime.renderer.draw(
            currentRect(),
            runtime.pieces,
            [],
            performance.now() / 1000,
          );
          runtime.renderFrames += 1;
          updateVisualState("assembled");
          requestAnimationFrame(() => {
            if (!runtime || runtime.destroyed) return;
            updateCanvasActive(false);
            scheduleCanvasRelease();
          });
        };

        const startReturn = () => {
          if (!runtime || runtime.destroyed || runtime.returning) return;
          runtime.returning = true;
          runtime.autoReturnAt = 0;
          runtime.pointer.active = false;
          runtime.returnStart = performance.now();
          runtime.returnStartedAt = runtime.returnStart;
          runtime.pieces.forEach((piece) => {
            piece.returnHoldX = piece.x;
            piece.returnHoldY = piece.y;
            piece.returnHoldRotation = piece.rotation;
            piece.returnHoldScale = piece.scale;
            piece.returnHoldZ = piece.z;
            piece.returnHoldShear = piece.shear;
          });
          updateVisualState("returning");
          updateCanvasActive(true);
          runtime.ensureCanvasSize();
          runtime.scheduleFrame();
        };
        runtime.startReturn = startReturn;

        const updateSparks = (delta: number) => {
          if (!runtime) return;
          runtime.sparks.forEach((spark) => {
            spark.life -= delta;
            spark.vy += 90 * delta;
            spark.vx *= Math.exp(-2.8 * delta);
            spark.vy *= Math.exp(-2.1 * delta);
            spark.x += spark.vx * delta;
            spark.y += spark.vy * delta;
            spark.alpha = clamp(spark.life / spark.maxLife);
          });
          runtime.sparks = runtime.sparks.filter(({ life }) => life > 0);
        };

        const frame = (time: number) => {
          if (!runtime || runtime.destroyed) return;
          runtime.frame = null;
          if (document.hidden) return;
          runtime.ensureCanvasSize();

          const delta = runtime.lastTime
            ? Math.min(MAX_DELTA, (time - runtime.lastTime) / 1000)
            : 1 / 60;
          runtime.lastTime = time;
          runtime.scrollY = window.scrollY;
          if (
            runtime.autoReturnAt > 0 &&
            !runtime.journeyStarted &&
            !runtime.returning &&
            time >= runtime.autoReturnAt
          ) {
            runtime.startReturn();
          }
          if (
            runtime.journeyStarted &&
            !runtime.returning &&
            time <= runtime.driftUntil
          ) {
            runtime.flowClock += delta;
          }
          const portrait = currentRect();
          const burstAge = Math.max(0, (time - runtime.burstStart) / 1000);
          const returnAge = Math.max(0, (time - runtime.returnStart) / 1000);
          const journeyDistance = Math.max(360, runtime.viewportHeight * 0.82);
          const journeyProgress = clamp(runtime.scrollY / journeyDistance);
          const journeyEase = Math.pow(smoothstep(journeyProgress), 1.3);
          const documentTravel = clamp(
            runtime.scrollY /
              Math.max(1, runtime.documentHeight - runtime.viewportHeight),
          );
          const sectionSample = runtime.scrollY + runtime.viewportHeight * 0.5;
          let flowSection = runtime.flowSections[0];
          let flowIndex = 0;
          runtime.flowSections.forEach((section, index) => {
            if (sectionSample >= section.top) {
              flowSection = section;
              flowIndex = index;
            }
          });
          const beforeFirstSection = Boolean(
            flowSection && sectionSample < flowSection.top,
          );
          runtime.activeSection = beforeFirstSection
            ? "hero"
            : flowSection?.name ?? "hero";
          runtime.sectionProgress = flowSection
            ? clamp(
                (sectionSample - flowSection.top) /
                  Math.max(1, flowSection.bottom - flowSection.top),
              )
            : 0;
          const visibleFlowObstacles = flowSection?.obstacles.filter(
            (obstacle) =>
              obstacle.bottom - runtime!.scrollY > 62 &&
              obstacle.top - runtime!.scrollY < runtime!.viewportHeight + 36,
          );
          const compact = runtime.viewportWidth < 760;
          const verticalStart = 94;
          const verticalSpan = Math.max(
            1,
            runtime.viewportHeight - verticalStart - 12,
          );
          // Stars never converge into a shared constellation or edge lane.
          // Each fragment owns a stable seeded flight path across the viewport.
          const portraitMapBlend = 0;
          let maxError = 0;

          runtime.pieces.forEach((piece) => {
            const profile = MATERIAL_PROFILES[piece.definition.material];
            const faceFactor = isFacialFragment(piece.definition) ? 0.82 : 1;
            const centerX = portrait.left + piece.definition.center.x * portrait.width;
            const centerY = portrait.top + piece.definition.center.y * portrait.height;
            let targetX = 0;
            let targetY = 0;
            let targetRotation = 0;
            let targetScale = 1;
            let targetZ = 0;
            let targetAlpha = 1;
            let targetEdge = 0;
            let targetShear = 0;
            let stiffness = profile.stiffness;
            let damping = profile.damping;

            if (runtime!.returning) {
              const delay = profile.returnDelay + piece.definition.randomA * 0.045;
              if (returnAge < delay) {
                targetX = piece.returnHoldX;
                targetY = piece.returnHoldY;
                targetRotation = piece.returnHoldRotation;
                targetScale = piece.returnHoldScale;
                targetZ = piece.returnHoldZ;
                targetShear = piece.returnHoldShear;
              }
              stiffness = profile.returnStiffness;
              damping = profile.returnDamping;
              targetEdge = piece.definition.material === "glass"
                ? clamp(1 - Math.max(0, returnAge - delay) / 1.15) * 0.72
                : clamp(1 - returnAge / 1.05) * 0.3;
            } else if (runtime!.exploded && runtime!.journeyStarted) {
              const randomA = piece.definition.randomA;
              const randomB = piece.definition.randomB;
              const landmarkSlot = CONSTELLATION_LANDMARKS.get(
                piece.definition.id,
              );
              const isLandmark = landmarkSlot !== undefined;
              const isLead = piece.definition.id === CONSTELLATION_LEAD;
              const materialLead = piece.definition.material === "glass"
                ? 0.34
                : piece.definition.material === "metal"
                  ? 0.2
                  : piece.definition.material === "cloth"
                    ? -0.12
                    : 0;
              const sectionTempo = [0.5, 0.78, 0.56, 0.68, 0.44][flowIndex] ?? 0.5;
              const phase =
                runtime!.flowClock * sectionTempo +
                documentTravel * TAU * 1.35 +
                randomA * TAU +
                materialLead;
              const laneSeed = (randomA * 0.61803398875 + randomB * 0.38196601125) % 1;
              const laneInset = compact ? 18 : 34;
              const flightWidth = Math.max(1, runtime!.viewportWidth - laneInset * 2);
              const fallSpeed = 0.16 + randomB * 0.3 + randomA * 0.08;
              const fallDistance = runtime!.scrollY * fallSpeed;
              const startY = (randomB * 0.73 + randomA * 0.27) * verticalSpan;
              const wrappedY = ((startY + fallDistance) % verticalSpan + verticalSpan) % verticalSpan;
              const swayAmplitude = compact ? 14 + randomB * 20 : 22 + randomB * 52;
              const slowArc =
                Math.sin(documentTravel * TAU * (0.72 + randomA * 0.9) + randomB * TAU) *
                swayAmplitude;
              const microDrift = Math.sin(phase * 0.42) * (5 + randomA * 9);
              let dustX = laneInset + laneSeed * flightWidth + slowArc + microDrift;
              let dustY = verticalStart + wrappedY;

              dustX = clamp(dustX, 5, runtime!.viewportWidth - 5);
              dustY = clamp(dustY, 90, runtime!.viewportHeight - 8);
              const obstacleVisibility = obstacleVisibilityAt(
                visibleFlowObstacles,
                dustX,
                dustY,
                runtime!.scrollY,
                runtime!.tier,
              );
              const sectionEnvelope =
                0.35 +
                Math.pow(Math.sin(Math.PI * runtime!.sectionProgress), 4) *
                  0.65;
              const activeCluster =
                isLandmark &&
                (flowIndex === 0 ||
                  (flowIndex === 1 && piece.definition.material === "glass") ||
                  (flowIndex === 2 && piece.definition.material === "cloth") ||
                  (flowIndex === 3 &&
                    (piece.definition.id.includes("watch") ||
                      piece.definition.id.includes("hand"))) ||
                  (flowIndex === 4 && piece.definition.id.includes("hand")));
              const isSectionLead =
                (flowIndex === 0 && piece.definition.id === "glass-left-feature") ||
                (flowIndex === 1 && piece.definition.id === "glass-bridge") ||
                (flowIndex === 2 && piece.definition.id === "cloth-logo") ||
                (flowIndex === 3 && piece.definition.id === "watch-center") ||
                (flowIndex === 4 && piece.definition.id === "hand-index-tip");
              const sectionShine = activeCluster
                ? sectionEnvelope * (isSectionLead ? 1 : 0.48)
                : 0;
              const twinkle = Math.pow(
                Math.max(0, Math.sin(phase * 2.15 + randomB * 9)),
                10,
              );
              const mapShine = portraitMapBlend *
                (isLead ? 1.18 : isLandmark ? 0.78 : 0.34);
              const dustDepth = Math.max(
                0.24 + randomB * 0.38 + twinkle * 0.34 + sectionShine,
                mapShine,
              );
              // The stellar sprite now carries the light. Polygon edges stay
              // restrained so deep sections read as a constellation, not confetti.
              const dustEdge =
                0.055 + randomB * 0.075 + (isLandmark ? 0.055 : 0);
              const dustAlpha = Math.min(
                0.94,
                piece.dustOpacity * 1.35 + 0.08 + twinkle * 0.14 + sectionShine * 0.2,
              ) * obstacleVisibility;
              const fadeProgress = smoothstep((journeyProgress - 0.06) / 0.94);
              const captureProgress = portraitMapBlend > 0.001
                ? Math.max(
                    journeyEase,
                    smoothstep((journeyProgress - 0.06) / 0.44),
                  )
                : journeyEase;
              targetX = lerp(piece.scatterX, dustX - centerX, captureProgress);
              targetY = lerp(piece.scatterY, dustY - centerY, captureProgress);
              targetRotation = lerp(
                piece.scatterRotation,
                (randomA - 0.5) * 2.3 +
                  documentTravel * 1.65 +
                  Math.sin(phase) * 0.16,
                journeyEase,
              );
              const mapScale = 0.105 + randomA * 0.04;
              const destinationScale = lerp(
                piece.dustScale,
                mapScale,
                portraitMapBlend,
              );
              const scaleProgress = smoothstep((journeyProgress - 0.04) / 0.52);
              targetScale = lerp(1, destinationScale, scaleProgress);
              targetZ = lerp(0, dustDepth, captureProgress);
              targetAlpha = lerp(1, dustAlpha, fadeProgress);
              if (portraitMapBlend > 0.001) {
                const mapAlpha = isLead ? 0.92 : isLandmark ? 0.68 : 0.42;
                targetAlpha = Math.max(
                  targetAlpha,
                  mapAlpha * portraitMapBlend * obstacleVisibility,
                );
              }
              targetEdge = lerp(0, dustEdge, captureProgress);
              targetShear = lerp(piece.scatterShear, 0, journeyEase);
              stiffness = journeyProgress > 0.58 ? 36 : profile.stiffness;
              damping = journeyProgress > 0.58 ? 10.2 : profile.damping;
            } else if (runtime!.exploded) {
              targetX = piece.scatterX;
              targetY = piece.scatterY;
              targetRotation = piece.scatterRotation;
              targetScale = 0.96 + piece.definition.randomA * 0.08;
              targetZ = 0.16 + piece.definition.randomB * 0.18;
              targetEdge = clamp(0.6 - burstAge * 0.18, 0.24, 0.6);
              targetShear = piece.scatterShear;
            } else if (runtime!.pointer.active) {
              // Restore the earlier portrait's tactile pressure field: the
              // cursor parts nearby pieces instead of pulling them into a
              // cluster. Material depth/refraction remains layered on top.
              const fromCursorX = centerX - runtime!.pointer.x;
              const fromCursorY = centerY - runtime!.pointer.y;
              const distance = Math.max(1, Math.hypot(fromCursorX, fromCursorY));
              const radius = clamp(portrait.width * 0.3, 82, 128);
              const proximity = distance < radius
                ? smoothstep(1 - distance / radius)
                : 0;
              const pressure = proximity * proximity;
              const directionX = fromCursorX / distance;
              const directionY = fromCursorY / distance;
              const materialDistance = piece.definition.material === "glass"
                ? 10
                : piece.definition.material === "cloth"
                  ? 8.5
                  : piece.definition.material === "metal"
                    ? 6.5
                    : piece.definition.material === "skin"
                      ? 6.2
                      : 6.5;
              const lift =
                proximity *
                profile.hoverDepth *
                faceFactor *
                (0.92 + piece.definition.randomB * 0.16);
              const push = pressure * materialDistance * faceFactor;
              targetX = directionX * push;
              targetY = directionY * push - lift * 1.55;
              targetRotation = directionX * pressure * profile.rotation * 0.18;
              targetScale =
                1 +
                proximity *
                  (piece.definition.material === "glass"
                    ? 0.048
                    : piece.definition.material === "cloth"
                      ? 0.036
                      : piece.definition.material === "metal"
                        ? 0.03
                        : 0.024) *
                  faceFactor;
              targetZ = lift;
              targetEdge = lift *
                (piece.definition.material === "glass"
                  ? 0.68
                  : piece.definition.material === "metal"
                    ? 0.28
                    : piece.definition.material === "skin"
                      ? 0.07
                      : piece.definition.material === "cloth"
                        ? 0.11
                        : 0.08);
              targetShear = piece.definition.material === "cloth"
                ? directionX * pressure * 0.045
                : 0;
              stiffness = piece.definition.material === "cloth" ? 31 : 46;
              damping = piece.definition.material === "cloth" ? 7.4 : 9.6;
            }

            const decay = Math.exp(-damping * delta);
            piece.vx = (piece.vx + (targetX - piece.x) * stiffness * delta) * decay;
            piece.vy = (piece.vy + (targetY - piece.y) * stiffness * delta) * decay;
            piece.rotationVelocity =
              (piece.rotationVelocity +
                (targetRotation - piece.rotation) * stiffness * 0.82 * delta) *
              decay;
            piece.scaleVelocity =
              (piece.scaleVelocity + (targetScale - piece.scale) * stiffness * delta) *
              decay;
            piece.zVelocity =
              (piece.zVelocity + (targetZ - piece.z) * stiffness * delta) * decay;
            piece.shearVelocity =
              (piece.shearVelocity + (targetShear - piece.shear) * stiffness * delta) *
              decay;

            piece.x += piece.vx * delta;
            piece.y += piece.vy * delta;
            piece.rotation += piece.rotationVelocity * delta;
            piece.scale += piece.scaleVelocity * delta;
            piece.z += piece.zVelocity * delta;
            piece.shear += piece.shearVelocity * delta;
            const fadeResponse = 1 - Math.exp(-10 * delta);
            piece.alpha += (targetAlpha - piece.alpha) * fadeResponse;
            piece.edge += (targetEdge - piece.edge) * fadeResponse;

            maxError = Math.max(
              maxError,
              Math.abs(targetX - piece.x),
              Math.abs(targetY - piece.y),
              Math.abs(targetRotation - piece.rotation) * 30,
              Math.abs(targetScale - piece.scale) * 20,
              Math.abs(targetZ - piece.z) * 18,
              Math.abs(targetAlpha - piece.alpha) * 20,
              Math.abs(targetEdge - piece.edge) * 12,
              Math.abs(targetShear - piece.shear) * 24,
              Math.abs(piece.vx) * 0.05,
              Math.abs(piece.vy) * 0.05,
            );
          });

          updateSparks(delta);
          runtime.renderer.draw(
            portrait,
            runtime.pieces,
            runtime.sparks,
            time / 1000,
            portraitMapBlend,
          );
          runtime.renderFrames += 1;

          const hoverReturning = !runtime.pointer.active && !runtime.exploded;
          const hoverSettled = hoverReturning && maxError < 0.12;
          // Do not hand off while the spring is merely "close". Scale error is
          // particularly visible because it makes the canvas portrait smaller
          // than the DOM image underneath.
          const returnSettled =
            runtime.returning && returnAge > 1.05 && maxError < 0.065;
          const burstAnimating =
            runtime.exploded &&
            !runtime.journeyStarted &&
            !runtime.returning &&
            (runtime.autoReturnAt > time || burstAge < 1.65);
          const ambientDrifting =
            runtime.journeyStarted &&
            !runtime.returning &&
            time < runtime.driftUntil;
          const shouldContinue =
            runtime.pointer.active ||
            runtime.sparks.length > 0 ||
            burstAnimating ||
            ambientDrifting ||
            maxError > 0.18 ||
            (hoverReturning && !hoverSettled) ||
            (runtime.returning && !returnSettled);

          if (hoverSettled) {
            completeAssembly();
            runtime.lastTime = 0;
            return;
          }

          const canCompleteClickReturnAwayFromTop =
            !runtime.journeyStarted && runtime.activationSource === "click";
          if (
            returnSettled &&
            (runtime.scrollY < TOP_EPSILON || canCompleteClickReturnAwayFromTop)
          ) {
            completeAssembly();
            runtime.lastTime = 0;
            return;
          }

          if (shouldContinue) runtime.scheduleFrame();
          else runtime.lastTime = 0;
        };

        runtime.scheduleFrame = () => {
          if (!runtime || runtime.destroyed || runtime.frame !== null || document.hidden) {
            return;
          }
          runtime.frame = requestAnimationFrame(frame);
        };

        const onScroll = () => {
          if (!runtime || runtime.destroyed) return;
          const nextScroll = window.scrollY;
          const previousScroll = runtime.previousScrollY;
          const difference = nextScroll - previousScroll;
          const journeyDistance = Math.max(360, runtime.viewportHeight * 0.82);
          const previousJourneyEase = Math.pow(
            smoothstep(clamp(previousScroll / journeyDistance)),
            1.3,
          );
          const currentJourneyEase = Math.pow(
            smoothstep(clamp(nextScroll / journeyDistance)),
            1.3,
          );
          const isRestoredPosition =
            runtime.renderFrames === 0 &&
            Math.abs(difference) <= 0.01 &&
            nextScroll > 0;
          const beginsJourney =
            !runtime.exploded &&
            nextScroll > 0 &&
            (difference > 0 || isRestoredPosition);
          const joinsJourney =
            runtime.exploded &&
            !runtime.journeyStarted &&
            nextScroll > 0 &&
            difference > 0;
          const resumesJourney =
            runtime.returning && nextScroll > 0 && difference > 0;
          const establishedJourney =
            runtime.journeyStarted && !runtime.returning;
          const rebaseDelta = isRestoredPosition ? nextScroll : difference;
          if (
            (establishedJourney || beginsJourney || joinsJourney || resumesJourney) &&
            Math.abs(rebaseDelta) > 0.01
          ) {
            const rebaseEase = establishedJourney
              ? previousJourneyEase
              : currentJourneyEase;
            runtime.pieces.forEach((piece) => {
              piece.y += rebaseDelta * rebaseEase;
            });
          }
          runtime.scrollDirection = difference > 0.5 ? 1 : difference < -0.5 ? -1 : 0;
          runtime.previousScrollY = nextScroll;
          runtime.scrollY = nextScroll;
          const now = performance.now();

          if (beginsJourney) {
            runtime.exploded = true;
            runtime.journeyStarted = true;
            runtime.returning = false;
            runtime.activationSource = "scroll";
            runtime.activationAt = now;
            runtime.autoReturnAt = 0;
            runtime.burstStart = now;
            runtime.pointer.active = false;
            runtime.flowClock = 0;
            runtime.pieces.forEach((piece) => {
              piece.scatterX = 0;
              piece.scatterY = 0;
              piece.scatterRotation = 0;
              piece.scatterShear = 0;
            });
          } else if (joinsJourney || resumesJourney) {
            runtime.journeyStarted = true;
            runtime.returning = false;
            runtime.autoReturnAt = 0;
            runtime.returnStartedAt = 0;
          }

          if (!runtime.exploded) return;
          runtime.driftUntil =
            now + (runtime.tier === "high" ? SCROLL_DRIFT_WINDOW : 650);

          const journeyProgress = clamp(
            nextScroll / journeyDistance,
          );
          if (runtime.journeyStarted && !runtime.returning) {
            updateVisualState(journeyProgress > 0.52 ? "dust" : "journey");
            updateCanvasActive(true);
          }
          if (
            runtime.journeyStarted &&
            runtime.scrollDirection < 0 &&
            nextScroll < runtime.viewportHeight * 0.3 &&
            !runtime.returning
          ) {
            runtime.startReturn();
          }
          runtime.ensureCanvasSize();
          runtime.scheduleFrame();
        };

        const onResize = () => {
          if (!runtime || runtime.destroyed) return;
          runtime.viewportWidth = window.innerWidth;
          runtime.viewportHeight = window.innerHeight;
          runtime.readRect();
          runtime.readFlowSections();
          runtime.canvasSized = false;
          if (activeRef.current) {
            runtime.ensureCanvasSize();
            runtime.scheduleFrame();
          }
        };

        const onVisibilityChange = () => {
          if (!runtime) return;
          if (document.hidden && runtime.frame !== null) {
            cancelAnimationFrame(runtime.frame);
            runtime.frame = null;
            runtime.lastTime = 0;
          } else if (!document.hidden && activeRef.current) {
            runtime.scheduleFrame();
          }
        };

        const onContextLost = (event: Event) => {
          event.preventDefault();
          if (!runtime) return;
          runtime.destroyed = true;
          updateCanvasActive(false);
          setQuality("static");
          updateVisualState("static");
        };

        const resizeObserver = new ResizeObserver(() => {
          runtime?.readRect();
          runtime?.readFlowSections();
          if (activeRef.current) runtime?.scheduleFrame();
        });
        resizeObserver.observe(image);
        FLOW_SECTIONS.forEach(({ name }) => {
          const root = flowRoot(name);
          if (root) resizeObserver.observe(root);
        });
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize, { passive: true });
        document.addEventListener("visibilitychange", onVisibilityChange);
        canvas.addEventListener("webglcontextlost", onContextLost);

        runtimeRef.current = runtime;
        setQuality(label);
        updateVisualState("assembled");
        if (window.scrollY > 0) onScroll();

        const debugWindow = window as DebugWindow;
        const debugApi = {
          snapshot: () => {
            const debugRect = currentRect();
            return {
              state: visualStateRef.current,
              quality: runtime?.quality ?? "static",
              renderFrames: runtime?.renderFrames ?? 0,
              activationSource: runtime?.activationSource ?? "none",
              activationAt: runtime?.activationAt ?? 0,
              returnStartedAt: runtime?.returnStartedAt ?? 0,
              assembledAt: runtime?.assembledAt ?? 0,
              journeyStarted: runtime?.journeyStarted ?? false,
              scrollY: runtime?.scrollY ?? window.scrollY,
              activeSection: runtime?.activeSection ?? "hero",
              sectionProgress: runtime?.sectionProgress ?? 0,
              pixelRatio: runtime?.pixelRatio ?? 1,
              canvasActive: activeRef.current,
              sparkCount: runtime?.sparks.length ?? 0,
              fragments: (runtime?.pieces ?? []).map((piece) => ({
                id: piece.definition.id,
                material: piece.definition.material,
                sourceUv: [
                  piece.definition.center.x,
                  piece.definition.center.y,
                ] as [number, number],
                vertices: piece.definition.polygon.map(
                  ({ x, y }) => [x, y] as [number, number],
                ),
                x: piece.x,
                y: piece.y,
                z: piece.z,
                rotation: piece.rotation,
                opacity: piece.alpha,
                size: piece.scale,
                edge: piece.edge,
                shear: piece.shear,
                screenX:
                  debugRect.left +
                  piece.definition.center.x * debugRect.width +
                  piece.x,
                screenY:
                  debugRect.top +
                  piece.definition.center.y * debugRect.height +
                  piece.y,
              })),
            };
          },
        };
        if (import.meta.env.DEV) debugWindow.__portraitDebug = debugApi;

        return () => {
          resizeObserver.disconnect();
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("resize", onResize);
          document.removeEventListener("visibilitychange", onVisibilityChange);
          canvas.removeEventListener("webglcontextlost", onContextLost);
          if (debugWindow.__portraitDebug === debugApi) {
            delete debugWindow.__portraitDebug;
          }
        };
      } catch (error) {
        if (cancelled) return;
        if (import.meta.env.DEV) console.warn("Portrait interaction fallback", error);
        setQuality("static");
        updateVisualState("static");
      }
    };

    let cleanupListeners: (() => void) | undefined;
    void initialize().then((cleanup) => {
      cleanupListeners = cleanup;
      if (cancelled) cleanupListeners?.();
    });

    return () => {
      cancelled = true;
      cleanupListeners?.();
      if (runtime && runtime.frame !== null) cancelAnimationFrame(runtime.frame);
      if (runtime) {
        if (runtime.releaseTimer !== null) {
          window.clearTimeout(runtime.releaseTimer);
        }
        runtime.destroyed = true;
        runtime.renderer.destroy();
      }
      image.style.removeProperty("opacity");
      image.style.removeProperty("transition");
      if (runtimeRef.current === runtime) runtimeRef.current = null;
    };
  }, [motionReduced, src, updateCanvasActive, updateVisualState]);

  const onPointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const runtime = runtimeRef.current;
      if (
        !runtime ||
        runtime.destroyed ||
        runtime.exploded ||
        !runtime.canHover ||
        event.pointerType === "touch"
      ) {
        return;
      }
      runtime.readRect();
      runtime.pointer = { x: event.clientX, y: event.clientY, active: true };
      runtime.ensureCanvasSize();
      updateCanvasActive(true);
      updateVisualState("hover");
      runtime.scheduleFrame();
    },
    [updateCanvasActive, updateVisualState],
  );

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    const runtime = runtimeRef.current;
    if (!runtime?.pointer.active || runtime.exploded) return;
    runtime.pointer.x = event.clientX;
    runtime.pointer.y = event.clientY;
    runtime.scheduleFrame();
  }, []);

  const onPointerLeave = useCallback(() => {
    const runtime = runtimeRef.current;
    if (!runtime || runtime.exploded) return;
    runtime.pointer.active = false;
    runtime.scheduleFrame();
  }, []);

  const toggleExplosion = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      const runtime = runtimeRef.current;
      if (!runtime || runtime.destroyed || quality === "static") return;
      if (runtime.exploded) return;

      runtime.readRect();
      runtime.ensureCanvasSize();
      const portrait: PortraitRect = {
        left: runtime.rectDocument.left - window.scrollX,
        top: runtime.rectDocument.top - window.scrollY,
        width: runtime.rectDocument.width,
        height: runtime.rectDocument.height,
      };
      const clickX = event.clientX || portrait.left + portrait.width / 2;
      const clickY = event.clientY || portrait.top + portrait.height / 2;

      const activationTime = performance.now();
      runtime.exploded = true;
      runtime.journeyStarted = false;
      runtime.returning = false;
      runtime.activationSource = "click";
      runtime.activationAt = activationTime;
      runtime.autoReturnAt = activationTime + CLICK_RETURN_DELAY;
      runtime.returnStartedAt = 0;
      runtime.pointer.active = false;
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
        const angle = baseAngle + (piece.definition.randomA - 0.5) * 0.72;
        const directionX = Math.cos(angle);
        const directionY = Math.sin(angle);
        const horizontalSpread = directionX < 0 ? 0.62 : 1;
        const radius =
          portrait.width *
          profile.scatter *
          faceFactor *
          (0.72 + piece.definition.randomB * 0.58);
        piece.scatterX = directionX * radius * horizontalSpread;
        piece.scatterY = directionY * radius - portrait.width * 0.025;
        piece.scatterRotation =
          (piece.definition.randomA - 0.5) * 2 * profile.rotation * faceFactor;
        piece.scatterShear = piece.definition.material === "cloth"
          ? (piece.definition.randomB - 0.5) * 2 * profile.shear
          : 0;
        const velocity =
          portrait.width * profile.impulse * faceFactor * (1.45 + piece.definition.randomB);
        piece.vx += directionX * velocity * horizontalSpread;
        piece.vy += directionY * velocity - portrait.width * 0.18;
        piece.rotationVelocity +=
          (piece.definition.randomA - 0.5) * profile.rotation * 8;
        piece.edge = piece.definition.material === "glass" ? 1 : 0.52;
      });

      const watchX = portrait.left + portrait.width * 0.68;
      const watchY = portrait.top + portrait.height * 0.72;
      const sparkCount = runtime.tier === "high" ? 4 : runtime.tier === "medium" ? 3 : 2;
      runtime.sparks = Array.from({ length: sparkCount }, (_, index) => {
        const angle = -1.2 + index * 0.48 + runtime.pieces[index].definition.randomA * 0.18;
        const speed = 88 + index * 20;
        const life = 0.34 + index * 0.028;
        return {
          x: watchX,
          y: watchY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3.25 + index * 0.44,
          alpha: 1,
          warmth: index % 2,
          life,
          maxLife: life,
        };
      });

      updateCanvasActive(true);
      updateVisualState("exploded");
      runtime.scheduleFrame();
    },
    [quality, updateCanvasActive, updateVisualState],
  );

  const isStatic = quality === "static";
  const isReturning = visualState === "returning";
  const hasReleased =
    visualState === "exploded" ||
    visualState === "journey" ||
    visualState === "dust" ||
    isReturning;
  const portraitLabel = isStatic
    ? "Michael's portrait with motion reduced"
    : isReturning
      ? "Michael's portrait is reassembling"
      : visualState === "exploded"
        ? "Michael's portrait will reassemble automatically"
        : visualState === "journey" || visualState === "dust"
          ? "Michael's portrait fragments are following the page"
          : "Explode Michael's portrait";
  const instruction = isStatic
    ? "Portrait motion is reduced"
    : visualState === "exploded"
      ? "Released fragments return automatically"
      : visualState === "journey" || visualState === "dust"
        ? "Scroll carries fragments through the work"
      : visualState === "returning"
        ? "Material memory is reassembling"
        : "Move bends depth / click releases";

  return (
    <div
      className="physics-portrait"
      data-portrait-state={visualState}
      data-quality={quality}
    >
      <button
        type="button"
        disabled={isStatic}
        onClick={toggleExplosion}
        onPointerEnter={onPointerEnter}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="physics-portrait__trigger relative block w-full touch-manipulation bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
        aria-label={portraitLabel}
        aria-pressed={hasReleased}
        data-portrait-state={visualState}
        data-quality={quality}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          width={1506}
          height={1506}
          className={`physics-portrait__image block h-auto w-full ${
            canvasActive ? "physics-portrait__image--fragmented" : ""
          }`}
          fetchPriority="high"
          draggable={false}
        />
        <span className="physics-portrait__focus" aria-hidden />
      </button>

      <div className="physics-portrait__caption" aria-hidden>
        <span className="physics-portrait__caption-line" />
        <span className="physics-portrait__caption-copy">{instruction}</span>
        <span className="physics-portrait__caption-index">
          {quality === "full" ? "MM / 01" : quality === "low" ? "MM / L" : "MM / S"}
        </span>
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <canvas
            ref={canvasRef}
            className={`portrait-fragment-canvas ${
              canvasActive ? "portrait-fragment-canvas--active" : ""
            }`}
            data-portrait-state={visualState}
            data-quality={quality}
            aria-hidden
          />,
          document.body,
        )}
    </div>
  );
};

export default memo(PhysicsPortrait);
