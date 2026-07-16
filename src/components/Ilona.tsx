import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import {
  clamp,
  prefersReducedMotion,
  spawnBadge,
  spawnConfetti,
  spawnHeart,
  spawnHitRings,
  spawnStagePraise,
  spawnStardust,
  type PixelPosition,
} from "./ilona/ilonaEffects";
import { STAGES } from "./ilona/ilonaStages";
import { IlonaOverlay } from "./ilona/IlonaOverlay";

const TRIGGER = "ilona";

type PointerPosition = PixelPosition & {
  xPercent: number;
  yPercent: number;
};

type ForbiddenRect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || target.isContentEditable;
};

const overlapsRect = (
  position: PixelPosition,
  width: number,
  height: number,
  rect: ForbiddenRect,
) =>
  position.x < rect.right &&
  position.x + width > rect.left &&
  position.y < rect.bottom &&
  position.y + height > rect.top;

const Ilona = () => {
  const [active, setActive] = useState(false);
  const [stage, setStage] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [wrongEscaped, setWrongEscaped] = useState(false);
  const [activeWrongAnswer, setActiveWrongAnswer] = useState("");
  const [secretRevealed, setSecretRevealed] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const wrongButtonRef = useRef<HTMLButtonElement>(null);
  const activeRef = useRef(false);
  const stageRef = useRef(0);
  const wrongEscapedRef = useRef(false);
  const keyBufferRef = useRef("");
  const wrongPositionRef = useRef<PixelPosition>({ x: 0, y: 0 });
  const lastMoveRef = useRef(0);
  const lastDustRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const timeoutRefs = useRef<number[]>([]);

  const completed = stage >= STAGES.length;
  const currentStage = STAGES[Math.min(stage, STAGES.length - 1)];

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    wrongEscapedRef.current = wrongEscaped;
  }, [wrongEscaped]);

  useEffect(() => {
    if (!active) return undefined;

    const scrollY = window.scrollY;
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlOverscroll = html.style.overscrollBehavior;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyLeft = body.style.left;
    const previousBodyRight = body.style.right;
    const previousBodyWidth = body.style.width;
    const previousBodyTouchAction = body.style.touchAction;

    body.classList.add("ilona-game-open");
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.touchAction = "none";

    return () => {
      body.classList.remove("ilona-game-open");
      html.style.overflow = previousHtmlOverflow;
      html.style.overscrollBehavior = previousHtmlOverscroll;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.left = previousBodyLeft;
      body.style.right = previousBodyRight;
      body.style.width = previousBodyWidth;
      body.style.touchAction = previousBodyTouchAction;
      window.scrollTo(0, scrollY);
    };
  }, [active]);

  const clearFloating = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    timeoutRefs.current.forEach((timeout) => window.clearTimeout(timeout));
    timeoutRefs.current = [];
    lastDustRef.current = 0;

    const field = fieldRef.current;
    if (field) {
      gsap.killTweensOf(Array.from(field.children));
      field.replaceChildren();
    }
  }, []);

  const getPointInOverlay = useCallback(
    (clientX: number, clientY: number): PointerPosition | null => {
      const overlay = overlayRef.current;
      if (!overlay) return null;

      const rect = overlay.getBoundingClientRect();
      const x = clamp(clientX - rect.left, 0, rect.width);
      const y = clamp(clientY - rect.top, 0, rect.height);

      return {
        x,
        y,
        xPercent: clamp((x / rect.width) * 100, 0, 100),
        yPercent: clamp((y / rect.height) * 100, 0, 100),
      };
    },
    [],
  );

  const getPointerInOverlay = useCallback(
    (event: ReactPointerEvent<HTMLElement>): PointerPosition | null =>
      getPointInOverlay(event.clientX, event.clientY),
    [getPointInOverlay],
  );

  const getElementCenterInOverlay = useCallback(
    (element: HTMLElement | null): PointerPosition | null => {
      const overlay = overlayRef.current;
      if (!overlay || !element) return null;

      const rect = element.getBoundingClientRect();
      return getPointInOverlay(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      );
    },
    [getPointInOverlay],
  );

  const emitRunawayDust = useCallback(
    (
      origin: PixelPosition | null,
      target: PixelPosition | null = null,
      force = false,
      intensity = 1,
    ) => {
      const field = fieldRef.current;
      if (!field || !origin || prefersReducedMotion()) return;

      const now = performance.now();
      if (!force && now - lastDustRef.current < 125) return;

      lastDustRef.current = now;
      spawnStardust(field, origin, target, intensity);
    },
    [],
  );

  const getOverlayMetrics = useCallback(() => {
    const overlay = overlayRef.current;
    const button = wrongButtonRef.current;
    if (!overlay || !button) return null;

    const overlayRect = overlay.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const forbiddenRects = Array.from(
      overlay.querySelectorAll<HTMLButtonElement>(
        "[data-ilona-correct='true']",
      ),
    ).map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left - overlayRect.left - 18,
        right: rect.right - overlayRect.left + 18,
        top: rect.top - overlayRect.top - 18,
        bottom: rect.bottom - overlayRect.top + 18,
      };
    });

    return {
      overlayRect,
      buttonRect,
      forbiddenRects,
      maxX: Math.max(0, overlayRect.width - buttonRect.width),
      maxY: Math.max(0, overlayRect.height - buttonRect.height),
    };
  }, []);

  const isSafePosition = useCallback(
    (
      position: PixelPosition,
      width: number,
      height: number,
      forbiddenRects: ForbiddenRect[],
    ) =>
      !forbiddenRects.some((rect) =>
        overlapsRect(position, width, height, rect),
      ),
    [],
  );

  const setWrongButtonPosition = useCallback(
    (position: PixelPosition, animated = true, dramatic = false) => {
      const button = wrongButtonRef.current;
      if (!button) return;

      wrongPositionRef.current = position;

      if (!animated || prefersReducedMotion()) {
        gsap.set(button, {
          x: position.x,
          y: position.y,
          opacity: 1,
          scale: 1,
          rotation: 0,
        });
        return;
      }

      gsap.to(button, {
        x: position.x,
        y: position.y,
        opacity: 1,
        scale: 1,
        rotation: dramatic ? Math.random() * 16 - 8 : Math.random() * 7 - 3.5,
        duration: dramatic ? 0.66 : 0.46,
        ease: dramatic ? "elastic.out(1, 0.55)" : "power3.out",
        overwrite: "auto",
      });
    },
    [],
  );

  const pickRandomSafePosition = useCallback(
    (pointer: PixelPosition | null = null) => {
      const metrics = getOverlayMetrics();
      if (!metrics) return wrongPositionRef.current;

      const { buttonRect, forbiddenRects, maxX, maxY } = metrics;
      const current = wrongPositionRef.current;
      const minTravel = Math.min(
        140,
        Math.max(60, Math.hypot(maxX, maxY) * 0.22),
      );
      let best = wrongPositionRef.current;
      let bestScore = -Infinity;

      for (let i = 0; i < 48; i++) {
        const candidate = {
          x: Math.random() * Math.max(1, maxX - 20) + 10,
          y: Math.random() * Math.max(1, maxY - 96) + 84,
        };

        if (
          !isSafePosition(
            candidate,
            buttonRect.width,
            buttonRect.height,
            forbiddenRects,
          )
        ) {
          continue;
        }

        const distanceFromPointer = pointer
          ? Math.hypot(candidate.x - pointer.x, candidate.y - pointer.y)
          : 0;
        const distanceFromCurrent = Math.hypot(
          candidate.x - current.x,
          candidate.y - current.y,
        );
        if (i < 40 && distanceFromCurrent < minTravel) continue;

        const score = distanceFromCurrent + distanceFromPointer * 1.4;

        if (score > bestScore) {
          best = candidate;
          bestScore = score;
        }
      }

      if (bestScore > -Infinity) return best;

      const lanes = [
        { x: maxX - 12, y: 92 },
        { x: 12, y: Math.max(92, maxY - 18) },
        { x: maxX - 12, y: Math.max(92, maxY - 18) },
        { x: 12, y: 92 },
      ];

      const safeLane =
        lanes
          .filter((position) =>
            isSafePosition(
              position,
              buttonRect.width,
              buttonRect.height,
              forbiddenRects,
            ),
          )
          .sort((a, b) => {
            const scoreA =
              Math.hypot(a.x - current.x, a.y - current.y) +
              (pointer ? Math.hypot(a.x - pointer.x, a.y - pointer.y) : 0);
            const scoreB =
              Math.hypot(b.x - current.x, b.y - current.y) +
              (pointer ? Math.hypot(b.x - pointer.x, b.y - pointer.y) : 0);

            return scoreB - scoreA;
          })[0] ?? lanes[0];

      return safeLane;
    },
    [getOverlayMetrics, isSafePosition],
  );

  const pickEscapePosition = useCallback(
    (pointer: PixelPosition | null, dramatic: boolean) => {
      const metrics = getOverlayMetrics();
      if (!metrics) return wrongPositionRef.current;

      const { overlayRect, buttonRect, forbiddenRects, maxX, maxY } = metrics;
      const current = {
        x: buttonRect.left - overlayRect.left,
        y: buttonRect.top - overlayRect.top,
      };
      const center = {
        x: current.x + buttonRect.width / 2,
        y: current.y + buttonRect.height / 2,
      };
      const origin =
        pointer ??
        ({
          x: center.x + (Math.random() - 0.5) * 160,
          y: center.y + (Math.random() - 0.5) * 160,
        } satisfies PixelPosition);
      const dx = center.x - origin.x;
      const dy = center.y - origin.y;
      const length = Math.hypot(dx, dy) || 1;
      const step = dramatic ? 330 : 265;
      const away = {
        x: current.x + (dx / length) * step,
        y: current.y + (dy / length) * step,
      };
      let best = wrongPositionRef.current;
      let bestScore = -Infinity;

      for (let i = 0; i < 24; i++) {
        const candidate = {
          x: clamp(
            away.x + (Math.random() - 0.5) * (dramatic ? 440 : 320),
            10,
            Math.max(10, maxX - 10),
          ),
          y: clamp(
            away.y + (Math.random() - 0.5) * (dramatic ? 330 : 250),
            84,
            Math.max(84, maxY - 12),
          ),
        };

        if (
          !isSafePosition(
            candidate,
            buttonRect.width,
            buttonRect.height,
            forbiddenRects,
          )
        ) {
          continue;
        }

        const candidateCenter = {
          x: candidate.x + buttonRect.width / 2,
          y: candidate.y + buttonRect.height / 2,
        };
        const pointerDistance = Math.hypot(
          candidateCenter.x - origin.x,
          candidateCenter.y - origin.y,
        );
        const travelDistance = Math.hypot(
          candidate.x - current.x,
          candidate.y - current.y,
        );
        const edgeBonus =
          Math.abs(candidate.x - maxX / 2) * 0.5 +
          Math.abs(candidate.y - maxY / 2) * 0.35;
        const score = pointerDistance * 1.5 + travelDistance * 0.55 + edgeBonus;

        if (score > bestScore) {
          best = candidate;
          bestScore = score;
        }
      }

      return bestScore > -Infinity ? best : pickRandomSafePosition(pointer);
    },
    [getOverlayMetrics, isSafePosition, pickRandomSafePosition],
  );

  const moveWrongAnswer = useCallback(
    (pointer: PixelPosition | null, dramatic = false, force = false) => {
      const now = performance.now();
      if (!force && now - lastMoveRef.current < 70) return;
      lastMoveRef.current = now;

      const button = wrongButtonRef.current;
      const origin = getElementCenterInOverlay(button);
      const next = pickEscapePosition(pointer, dramatic);
      if (button && origin) {
        const rect = button.getBoundingClientRect();
        emitRunawayDust(
          origin,
          { x: next.x + rect.width / 2, y: next.y + rect.height / 2 },
          dramatic || force,
          dramatic ? 1.25 : 0.9,
        );
      }
      setWrongButtonPosition(next, true, dramatic);
    },
    [
      emitRunawayDust,
      getElementCenterInOverlay,
      pickEscapePosition,
      setWrongButtonPosition,
    ],
  );

  const teleportWrongAnswer = useCallback(
    (pointer: PixelPosition | null = null) => {
      const button = wrongButtonRef.current;
      if (!button) return;

      gsap.killTweensOf(button);
      const origin = getElementCenterInOverlay(button);
      const next = pickRandomSafePosition(pointer);
      if (origin) {
        const rect = button.getBoundingClientRect();
        emitRunawayDust(
          origin,
          { x: next.x + rect.width / 2, y: next.y + rect.height / 2 },
          true,
          1.25,
        );
      }
      wrongPositionRef.current = next;

      if (prefersReducedMotion()) {
        gsap.set(button, {
          x: next.x,
          y: next.y,
          opacity: 1,
          pointerEvents: "auto",
          scale: 1,
        });
        return;
      }

      gsap
        .timeline({
          overwrite: true,
          onComplete: () => {
            gsap.set(button, { pointerEvents: "auto" });
          },
        })
        .set(button, { pointerEvents: "none" })
        .to(button, {
          opacity: 0,
          scale: 0.55,
          rotation: Math.random() > 0.5 ? 24 : -24,
          duration: 0.08,
          ease: "power2.in",
        })
        .set(button, {
          x: next.x,
          y: next.y,
          rotation: Math.random() * 14 - 7,
        })
        .to(button, {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.22,
          ease: "back.out(1.9)",
        });
    },
    [emitRunawayDust, getElementCenterInOverlay, pickRandomSafePosition],
  );

  const activateRunaway = useCallback(
    (
      sourceElement?: HTMLElement,
      pointer: PixelPosition | null = null,
      action: "escape" | "teleport" = "escape",
      answer = currentStage.wrongAnswers[0] ?? "",
    ) => {
      const overlay = overlayRef.current;

      if (!overlay || !sourceElement) {
        if (answer) setActiveWrongAnswer(answer);
        if (!wrongEscapedRef.current) {
          flushSync(() => {
            setActiveWrongAnswer(answer);
            setWrongEscaped(true);
          });
        }
        if (action === "teleport") teleportWrongAnswer(pointer);
        else moveWrongAnswer(pointer, false, true);
        return;
      }

      const overlayRect = overlay.getBoundingClientRect();
      const inlineRect = sourceElement.getBoundingClientRect();
      const start = {
        x: inlineRect.left - overlayRect.left,
        y: inlineRect.top - overlayRect.top,
      };

      flushSync(() => {
        setActiveWrongAnswer(answer);
        setWrongEscaped(true);
      });

      const button = wrongButtonRef.current;
      if (!button) return;

      wrongPositionRef.current = start;
      gsap.set(button, {
        x: start.x,
        y: start.y,
        opacity: 1,
        scale: 1,
        rotation: 0,
      });

      if (action === "teleport") {
        teleportWrongAnswer(pointer);
      } else {
        moveWrongAnswer(pointer, false, true);
      }
    },
    [currentStage.wrongAnswers, moveWrongAnswer, teleportWrongAnswer],
  );

  const close = useCallback(() => {
    clearFloating();

    const overlay = overlayRef.current;
    const card = cardRef.current;

    if (!overlay || !card || prefersReducedMotion()) {
      setActive(false);
      setStage(0);
      setWrongEscaped(false);
      setActiveWrongAnswer("");
      setSecretRevealed(false);
      return;
    }

    gsap
      .timeline({
        onComplete: () => {
          setActive(false);
          setStage(0);
          setWrongEscaped(false);
          setActiveWrongAnswer("");
          setSecretRevealed(false);
        },
      })
      .to(card, { y: 34, scale: 0.96, opacity: 0, duration: 0.28 })
      .to(overlay, { opacity: 0, duration: 0.25 }, "-=0.12");
  }, [clearFloating]);

  const playWrongJoke = useCallback(
    (event?: ReactPointerEvent<HTMLElement>, answer = activeWrongAnswer) => {
      const stageIndex = stageRef.current;
      const field = fieldRef.current;
      const pointer = event ? getPointerInOverlay(event) : null;
      const impact =
        pointer ??
        getElementCenterInOverlay(
          event?.currentTarget ?? wrongButtonRef.current,
        );
      const stageData = STAGES[Math.min(stageIndex, STAGES.length - 1)];

      if (field) {
        if (impact) {
          spawnHitRings(field, impact);
          spawnStardust(field, impact, null, 0.85);
        }

        const badge =
          stageData.wrongBadges[
            Math.floor(Math.random() * stageData.wrongBadges.length)
          ];
        spawnBadge(
          field,
          badge,
          pointer?.xPercent ?? 58,
          pointer?.yPercent ?? 54,
        );
      }

      setAttempts((current) => current + 1);
      if (event?.currentTarget === wrongButtonRef.current) {
        teleportWrongAnswer(pointer);
        return;
      }
      activateRunaway(event?.currentTarget, pointer, "teleport", answer);
    },
    [
      activateRunaway,
      activeWrongAnswer,
      getElementCenterInOverlay,
      getPointerInOverlay,
      teleportWrongAnswer,
    ],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && activeRef.current) {
        close();
        return;
      }

      if (isTypingTarget(document.activeElement)) {
        keyBufferRef.current = "";
        return;
      }

      if (event.key.length !== 1) return;

      keyBufferRef.current = (
        keyBufferRef.current + event.key.toLowerCase()
      ).slice(-TRIGGER.length);

      if (keyBufferRef.current === TRIGGER) {
        keyBufferRef.current = "";
        setActive(true);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (!active) return undefined;

    setStage(0);
    setAttempts(0);
    setWrongEscaped(false);
    setActiveWrongAnswer("");
    setSecretRevealed(false);
    clearFloating();

    const field = fieldRef.current;
    const overlay = overlayRef.current;
    const card = cardRef.current;

    if (!field || !overlay || !card) return undefined;

    if (!prefersReducedMotion()) {
      gsap.set(overlay, { opacity: 0 });
      gsap.set(card, { y: 54, scale: 0.96, opacity: 0 });

      gsap
        .timeline()
        .to(overlay, { opacity: 1, duration: 0.35, ease: "power2.out" })
        .to(
          card,
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.58,
            ease: "back.out(1.45)",
          },
          "-=0.16",
        );
    }

    for (let i = 0; i < 14; i++) {
      const timeout = window.setTimeout(
        () => spawnHeart(field, Math.random() * 100, 96, true),
        i * 95,
      );
      timeoutRefs.current.push(timeout);
    }

    intervalRef.current = window.setInterval(() => {
      if (fieldRef.current) spawnHeart(fieldRef.current);
    }, 850);

    return clearFloating;
  }, [active, clearFloating]);

  useEffect(() => {
    if (!active || completed) return undefined;

    setWrongEscaped(false);
    setActiveWrongAnswer("");
    const frame = window.requestAnimationFrame(() => {
      if (!prefersReducedMotion()) {
        gsap.fromTo(
          ".ilona-stage-panel",
          { y: 18, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.42,
            stagger: 0.05,
            ease: "power2.out",
          },
        );
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [active, completed, stage]);

  useEffect(() => {
    if (!active || !completed) return undefined;

    setWrongEscaped(false);
    setActiveWrongAnswer("");
    const field = fieldRef.current;
    if (!field) return undefined;

    if (!prefersReducedMotion()) {
      gsap.fromTo(
        ".ilona-success-pop",
        { y: 20, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.52,
          stagger: 0.08,
          ease: "back.out(1.5)",
        },
      );
    }

    for (let i = 0; i < 42; i++) {
      const timeout = window.setTimeout(() => {
        if (!fieldRef.current) return;
        spawnConfetti(fieldRef.current);
        spawnHeart(fieldRef.current, 50, 52, true);
      }, i * 30);
      timeoutRefs.current.push(timeout);
    }

    return undefined;
  }, [active, completed]);

  useEffect(() => {
    if (!active || !completed || !secretRevealed) return undefined;

    const field = fieldRef.current;
    if (field) {
      spawnBadge(field, "החלק האמיתי נפתח", 50, 42);
    }

    if (prefersReducedMotion()) return undefined;

    gsap.fromTo(
      ".ilona-secret-pop",
      { y: 22, opacity: 0, scale: 0.97 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.07,
        ease: "back.out(1.35)",
      },
    );

    const secretIconTween = gsap.fromTo(
      ".ilona-secret-icon",
      { y: 8, scale: 0.78, rotation: -10 },
      {
        y: 0,
        scale: 1,
        rotation: 0,
        duration: 0.62,
        ease: "back.out(1.8)",
      },
    );
    const flowerGiftTween = gsap
      .timeline()
      .fromTo(
        ".ilona-flower-gift",
        { x: -42, y: 18, opacity: 0, scale: 0.82, rotation: -9 },
        {
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.72,
          ease: "back.out(1.7)",
        },
      )
      .fromTo(
        ".ilona-flower-bloom",
        { scale: 0.65, rotation: -16, transformOrigin: "50% 90%" },
        {
          scale: 1,
          rotation: 0,
          duration: 0.58,
          ease: "back.out(2)",
        },
        "-=0.36",
      )
      .fromTo(
        ".ilona-flower-leaf",
        {
          scale: 0.75,
          rotation: (index: number) => (index === 0 ? 12 : -12),
          transformOrigin: "50% 100%",
        },
        {
          scale: 1,
          rotation: 0,
          duration: 0.46,
          stagger: 0.06,
          ease: "back.out(1.8)",
        },
        "-=0.42",
      );

    return () => {
      secretIconTween.kill();
      flowerGiftTween.kill();
    };
  }, [active, completed, secretRevealed]);

  const handleWrongKeyboardAttempt = useCallback(() => {
    setAttempts((current) => current + 1);
  }, []);

  const handleRevealSecret = useCallback(() => {
    const field = fieldRef.current;

    setSecretRevealed(true);

    if (!field) return;

    for (let i = 0; i < 28; i++) {
      const timeout = window.setTimeout(() => {
        if (!fieldRef.current) return;
        spawnConfetti(fieldRef.current);
        spawnHeart(fieldRef.current, 50 + Math.random() * 16 - 8, 48, true);
      }, i * 34);
      timeoutRefs.current.push(timeout);
    }
  }, []);

  const handleCorrectAnswer = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      const currentStage = stageRef.current;
      const field = fieldRef.current;
      const stageData = STAGES[Math.min(currentStage, STAGES.length - 1)];
      const pointer =
        event.clientX || event.clientY
          ? getPointInOverlay(event.clientX, event.clientY)
          : null;
      const impact = pointer ?? getElementCenterInOverlay(event.currentTarget);

      if (field) {
        if (impact) {
          spawnHitRings(field, impact);
          spawnStardust(field, impact, null, 0.85);
        }

        if (currentStage < STAGES.length - 1) {
          spawnStagePraise(field);
        }

        spawnBadge(field, stageData.successBadge, 50, 50);
        for (let i = 0; i < 12; i++) {
          const timeout = window.setTimeout(
            () => spawnHeart(field, 25 + i * 4.5, 63, true),
            i * 32,
          );
          timeoutRefs.current.push(timeout);
        }
      }

      if (currentStage < STAGES.length - 1) {
        setAttempts(0);
        setWrongEscaped(false);
        setActiveWrongAnswer("");
        setSecretRevealed(false);
        setStage(currentStage + 1);
        return;
      }

      setAttempts(0);
      setWrongEscaped(false);
      setActiveWrongAnswer("");
      setSecretRevealed(false);
      setStage(STAGES.length);
    },
    [getElementCenterInOverlay, getPointInOverlay],
  );

  if (!active) return null;

  return (
    <IlonaOverlay
      activateRunaway={activateRunaway}
      activeWrongAnswer={activeWrongAnswer}
      attempts={attempts}
      cardRef={cardRef}
      close={close}
      completed={completed}
      currentStage={currentStage}
      fieldRef={fieldRef}
      getPointerInOverlay={getPointerInOverlay}
      handleCorrectAnswer={handleCorrectAnswer}
      handleRevealSecret={handleRevealSecret}
      moveWrongAnswer={moveWrongAnswer}
      onWrongKeyboardAttempt={handleWrongKeyboardAttempt}
      overlayRef={overlayRef}
      playWrongJoke={playWrongJoke}
      secretRevealed={secretRevealed}
      stage={stage}
      wrongButtonRef={wrongButtonRef}
      wrongEscaped={wrongEscaped}
    />
  );
};

export default memo(Ilona);
