import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { prefersReducedMotion } from "../utils/motion";

const COLS = 13;
const ROWS = 15;
const HOLD = 1.25;
const DRAG = 1.75;
const ROTATION_DRAG = 1.1;
const RETURN_DURATION = 6.5;
const MAX_DT = 1 / 30;

type Piece = {
  col: number;
  row: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationVelocity: number;
  delay: number;
  returnStarted: boolean;
  returnX: number;
  returnY: number;
  returnRotation: number;
};

interface PhysicsPortraitProps {
  src: string;
  alt: string;
}

const PhysicsPortrait = ({ src, alt }: PhysicsPortraitProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const piecesRef = useRef<Piece[]>([]);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const elapsedRef = useRef(0);
  const activeRef = useRef(false);
  const blastRef = useRef(false);
  const hoveringRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const sizeRef = useRef({ width: 1, height: 1, dpr: 1 });
  const [active, setActive] = useState(false);

  const resetPieces = useCallback(() => {
    piecesRef.current = Array.from({ length: COLS * ROWS }, (_, index) => ({
      col: index % COLS,
      row: Math.floor(index / COLS),
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      rotation: 0,
      rotationVelocity: 0,
      delay: 0,
      returnStarted: false,
      returnX: 0,
      returnY: 0,
      returnRotation: 0,
    }));
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !image.complete) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const { width, height, dpr } = sizeRef.current;
    const imageRect = image.getBoundingClientRect();
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    const sourceWidth = image.naturalWidth / COLS;
    const sourceHeight = image.naturalHeight / ROWS;
    const tileWidth = imageRect.width / COLS;
    const tileHeight = imageRect.height / ROWS;

    piecesRef.current.forEach((piece) => {
      const homeX = imageRect.left + piece.col * tileWidth;
      const homeY = imageRect.top + piece.row * tileHeight;
      const centerX = homeX + tileWidth / 2 + piece.x;
      const centerY = homeY + tileHeight / 2 + piece.y;
      context.save();
      context.translate(centerX, centerY);
      context.rotate(piece.rotation);
      context.drawImage(
        image,
        piece.col * sourceWidth,
        piece.row * sourceHeight,
        sourceWidth + 0.7,
        sourceHeight + 0.7,
        -tileWidth / 2 - 0.35,
        -tileHeight / 2 - 0.35,
        tileWidth + 0.7,
        tileHeight + 0.7,
      );
      context.restore();
    });
  }, []);

  const tick = useCallback(
    (time: number) => {
      const rawDelta = lastTimeRef.current
        ? (time - lastTimeRef.current) / 1000
        : 0;
      const delta = Math.min(rawDelta, MAX_DT);
      lastTimeRef.current = time;
      elapsedRef.current += delta;
      const returning = blastRef.current && elapsedRef.current >= HOLD;
      let moving = false;
      let returnSettled = returning;

      piecesRef.current.forEach((piece) => {
        if (!blastRef.current) {
          const image = imageRef.current;
          const rect = image?.getBoundingClientRect();
          const tileWidth = rect ? rect.width / COLS : 0;
          const tileHeight = rect ? rect.height / ROWS : 0;
          const pieceX =
            (rect?.left ?? 0) + piece.col * tileWidth + tileWidth / 2 + piece.x;
          const pieceY =
            (rect?.top ?? 0) +
            piece.row * tileHeight +
            tileHeight / 2 +
            piece.y;
          const dx = pieceX - pointerRef.current.x;
          const dy = pieceY - pointerRef.current.y;
          const distance = Math.max(1, Math.hypot(dx, dy));
          const radius = Math.max(
            70,
            Math.min(115, (rect?.width ?? 300) * 0.3),
          );
          if (hoveringRef.current && distance < radius) {
            const falloff = 1 - distance / radius;
            const force = falloff * falloff * 1250;
            piece.vx += (dx / distance) * force * delta;
            piece.vy += (dy / distance) * force * delta;
            piece.rotationVelocity += (dx / distance) * falloff * delta * 2.4;
          }
          const damping = Math.exp(-10 * delta);
          piece.vx = (piece.vx - piece.x * 52 * delta) * damping;
          piece.vy = (piece.vy - piece.y * 52 * delta) * damping;
          piece.rotationVelocity =
            (piece.rotationVelocity - piece.rotation * 42 * delta) * damping;
        } else if (returning && elapsedRef.current - HOLD >= piece.delay) {
          const returnAge = elapsedRef.current - HOLD - piece.delay;
          if (!piece.returnStarted) {
            piece.returnStarted = true;
            piece.returnX = piece.x;
            piece.returnY = piece.y;
            piece.returnRotation = piece.rotation;
            piece.vx = 0;
            piece.vy = 0;
            piece.rotationVelocity = 0;
          }
          const progress = Math.min(1, returnAge / RETURN_DURATION);
          const eased =
            progress *
            progress *
            progress *
            (progress * (progress * 6 - 15) + 10);
          piece.x = piece.returnX * (1 - eased);
          piece.y = piece.returnY * (1 - eased);
          piece.rotation = piece.returnRotation * (1 - eased);
        } else {
          const drag = Math.exp(-DRAG * delta);
          piece.vx *= drag;
          piece.vy *= drag;
          piece.rotationVelocity *= Math.exp(-ROTATION_DRAG * delta);
        }
        if (!piece.returnStarted) {
          piece.x += piece.vx * delta;
          piece.y += piece.vy * delta;
          piece.rotation += piece.rotationVelocity * delta;
        }
        if (
          Math.abs(piece.x) > 0.08 ||
          Math.abs(piece.y) > 0.08 ||
          Math.abs(piece.vx) > 0.08 ||
          Math.abs(piece.vy) > 0.08 ||
          Math.abs(piece.rotation) > 0.002
        )
          moving = true;
        if (
          returning &&
          (Math.abs(piece.x) > 0.35 ||
            Math.abs(piece.y) > 0.35 ||
            Math.abs(piece.vx) > 0.5 ||
            Math.abs(piece.vy) > 0.5 ||
            Math.abs(piece.rotation) > 0.008 ||
            Math.abs(piece.rotationVelocity) > 0.02)
        )
          returnSettled = false;
      });

      draw();
      const returnExpired = blastRef.current && elapsedRef.current >= HOLD + 9;
      if ((returnSettled && elapsedRef.current > HOLD + 2.5) || returnExpired) {
        resetPieces();
        blastRef.current = false;
        elapsedRef.current = 0;
        moving = false;
        draw();
      }

      if (hoveringRef.current || moving) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        resetPieces();
        blastRef.current = false;
        activeRef.current = false;
        frameRef.current = null;
        draw();
        setActive(false);
      }
    },
    [draw, resetPieces],
  );

  const beginHover = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (prefersReducedMotion() || event.pointerType === "touch") return;
      hoveringRef.current = true;
      pointerRef.current = { x: event.clientX, y: event.clientY };
      if (!activeRef.current) {
        activeRef.current = true;
        elapsedRef.current = 0;
        lastTimeRef.current = performance.now();
        setActive(true);
        draw();
        frameRef.current = requestAnimationFrame(tick);
      }
    },
    [draw, tick],
  );

  const endHover = useCallback(() => {
    hoveringRef.current = false;
  }, []);

  const ignite = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (prefersReducedMotion()) return;
      const image = imageRef.current;
      if (!image) return;
      const rect = image.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      const tileWidth = rect.width / COLS;
      const tileHeight = rect.height / ROWS;

      piecesRef.current.forEach((piece) => {
        const pieceX = piece.col * tileWidth + tileWidth / 2 + piece.x;
        const pieceY = piece.row * tileHeight + tileHeight / 2 + piece.y;
        const dx = pieceX - clickX;
        const dy = pieceY - clickY;
        const distance = Math.max(8, Math.hypot(dx, dy));
        const normalizedDistance = distance / Math.max(rect.width, rect.height);
        const power =
          900 * Math.exp(-normalizedDistance * 5) +
          95 / (0.15 + normalizedDistance);
        piece.vx +=
          (dx / distance) * power + (Math.random() - 0.5) * power * 0.32;
        piece.vy +=
          (dy / distance) * power + (Math.random() - 0.5) * power * 0.32;
        piece.rotationVelocity += (Math.random() - 0.5) * power * 0.022;
        piece.delay = normalizedDistance * 0.38 + Math.random() * 0.18;
        piece.returnStarted = false;
      });

      elapsedRef.current = 0;
      blastRef.current = true;
      lastTimeRef.current = performance.now();
      if (!activeRef.current) {
        activeRef.current = true;
        setActive(true);
        draw();
        frameRef.current = requestAnimationFrame(tick);
      }
    },
    [draw, tick],
  );

  useEffect(() => {
    resetPieces();
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      sizeRef.current = { width, height, dpr };
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      draw();
    };
    const loaded = () => resize();
    if (image.complete) loaded();
    else image.addEventListener("load", loaded, { once: true });
    const observer = new ResizeObserver(resize);
    observer.observe(image);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", draw, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", draw);
      image.removeEventListener("load", loaded);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [draw, resetPieces, src]);

  return (
    <button
      type="button"
      onPointerDown={ignite}
      onPointerEnter={beginHover}
      onPointerMove={beginHover}
      onPointerLeave={endHover}
      className="physics-portrait relative block w-full cursor-crosshair touch-manipulation bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
      aria-label="Explode Michael's portrait"
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`block h-auto w-full ${active ? "opacity-0" : "opacity-100"}`}
        fetchPriority="high"
      />
      {typeof document !== "undefined" &&
        createPortal(
          <canvas
            ref={canvasRef}
            className={`pointer-events-none fixed inset-0 z-30 h-screen w-screen ${active ? "visible" : "invisible"}`}
            aria-hidden
          />,
          document.body,
        )}
    </button>
  );
};

export default memo(PhysicsPortrait);
