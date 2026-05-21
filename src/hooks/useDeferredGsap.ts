import { useEffect, type DependencyList, type RefObject } from "react";
import gsap from "gsap";

import { prefersReducedMotion } from "../utils/motion";

export const useDeferredGsap = <T extends Element>(
  scopeRef: RefObject<T | null>,
  setup: () => void,
  deps: DependencyList,
) => {
  useEffect(() => {
    if (!scopeRef.current || prefersReducedMotion()) return undefined;

    let ctx: gsap.Context | undefined;
    let cancelled = false;

    const frame = requestAnimationFrame(() => {
      if (cancelled || !scopeRef.current) return;
      ctx = gsap.context(setup, scopeRef.current);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      ctx?.revert();
    };
  }, deps);
};
