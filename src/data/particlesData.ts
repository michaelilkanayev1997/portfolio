import type { ISourceOptions } from "@tsparticles/engine";

export const particleOptions: ISourceOptions = {
  fpsLimit: 60,
  particles: {
    number: {
      value: 40,
      density: {
        enable: false,
      },
      limit: { mode: "delete", value: 60 },
    },
    color: {
      value: "#ffffff",
    },
    shape: {
      type: "circle",
    },
    opacity: {
      value: { min: 0.1, max: 0.5 },
    },
    size: {
      value: { min: 1, max: 3 },
    },
    links: {
      enable: true,
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
    detectsOn: "canvas",
    events: {
      onHover: {
        enable: true,
        mode: "grab",
      },
      onClick: {
        enable: true,
        mode: "push",
      },
      resize: { enable: true, delay: 0.5 },
    },
    modes: {
      grab: {
        distance: 200,
        links: {
          opacity: 1,
        },
      },
      push: {
        quantity: 4,
      },
    },
  },
  detectRetina: true,
};
