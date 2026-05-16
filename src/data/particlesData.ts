import type { ISourceOptions } from "@tsparticles/engine";

const isMobile =
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 768px)").matches;
const isLowPower =
  typeof navigator !== "undefined" &&
  (navigator as Navigator & { deviceMemory?: number }).deviceMemory !==
    undefined &&
  (navigator as Navigator & { deviceMemory?: number }).deviceMemory! <= 4;

const particleCount = isMobile || isLowPower ? 18 : 40;
const enableLinks = !isMobile && !isLowPower;

export const particleOptions: ISourceOptions = {
  fpsLimit: 60,
  pauseOnBlur: true,
  pauseOnOutsideViewport: true,
  particles: {
    number: {
      value: particleCount,
      density: { enable: false },
      limit: { mode: "delete", value: particleCount },
    },
    color: { value: "#ffffff" },
    shape: { type: "circle" },
    opacity: { value: { min: 0.1, max: 0.5 } },
    size: { value: { min: 1, max: 3 } },
    links: {
      enable: enableLinks,
      distance: 150,
      color: "#ffffff",
      opacity: 0.4,
      width: 1,
    },
    move: {
      enable: true,
      speed: 1,
      direction: "none",
      random: true,
      straight: false,
      outModes: { default: "out" },
    },
  },
  interactivity: {
    detectsOn: "window",
    events: {
      onHover: { enable: !isMobile, mode: "grab" },
      onClick: { enable: !isMobile, mode: "push" },
      resize: { enable: true, delay: 0.5 },
    },
    modes: {
      grab: { distance: 200, links: { opacity: 1 } },
      push: { quantity: 3 },
    },
  },
  detectRetina: true,
};
