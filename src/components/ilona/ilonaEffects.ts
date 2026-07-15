import gsap from "gsap";

const PARTICLE_COLORS = ["#ff6aa9", "#ffd1e4", "#a78bfa", "#67e8f9", "#fde68a"];

export type PixelPosition = {
  x: number;
  y: number;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

const heartSvg = (color: string) => `
  <svg viewBox="0 0 32 29" width="100%" height="100%" aria-hidden="true">
    <path fill="${color}" d="M23.7 0C20.4 0 17.8 1.9 16 4.4 14.2 1.9 11.6 0 8.3 0 3.7 0 0 3.7 0 8.3c0 9.1 14.8 19.5 15.4 19.9.4.3.9.3 1.2 0C17.2 27.8 32 17.4 32 8.3 32 3.7 28.3 0 23.7 0Z"/>
  </svg>
`;

export const spawnHeart = (
  container: HTMLDivElement,
  originX = 50,
  originY = 82,
  burst = false,
) => {
  const el = document.createElement("span");
  const size = Math.random() * 18 + 12;
  const color =
    PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];

  el.innerHTML = heartSvg(color);
  el.style.cssText = [
    "position:absolute",
    `left:${originX}%`,
    `top:${originY}%`,
    `width:${size}px`,
    `height:${size}px`,
    "pointer-events:none",
    "opacity:0",
    "filter:drop-shadow(0 0 10px rgba(255,120,180,0.45))",
  ].join(";");

  container.appendChild(el);

  const drift = (Math.random() - 0.5) * (burst ? 360 : 170);
  const rise = burst
    ? -(Math.random() * 250 + 150)
    : -(window.innerHeight * 0.72 + Math.random() * 160);
  const duration = burst ? Math.random() * 1.1 + 1.4 : Math.random() * 2.5 + 3;

  gsap
    .timeline({ onComplete: () => el.remove() })
    .fromTo(
      el,
      { opacity: 0, scale: 0.35, rotation: Math.random() * 60 - 30 },
      { opacity: 1, scale: 1, duration: 0.22, ease: "power2.out" },
    )
    .to(
      el,
      {
        x: drift,
        y: rise,
        rotation: Math.random() * 260 - 130,
        duration,
        ease: "power1.out",
      },
      0,
    )
    .to(el, { opacity: 0, duration: 0.45 }, "-=0.45");
};

export const spawnConfetti = (container: HTMLDivElement) => {
  const el = document.createElement("span");
  const color =
    PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];

  el.style.cssText = [
    "position:absolute",
    "left:50%",
    "top:48%",
    "width:7px",
    "height:14px",
    `background:${color}`,
    "border-radius:2px",
    "pointer-events:none",
    "opacity:0",
  ].join(";");

  container.appendChild(el);

  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * 260 + 110;

  gsap
    .timeline({ onComplete: () => el.remove() })
    .to(el, { opacity: 1, duration: 0.08 })
    .to(
      el,
      {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance + Math.random() * 80,
        rotation: Math.random() * 720 - 360,
        duration: Math.random() * 1.1 + 1.1,
        ease: "power3.out",
      },
      0,
    )
    .to(el, { opacity: 0, duration: 0.35 }, "-=0.35");
};

export const spawnBadge = (
  container: HTMLDivElement,
  text: string,
  originX = 50,
  originY = 50,
) => {
  const el = document.createElement("span");
  el.textContent = text;
  el.dir = "rtl";
  el.style.cssText = [
    "position:absolute",
    `left:${originX}%`,
    `top:${originY}%`,
    "transform:translate(-50%,-50%)",
    "padding:7px 10px",
    "border-radius:999px",
    "background:rgba(255,255,255,0.12)",
    "border:1px solid rgba(255,255,255,0.18)",
    "color:#ffe4f1",
    "font-size:12px",
    "font-weight:800",
    "letter-spacing:0",
    "pointer-events:none",
    "white-space:nowrap",
    "box-shadow:0 12px 30px rgba(0,0,0,0.28)",
    "backdrop-filter:blur(12px)",
  ].join(";");

  container.appendChild(el);

  gsap
    .timeline({ onComplete: () => el.remove() })
    .fromTo(
      el,
      { opacity: 0, y: 8, scale: 0.78 },
      { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: "back.out(2)" },
    )
    .to(el, { y: -46, rotation: Math.random() * 10 - 5, duration: 0.9 })
    .to(el, { opacity: 0, scale: 0.88, duration: 0.25 }, "-=0.25");
};

export const spawnHitRings = (container: HTMLDivElement, origin: PixelPosition) => {
  if (prefersReducedMotion()) return;

  const fragment = document.createDocumentFragment();
  const rings = Array.from({ length: 3 }, (_, index) => {
    const el = document.createElement("span");
    const size = 34 + index * 10;

    el.style.cssText = [
      "position:absolute",
      `left:${origin.x}px`,
      `top:${origin.y}px`,
      `width:${size}px`,
      `height:${size}px`,
      "z-index:1300",
      "border-radius:999px",
      "border:2px solid rgba(255,255,255,0.82)",
      "box-shadow:0 0 16px rgba(103,232,249,0.58), inset 0 0 16px rgba(255,106,169,0.28)",
      "pointer-events:none",
      "opacity:0",
      "will-change:transform,opacity",
      "contain:paint",
    ].join(";");

    fragment.appendChild(el);
    return el;
  });

  container.appendChild(fragment);

  gsap.fromTo(
    rings,
    { xPercent: -50, yPercent: -50, opacity: 0.86, scale: 0.28 },
    {
      opacity: 0,
      scale: (index: number) => 2.2 + index * 0.34,
      duration: 0.68,
      ease: "power2.out",
      stagger: 0.07,
      onComplete: () => rings.forEach((ring) => ring.remove()),
    },
  );
};

