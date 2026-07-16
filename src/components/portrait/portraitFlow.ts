import type { QualityTier } from "./fragmentMesh";
import { lerp, smoothstep } from "./portraitMath";

export type FlowSectionName =
  | "hero"
  | "about"
  | "certifications"
  | "portfolio"
  | "experience"
  | "contact";

type FlowObstacle = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  kind: "soft" | "hard";
};

export type FlowSection = {
  name: Exclude<FlowSectionName, "hero">;
  top: number;
  bottom: number;
  obstacles: FlowObstacle[];
};

export const FLOW_SECTIONS: Array<{
  name: FlowSection["name"];
  soft: string;
  hard: string;
}> = [
  {
    name: "about",
    soft: ".about-heading, .about-intro, .about-lead, .about-item",
    hard: "",
  },
  {
    name: "certifications",
    soft: ".cert-heading, .cert-caption",
    hard: ".cert-swiper",
  },
  {
    name: "portfolio",
    soft: ".portfolio-heading",
    hard: ".portfolio-card",
  },
  {
    name: "experience",
    soft: ".skills-heading, .skill-category-title",
    hard: ".skill-card",
  },
  {
    name: "contact",
    soft: ".contact-heading, .contact-sub",
    hard: "#contact form",
  },
];

export const flowRoot = (name: FlowSection["name"]) => {
  const anchor = document.getElementById(name);
  if (!anchor) return null;
  if (name === "certifications") return anchor.parentElement;
  if (name === "contact") return anchor.parentElement?.parentElement ?? anchor;
  return anchor;
};

const readObstacleRects = (
  root: HTMLElement,
  selector: string,
  kind: FlowObstacle["kind"],
) => {
  if (!selector) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).flatMap(
    (element) => {
      const rect = element.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return [];
      return [
        {
          left: rect.left + window.scrollX,
          top: rect.top + window.scrollY,
          right: rect.right + window.scrollX,
          bottom: rect.bottom + window.scrollY,
          kind,
        } satisfies FlowObstacle,
      ];
    },
  );
};

export const collectFlowSections = (): FlowSection[] =>
  FLOW_SECTIONS.flatMap((definition) => {
    const root = flowRoot(definition.name);
    if (!root) return [];
    const rect = root.getBoundingClientRect();
    return [
      {
        name: definition.name,
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
        obstacles: [
          ...readObstacleRects(root, definition.soft, "soft"),
          ...readObstacleRects(root, definition.hard, "hard"),
        ],
      },
    ];
  });

export const obstacleVisibilityAt = (
  obstacles: FlowObstacle[] | undefined,
  x: number,
  y: number,
  scrollY: number,
  tier: QualityTier,
) => {
  let visibility = y < 90 ? 0.08 : 1;
  if (window.innerWidth >= 1280 && x < 70 && y > 315 && y < 580) {
    visibility = Math.min(visibility, 0.08);
  }
  if (!obstacles) return visibility;

  for (const obstacle of obstacles) {
    const top = obstacle.top - scrollY;
    const bottom = obstacle.bottom - scrollY;
    const dx = Math.max(obstacle.left - x, 0, x - obstacle.right);
    const dy = Math.max(top - y, 0, y - bottom);
    const influence = obstacle.kind === "hard" ? 30 : 22;
    if (dx >= influence || dy >= influence) continue;
    const distance = Math.hypot(dx, dy);
    if (distance >= influence) continue;
    const minimum = obstacle.kind === "hard"
      ? tier === "low"
        ? 0.2
        : 0.08
      : tier === "low"
        ? 0.38
        : 0.28;
    visibility = Math.min(
      visibility,
      lerp(minimum, 1, smoothstep(distance / influence)),
    );
    if (visibility <= 0.08) break;
  }
  return visibility;
};
