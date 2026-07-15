import type {
  FragmentDefinition,
  MaterialName,
  QualityTier,
} from "./fragmentMesh";
import type { FlowSection, FlowSectionName } from "./portraitFlow";
import type { PieceMotion, Spark } from "./portraitMotion";
import type { PortraitRect, PortraitRenderer } from "./portraitRenderer";

export type PortraitState =
  | "assembled"
  | "hover"
  | "exploded"
  | "journey"
  | "dust"
  | "returning"
  | "static";

export type QualityLabel = "full" | "low" | "static";
export type ActivationSource = "none" | "click" | "scroll";

export type Runtime = {
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
  pointer: { x: number; y: number; active: boolean; seen: boolean };
  readRect: () => void;
  readFlowSections: () => void;
  ensureCanvasSize: () => void;
  scheduleFrame: () => void;
  startReturn: () => void;
};

export type DebugWindow = Window & {
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