export const spawnStagePraise = (container: HTMLDivElement) => {
  const el = document.createElement("span");
  el.textContent = "יופי, חמודה";
  el.dir = "rtl";
  el.style.cssText = [
    "position:absolute",
    "left:50%",
    "top:50%",
    "z-index:1290",
    "padding:14px 22px",
    "border-radius:999px",
    "background:rgba(255,228,241,0.18)",
    "border:1px solid rgba(255,255,255,0.24)",
    "color:#fff1f8",
    "font-size:clamp(24px,7vw,54px)",
    "font-weight:1000",
    "letter-spacing:0",
    "line-height:1",
    "white-space:nowrap",
    "pointer-events:none",
    "opacity:0",
    "text-shadow:0 0 24px rgba(255,106,169,0.42)",
    "box-shadow:0 22px 54px rgba(0,0,0,0.34), 0 0 36px rgba(255,106,169,0.28)",
    "backdrop-filter:blur(16px)",
    "will-change:transform,opacity",
    "contain:paint",
  ].join(";");

  container.appendChild(el);

  if (prefersReducedMotion()) {
    gsap
      .timeline({ onComplete: () => el.remove() })
      .set(el, { xPercent: -50, yPercent: -50, opacity: 1 })
      .to(el, { opacity: 0, duration: 0.2 }, 0.9);
    return;
  }

  gsap
    .timeline({ onComplete: () => el.remove() })
    .fromTo(
      el,
      {
        xPercent: -50,
        yPercent: -50,
        y: 26,
        scale: 0.68,
        opacity: 0,
        rotation: -3,
      },
      {
        xPercent: -50,
        yPercent: -50,
        y: 0,
        scale: 1.08,
        opacity: 1,
        rotation: 0,
        duration: 0.28,
        ease: "back.out(1.9)",
      },
    )
    .to(el, { scale: 1, duration: 0.18, ease: "power2.out" })
    .to(
      el,
      {
        y: -30,
        scale: 0.94,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
      },
      0.72,
    );
};

export const spawnStardust = (
  container: HTMLDivElement,
  origin: PixelPosition,
  target: PixelPosition | null = null,
  intensity = 1,
) => {
  if (prefersReducedMotion()) return;

  const fragment = document.createDocumentFragment();
  const nodes: HTMLSpanElement[] = [];
  const motion = target
    ? { x: target.x - origin.x, y: target.y - origin.y }
    : { x: 0, y: 0 };
  const length = Math.hypot(motion.x, motion.y) || 1;
  const normal = { x: -motion.y / length, y: motion.x / length };
  const count = Math.round(clamp((target ? 12 : 7) * intensity, 4, 18));
  const particleData: Array<{
    x: number;
    y: number;
    rotation: number;
    duration: number;
  }> = [];

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    const size = Math.random() * 3.5 + 2.5;
    const color =
      PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
    const along = target ? Math.random() * 0.82 : 0;
    const side = (Math.random() - 0.5) * (target ? 36 : 20);
    const baseX = origin.x + motion.x * along + normal.x * side;
    const baseY = origin.y + motion.y * along + normal.y * side;
    const angle =
      (target
        ? Math.atan2(motion.y, motion.x) + Math.PI
        : Math.random() * 6.28) +
      (Math.random() - 0.5) * 1.35;
    const distance = Math.random() * (target ? 44 : 54) + 18;

    el.style.cssText = [
      "position:absolute",
      `left:${baseX}px`,
      `top:${baseY}px`,
      `width:${size}px`,
      `height:${size}px`,
      "z-index:1250",
      `background:${color}`,
      `box-shadow:0 0 ${Math.round(size * 4)}px ${color}`,
      "border-radius:2px",
      "pointer-events:none",
      "opacity:0",
      "will-change:transform,opacity",
      "contain:paint",
    ].join(";");

    particleData.push({
      x: Math.cos(angle) * distance - motion.x * 0.035,
      y: Math.sin(angle) * distance - motion.y * 0.035,
      rotation: Math.random() * 250 - 125,
      duration: Math.random() * 0.28 + 0.34,
    });
    nodes.push(el);
    fragment.appendChild(el);
  }

  container.appendChild(fragment);

  gsap
    .timeline({ onComplete: () => nodes.forEach((node) => node.remove()) })
    .fromTo(
      nodes,
      { xPercent: -50, yPercent: -50, opacity: 0, scale: 0.25, rotation: 45 },
      {
        opacity: 0.95,
        scale: 1,
        duration: 0.08,
        stagger: { each: 0.006, from: "random" },
        ease: "power2.out",
      },
    )
    .to(
      nodes,
      {
        x: (index: number) => particleData[index].x,
        y: (index: number) => particleData[index].y,
        opacity: 0,
        scale: 0,
        rotation: (index: number) => particleData[index].rotation,
        duration: (index: number) => particleData[index].duration,
        ease: "power2.out",
      },
      0.04,
    );
};
