import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { prefersReducedMotion } from "../utils/motion";

gsap.registerPlugin(ScrollTrigger);

interface ProjectSectionProps {
  title: string;
  children?: ReactNode;
  titleClassName?: string;
  contentClassName?: string;
}

const ProjectSection = ({
  title,
  children,
  titleClassName,
  contentClassName,
}: ProjectSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!children || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        defaults: { ease: "power3.out", force3D: true },
      });

      tl.from(".ps-title", { y: 24, opacity: 0, duration: 0.55 })
        .fromTo(
          ".ps-underline",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.6, ease: "power2.inOut" },
          "-=0.25",
        )
        .from(".ps-content", { y: 30, opacity: 0, duration: 0.6 }, "-=0.35");
    }, sectionRef);

    return () => ctx.revert();
  }, [children]);

  if (!children) return null;

  return (
    <div ref={sectionRef} className="my-8">
      <span className="relative inline-block mb-4">
        <h2
          className={`ps-title text-yellow-100 text-2xl sm:text-3xl font-bold inline-block z-10 ${titleClassName ?? ""}`}
        >
          {title}
        </h2>
        <span
          aria-hidden
          className="ps-underline absolute left-0 -bottom-1 h-[3px] w-full origin-left bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 rounded"
          style={{ transform: "scaleX(0)" }}
        />
      </span>
      <div className={`ps-content ${contentClassName ?? ""}`}>{children}</div>
    </div>
  );
};

export default ProjectSection;
