export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

export const isMobileViewport = (maxWidth = 640): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia?.(`(max-width: ${maxWidth}px)`).matches === true;

export const canHover = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(hover: hover) and (pointer: fine)").matches === true;

export const getRevealMotion = () => {
  const mobile = isMobileViewport();

  return {
    distance: mobile ? 18 : 30,
    largeDistance: mobile ? 32 : 50,
    scale: mobile ? 0.98 : 0.96,
    start: mobile ? "top 92%" : "top 85%",
    headingStart: mobile ? "top 88%" : "top 80%",
    duration: mobile ? 0.4 : 0.6,
    shortDuration: mobile ? 0.32 : 0.5,
    underlineDuration: mobile ? 0.42 : 0.7,
    stagger: mobile ? 0.06 : 0.12,
    cardStagger: mobile ? 0.04 : 0.08,
    ease: mobile ? "power2.out" : "power3.out",
    isMobile: mobile,
  };
};
