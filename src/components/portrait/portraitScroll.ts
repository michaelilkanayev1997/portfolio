import { SCROLL_DRIFT_WINDOW } from "./portraitConfig";
import { clamp, smoothstep } from "./portraitMath";
import type { PortraitState, Runtime } from "./portraitRuntime";

type ScrollCallbacks = {
  updateVisualState: (state: PortraitState) => void;
  updateCanvasActive: (active: boolean) => void;
};

export const createPortraitScrollHandler = (
  runtime: Runtime,
  { updateVisualState, updateCanvasActive }: ScrollCallbacks,
) => () => {
  if (runtime.destroyed) return;
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
      const dx = piece.definition.center.x - 0.52;
      const dy = piece.definition.center.y - 0.49;
      const angle = Math.atan2(dy, dx) +
        (piece.definition.randomA - 0.5) * 0.28;
      const release = runtime.rectDocument.width *
        (0.035 + piece.definition.randomB * 0.045);
      piece.scatterX = Math.cos(angle) * release;
      piece.scatterY = Math.sin(angle) * release - release * 0.08;
      piece.scatterRotation =
        (piece.definition.randomA - 0.5) * 0.24;
      piece.scatterShear = 0;
      piece.vx += Math.cos(angle) * release * 1.25;
      piece.vy += Math.sin(angle) * release * 1.15 - 5;
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
