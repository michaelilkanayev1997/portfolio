import { memo, useEffect } from "react";

import { prefersReducedMotion } from "../utils/motion";

const InteractionLayer = () => {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame: number | null = null;
    let pendingTarget: HTMLElement | null = null;
    let pointerX = 0;
    let pointerY = 0;

    const updateMagneticTarget = () => {
      frame = null;
      const target = pendingTarget;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const x = (pointerX - rect.left - rect.width / 2) * 0.16;
      const y = (pointerY - rect.top - rect.height / 2) * 0.16;
      target.style.setProperty("--magnetic-x", `${x}px`);
      target.style.setProperty("--magnetic-y", `${y}px`);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!hoverQuery.matches) return;
      const target = (event.target as Element | null)?.closest<HTMLElement>("[data-magnetic]");
      if (!target) return;
      pendingTarget = target;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frame === null) frame = requestAnimationFrame(updateMagneticTarget);
    };

    const onPointerOut = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>("[data-magnetic]");
      if (!target || target.contains(event.relatedTarget as Node | null)) return;
      if (pendingTarget === target) pendingTarget = null;
      target.style.setProperty("--magnetic-x", "0px");
      target.style.setProperty("--magnetic-y", "0px");
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>("[data-ripple]");
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "interaction-ripple";
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      target.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerout", onPointerOut, { passive: true });
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("pointerdown", onPointerDown);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
};

export default memo(InteractionLayer);
