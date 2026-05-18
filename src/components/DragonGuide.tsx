import { memo, useEffect, useRef, useState } from "react";

const TRIGGER = "dragon";

const DragonInner = () => {
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
      if (visible) lastT = performance.now();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    const tick = (now: number) => {
      const dt = Math.min(50, now - lastT);
      lastT = now;
      t += dt;
      const dtN = dt / 16.67;

      if (!visible) {
        raf = requestAnimationFrame(tick);
        return;
      }

      // Low-pass scroll position (~120ms time constant) → no jitter from scroll events
      const alpha = 1 - Math.exp(-dt / 120);
      smoothScroll += (rawScroll - smoothScroll) * alpha;
      const instVel = (smoothScroll - prevSmoothScroll) / dt;
      smoothVel += (instVel - smoothVel) * Math.min(1, 0.18 * dtN);
      prevSmoothScroll = smoothScroll;

      const ts = t * 0.001;

      // Flight path is TIME-driven; scroll only nudges it gently
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

      // Subtle vertical lean from smoothed scroll velocity
      const lean = Math.max(-H * 0.07, Math.min(H * 0.07, smoothVel * 70));
      target.y += lean;

      // Critically-damped spring on head — frame-rate independent
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

      // Rope follow — 2 iterations stabilises the chain at high speeds
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

      // Smooth quadratic spline through segment midpoints
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

      // Fire scales with smoothed velocity (px/ms → roughly 0..1)
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

    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none z-[10] dragon-enter"
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <defs>
          <linearGradient id="dragonBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="dragonFire" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fde047" stopOpacity="1" />
            <stop offset="55%" stopColor="#f97316" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="dragonEye" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#dc2626" />
          </radialGradient>
          <filter
            id="dragonGlow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        <path
          ref={glowRef}
          fill="none"
          stroke="url(#dragonBody)"
          strokeWidth="28"
          strokeLinecap="round"
          opacity="0.35"
          filter="url(#dragonGlow)"
        />
        <path
          ref={bodyRef}
          fill="none"
          stroke="url(#dragonBody)"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          ref={spineRef}
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="3 9"
          opacity="0.85"
        />

        <g ref={headRef}>
          <g ref={leftWingRef} style={{ transformOrigin: "0 0" }}>
            <path
              d="M0 0 Q -12 -30 -46 -38 Q -34 -16 -8 -6 Z"
              fill="url(#dragonBody)"
              opacity="0.55"
            />
            <path
              d="M0 0 Q -10 -22 -38 -32"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="1.2"
              fill="none"
            />
            <path
              d="M0 0 Q -6 -14 -22 -22"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
              fill="none"
            />
          </g>
          <g ref={rightWingRef} style={{ transformOrigin: "0 0" }}>
            <path
              d="M0 0 Q -12 30 -46 38 Q -34 16 -8 6 Z"
              fill="url(#dragonBody)"
              opacity="0.55"
            />
            <path
              d="M0 0 Q -10 22 -38 32"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="1.2"
              fill="none"
            />
            <path
              d="M0 0 Q -6 14 -22 22"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
              fill="none"
            />
          </g>

          <path
            d="M -10 -10 Q 4 -13 22 -3 L 27 0 L 22 3 Q 4 13 -10 10 Q -2 0 -10 -10 Z"
            fill="url(#dragonBody)"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="0.8"
          />
          <path
            d="M -4 -10 L -1 -19 L 4 -9"
            stroke="#c084fc"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M -4 10 L -1 19 L 4 9"
            stroke="#c084fc"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />

          <circle cx="8" cy="-3.5" r="2.8" fill="url(#dragonEye)" />
          <circle cx="8.7" cy="-4.2" r="0.9" fill="#ffffff" />

          <g
            ref={fireRef}
            opacity="0"
            style={{ transformOrigin: "26px 0", transformBox: "fill-box" }}
          >
            <ellipse cx="46" cy="0" rx="44" ry="9" fill="url(#dragonFire)" />
            <ellipse
              cx="34"
              cy="0"
              rx="24"
              ry="5"
              fill="#fde047"
              opacity="0.85"
            />
            <ellipse
              cx="22"
              cy="0"
              rx="10"
              ry="3"
              fill="#ffffff"
              opacity="0.9"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

const DragonGuide = () => {
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const bufferRef = useRef("");

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeRef.current) {
        setActive(false);
        bufferRef.current = "";
        return;
      }

      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea") {
        bufferRef.current = "";
        return;
      }

      if (e.key.length === 1) {
        bufferRef.current = (
          bufferRef.current + e.key.toLowerCase()
        ).slice(-TRIGGER.length);
        if (bufferRef.current === TRIGGER) {
          bufferRef.current = "";
          setActive((p) => !p);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!active) return null;
  return <DragonInner />;
};

export default memo(DragonGuide);
