import { useEffect, useRef } from "react";

import type { DragonArtworkRefs } from "./DragonArtwork";

export const useDragonAnimation = (): DragonArtworkRefs => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const spineRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const leftWingRef = useRef<SVGGElement>(null);
  const rightWingRef = useRef<SVGGElement>(null);
  const fireRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      containerRef.current?.style.setProperty("display", "none");
      return;
    }

    let W = window.innerWidth;
    let H = window.innerHeight;
    const isMobile = W < 768;
    const SEG_COUNT = isMobile ? 20 : 30;
    const SEG_BASE = isMobile ? 16 : 22;

    const segments: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < SEG_COUNT; i++) {
      segments.push({ x: W * 0.5 - i * SEG_BASE, y: H * 0.5 });
    }

    const head = { x: W * 0.5, y: H * 0.5, vx: 0, vy: 0 };
    const target = { x: W * 0.5, y: H * 0.5 };

    let rawScroll = window.scrollY;
    let smoothScroll = rawScroll;
    let prevSmoothScroll = rawScroll;
    let smoothVel = 0;
    let fireAmt = 0;

    let visible = !document.hidden;
    let lastT = performance.now();
    let t = 0;
    let raf: number | null = null;

    const onScroll = () => {
      rawScroll = window.scrollY;
    };
    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
    };
    const onVis = () => {
      visible = !document.hidden;
      if (visible) {
        lastT = performance.now();
        if (raf === null) raf = requestAnimationFrame(tick);
      } else if (raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    };

    const tick = (now: number) => {
      raf = null;

      const dt = Math.min(50, now - lastT);
      lastT = now;
      t += dt;
      const dtN = dt / 16.67;

      if (!visible) return;

      // Low-pass scroll position (~120ms time constant) -> no jitter from scroll events
      const alpha = 1 - Math.exp(-dt / 120);
      smoothScroll += (rawScroll - smoothScroll) * alpha;
      const instVel = (smoothScroll - prevSmoothScroll) / dt;
      smoothVel += (instVel - smoothVel) * Math.min(1, 0.18 * dtN);
      prevSmoothScroll = smoothScroll;

      const ts = t * 0.001;

      // Flight path is time-driven; scroll only nudges it gently.
      const ampX = W * (isMobile ? 0.26 : 0.32);
      const ampY = H * 0.2;
      const phaseX = ts * 0.45 + smoothScroll * 0.0006;
      const phaseY = ts * 0.33 + smoothScroll * 0.00045;
      target.x =
        W * 0.5 +
        Math.sin(phaseX) * ampX +
        Math.cos(ts * 0.21) * W * 0.04;
      target.y =
        H * 0.45 +
        Math.cos(phaseY) * ampY +
        Math.sin(ts * 0.17) * H * 0.04;

      // Subtle vertical lean from smoothed scroll velocity.
      const lean = Math.max(-H * 0.07, Math.min(H * 0.07, smoothVel * 70));
      target.y += lean;

      // Critically-damped spring on head, frame-rate independent.
      const dx = target.x - head.x;
      const dy = target.y - head.y;
      const k = 0.032 * dtN;
      const c = Math.min(0.95, 0.2 * dtN);
      head.vx += dx * k;
      head.vy += dy * k;
      head.vx *= 1 - c;
      head.vy *= 1 - c;
      head.x += head.vx * dtN;
      head.y += head.vy * dtN;

      const angle = Math.atan2(head.vy, head.vx);

      // Two iterations stabilize the rope chain at high speeds.
      for (let iter = 0; iter < 2; iter++) {
        segments[0].x = head.x;
        segments[0].y = head.y;
        for (let i = 1; i < SEG_COUNT; i++) {
          const prev = segments[i - 1];
          const cur = segments[i];
          const ex = cur.x - prev.x;
          const ey = cur.y - prev.y;
          const d = Math.hypot(ex, ey) || 1;
          const seglen = SEG_BASE - (i / SEG_COUNT) * (SEG_BASE * 0.45);
          cur.x = prev.x + (ex / d) * seglen;
          cur.y = prev.y + (ey / d) * seglen;
        }
      }

      // Smooth quadratic spline through segment midpoints.
      let d = `M${segments[0].x.toFixed(1)},${segments[0].y.toFixed(1)}`;
      for (let i = 1; i < SEG_COUNT - 1; i++) {
        const mx = (segments[i].x + segments[i + 1].x) * 0.5;
        const my = (segments[i].y + segments[i + 1].y) * 0.5;
        d += ` Q${segments[i].x.toFixed(1)},${segments[i].y.toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
      }
      const tail = segments[SEG_COUNT - 1];
      d += ` T${tail.x.toFixed(1)},${tail.y.toFixed(1)}`;

      bodyRef.current?.setAttribute("d", d);
      glowRef.current?.setAttribute("d", d);
      spineRef.current?.setAttribute("d", d);

      const deg = (angle * 180) / Math.PI;
      headRef.current?.setAttribute(
        "transform",
        `translate(${head.x.toFixed(1)} ${head.y.toFixed(1)}) rotate(${deg.toFixed(1)})`,
      );

      const flap = Math.sin(ts * 7.5) * 32 + Math.sin(ts * 15) * 4;
      leftWingRef.current?.setAttribute(
        "transform",
        `rotate(${(-flap).toFixed(1)})`,
      );
      rightWingRef.current?.setAttribute(
        "transform",
        `rotate(${flap.toFixed(1)})`,
      );

      // Fire scales with smoothed velocity (px/ms -> roughly 0..1).
      const desired = Math.min(1, Math.abs(smoothVel) * 3.5);
      fireAmt += (desired - fireAmt) * Math.min(1, 0.2 * dtN);
      const flick = 0.82 + Math.sin(ts * 28) * 0.18;
      if (fireRef.current) {
        fireRef.current.setAttribute(
          "transform",
          `scale(${(fireAmt * flick).toFixed(2)} ${(fireAmt * 0.85).toFixed(2)})`,
        );
        fireRef.current.setAttribute("opacity", (fireAmt * 0.95).toFixed(2));
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return {
    containerRef,
    bodyRef,
    glowRef,
    spineRef,
    headRef,
    leftWingRef,
    rightWingRef,
    fireRef,
  };
};
