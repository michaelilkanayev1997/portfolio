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
import { createFragmentDefinitions } from "./portrait/fragmentMesh";
import {
  CONSTELLATION_LANDMARKS,
  MATERIAL_PROFILES,
  MAX_DELTA,
  TAU,
  TOP_EPSILON,
} from "./portrait/portraitConfig";
import {
  collectFlowSections,
  flowRoot,
  FLOW_SECTIONS,
  obstacleVisibilityAt,
} from "./portrait/portraitFlow";
import { explodePortrait } from "./portrait/portraitExplosion";
import { emitHoverGlint } from "./portrait/portraitHover";
import { clamp, lerp, smoothstep } from "./portrait/portraitMath";
import { isFacialFragment, makePiece } from "./portrait/portraitMotion";
import {
  PortraitRenderer,
  type PortraitRect,
} from "./portrait/portraitRenderer";
import {
  type DebugWindow,
  type PortraitState,
  type QualityLabel,
  type Runtime,
} from "./portrait/portraitRuntime";
import { createPortraitScrollHandler } from "./portrait/portraitScroll";
import {
  calculatePixelRatio,
  createAlphaMap,
  detectQualityTier,
  waitForImage,
} from "./portrait/portraitSetup";

interface PhysicsPortraitProps {
  src: string;
  alt: string;
}

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
          pointer: { x: 0, y: 0, active: false, seen: false },
          hoverTrace: { x: 0, y: 0, time: 0 },
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
          const assembledRect = currentRect();
          const shouldResumeHover =
            runtime.canHover &&
            runtime.pointer.seen &&
            runtime.pointer.x >= assembledRect.left &&
            runtime.pointer.x <= assembledRect.left + assembledRect.width &&
            runtime.pointer.y >= assembledRect.top &&
            runtime.pointer.y <= assembledRect.top + assembledRect.height;
          runtime.pointer.active = shouldResumeHover;
          runtime.hoverTrace = {
            x: runtime.pointer.x,
            y: runtime.pointer.y,
            time: performance.now(),
          };
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
          // Keep one rendering surface for the portrait's entire lifetime.
          // Swapping back to the DOM image creates a visible scale/alpha pop,
          // even when both sources use the same nominal bounds.
          runtime.renderer.draw(
            currentRect(),
            runtime.pieces,
            [],
            performance.now() / 1000,
          );
          runtime.renderFrames += 1;
          updateVisualState(shouldResumeHover ? "hover" : "assembled");
          updateCanvasActive(true);
          if (shouldResumeHover) runtime.scheduleFrame();
        };

        const startReturn = () => {
          if (!runtime || runtime.destroyed || runtime.returning) return;
          runtime.returning = true;
          runtime.autoReturnAt = 0;
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
            spark.alpha =
              spark.peakAlpha * clamp(spark.life / spark.maxLife);
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
          const pointerOverPortrait =
            runtime.canHover &&
            runtime.pointer.seen &&
            runtime.pointer.x >= portrait.left &&
            runtime.pointer.x <= portrait.left + portrait.width &&
            runtime.pointer.y >= portrait.top &&
            runtime.pointer.y <= portrait.top + portrait.height;
          const burstAge = Math.max(0, (time - runtime.burstStart) / 1000);
          const returnAge = Math.max(0, (time - runtime.returnStart) / 1000);
          const journeyDistance = Math.max(360, runtime.viewportHeight * 0.82);
          const journeyProgress = clamp(runtime.scrollY / journeyDistance);
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
          let maxError = 0;

          // Once the silhouette is back, let hover retarget the same springs
          // from their current transforms. No transform is reset here, so an
          // interrupted return remains continuous and cannot produce a jump.
          if (
            runtime.returning &&
            pointerOverPortrait &&
            returnAge > 0.72 &&
            (runtime.scrollY < TOP_EPSILON || runtime.activationSource === "click")
          ) {
            runtime.pointer.active = true;
            runtime.returning = false;
            runtime.exploded = false;
            runtime.journeyStarted = false;
            runtime.activationSource = "none";
            runtime.returnStartedAt = 0;
            updateVisualState("hover");
          }

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
              const homeRadius = Math.hypot(
                piece.definition.center.x - 0.52,
                piece.definition.center.y - 0.49,
              );
              const delay =
                profile.returnDelay +
                homeRadius * 0.045 +
                piece.definition.randomA * 0.025;
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
              targetEdge = clamp(
                1 - Math.max(0, returnAge - delay) / 0.9,
              ) * 0.26;
            } else if (runtime!.exploded && runtime!.journeyStarted) {
              const randomA = piece.definition.randomA;
              const randomB = piece.definition.randomB;
              const landmarkSlot = CONSTELLATION_LANDMARKS.get(
                piece.definition.id,
              );
              const isLandmark = landmarkSlot !== undefined;
              const sectionTempo = [0.5, 0.78, 0.56, 0.68, 0.44][flowIndex] ?? 0.5;
              const phase =
                runtime!.flowClock * sectionTempo +
                documentTravel * TAU * 1.35 +
                randomA * TAU;
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
              const sectionShine = isLandmark ? sectionEnvelope * 0.2 : 0;
              const twinkle = Math.pow(
                Math.max(0, Math.sin(phase * 2.15 + randomB * 9)),
                10,
              );
              const dustDepth =
                0.24 + randomB * 0.38 + twinkle * 0.34 + sectionShine;
              // The stellar sprite now carries the light. Polygon edges stay
              // restrained so deep sections read as a constellation, not confetti.
              const dustEdge =
                0.055 + randomB * 0.075 + (isLandmark ? 0.055 : 0);
              const dustAlpha = Math.min(
                0.94,
                piece.dustOpacity * 1.35 + 0.08 + twinkle * 0.14 + sectionShine * 0.2,
              ) * obstacleVisibility;
              const fadeProgress = smoothstep((journeyProgress - 0.06) / 0.94);
              const releaseOffset = randomA * 0.045;
              const pieceJourneyProgress = clamp(
                (journeyProgress - releaseOffset) / (1 - releaseOffset),
              );
              const pieceJourneyEase = Math.pow(
                smoothstep(pieceJourneyProgress),
                1.24,
              );
              const captureProgress = pieceJourneyEase;
              targetX = lerp(piece.scatterX, dustX - centerX, captureProgress);
              targetY = lerp(piece.scatterY, dustY - centerY, captureProgress);
              targetRotation = lerp(
                piece.scatterRotation,
                (randomA - 0.5) * 2.3 +
                  documentTravel * 1.65 +
                  Math.sin(phase) * 0.16,
                pieceJourneyEase,
              );
              const scaleProgress = smoothstep(
                (pieceJourneyProgress - 0.035) / 0.52,
              );
              targetScale = lerp(1, piece.dustScale, scaleProgress);
              targetZ = lerp(0, dustDepth, captureProgress);
              targetAlpha = lerp(1, dustAlpha, fadeProgress);
              targetEdge = lerp(0, dustEdge, captureProgress);
              targetShear = lerp(piece.scatterShear, 0, pieceJourneyEase);
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
              const normalizedDistance = distance / radius;
              const proximity = distance < radius
                ? smoothstep(1 - distance / radius)
                : 0;
              const pressure = proximity * proximity;
              const lensRim = Math.pow(
                Math.max(
                  0,
                  1 - Math.abs(normalizedDistance - 0.62) / 0.28,
                ),
                2,
              );
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
              targetRotation =
                directionX * pressure * profile.rotation * 0.18 +
                directionY * lensRim * 0.018 * faceFactor;
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
                  faceFactor +
                lensRim *
                  (piece.definition.material === "glass" ? 0.018 : 0.011) *
                  faceFactor;
              targetZ =
                lift +
                lensRim * profile.hoverDepth * faceFactor * 0.22;
              // Apply the glasses' colored edge strength to whichever local
              // fragments are inside the cursor field. Everything outside the
              // hover radius remains at its untouched assembled state.
              targetEdge = Math.max(
                lift * 0.68,
                lensRim * 0.32 * faceFactor,
              );
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
          );
          runtime.renderFrames += 1;

          const hoverReturning = !runtime.pointer.active && !runtime.exploded;
          const hoverSettled = hoverReturning && maxError < 0.12;
          // When there is no hover interruption, let the return finish on the
          // actual spring state instead of cutting it off at a fixed time.
          const returnSettled =
            runtime.returning && returnAge > 0.9 && maxError < 0.065;
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

        const onScroll = createPortraitScrollHandler(runtime, {
          updateVisualState,
          updateCanvasActive,
        });

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

        const onGlobalPointerMove = (event: PointerEvent) => {
          if (!runtime || runtime.destroyed || !runtime.canHover) return;
          if (event.pointerType === "touch") return;
          runtime.pointer.x = event.clientX;
          runtime.pointer.y = event.clientY;
          runtime.pointer.seen = true;
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
        window.addEventListener("pointermove", onGlobalPointerMove, { passive: true });
        document.addEventListener("visibilitychange", onVisibilityChange);
        canvas.addEventListener("webglcontextlost", onContextLost);

        runtimeRef.current = runtime;
        setQuality(label);
        runtime.ensureCanvasSize();
        runtime.renderer.draw(currentRect(), runtime.pieces, [], performance.now() / 1000);
        runtime.renderFrames += 1;
        updateCanvasActive(true);
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
          window.removeEventListener("pointermove", onGlobalPointerMove);
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
        !runtime.canHover ||
        event.pointerType === "touch"
      ) {
        return;
      }
      runtime.readRect();
      runtime.pointer = {
        x: event.clientX,
        y: event.clientY,
        active: true,
        seen: true,
      };
      runtime.hoverTrace = {
        x: event.clientX,
        y: event.clientY,
        time: performance.now(),
      };
      // Remember cursor presence during the explosion/return. Pointer-enter
      // will not fire again if the cursor never leaves the portrait, so the
      // completed assembly uses this state to resume hover immediately.
      if (runtime.exploded) return;
      runtime.ensureCanvasSize();
      updateCanvasActive(true);
      updateVisualState("hover");
      runtime.scheduleFrame();
    },
    [updateCanvasActive, updateVisualState],
  );

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    const runtime = runtimeRef.current;
    if (!runtime?.pointer.active) return;
    if (!runtime.exploded) {
      emitHoverGlint(runtime, event.clientX, event.clientY);
    }
    runtime.pointer.x = event.clientX;
    runtime.pointer.y = event.clientY;
    if (runtime.exploded) return;
    runtime.scheduleFrame();
  }, []);

  const onPointerLeave = useCallback(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    runtime.pointer.active = false;
    if (runtime.exploded) return;
    runtime.scheduleFrame();
  }, []);

  const toggleExplosion = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      const runtime = runtimeRef.current;
      if (!runtime || runtime.destroyed || quality === "static") return;
      if (runtime.exploded) return;
      explodePortrait(runtime, event.clientX, event.clientY);

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
      </button>

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
