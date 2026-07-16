import { memo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import PortfolioItem from "./PortfolioItem";
import portfolios from "../data/portfolioData";
import { useDeferredGsap } from "../hooks/useDeferredGsap";
import { getRevealMotion } from "../utils/motion";

gsap.registerPlugin(ScrollTrigger);

const Portfolio = memo(() => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useDeferredGsap(
    sectionRef,
    () => {
      const motion = getRevealMotion();
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".portfolio-heading",
          start: motion.headingStart,
          toggleActions: "play none none reverse",
        },
        defaults: { ease: motion.ease, force3D: true },
      });
      tl.from(".portfolio-heading", {
        y: motion.distance,
        opacity: 0,
        duration: motion.duration,
      })
        .fromTo(
          ".portfolio-heading-underline",
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: motion.underlineDuration,
            ease: "power2.inOut",
          },
          "-=0.3",
        )
        .from(
          ".portfolio-sub",
          {
            y: motion.isMobile ? 14 : 20,
            opacity: 0,
            duration: motion.shortDuration,
          },
          "-=0.4",
        );

      gsap.set(".portfolio-card", {
        opacity: 0,
        y: motion.isMobile ? 28 : 50,
      });

      ScrollTrigger.batch(".portfolio-card", {
        start: motion.isMobile ? "top 94%" : "top 88%",
        batchMax: motion.isMobile ? 4 : 6,
        interval: 0.08,
        onEnter: (els) => {
          gsap.set(els, { willChange: "transform,opacity" });
          gsap.to(els, {
            opacity: 1,
            y: 0,
            duration: motion.isMobile ? 0.42 : 0.7,
            stagger: motion.stagger,
            ease: motion.ease,
            overwrite: true,
            onComplete: () => gsap.set(els, { clearProps: "willChange" }),
          });
        },
        onLeaveBack: (els) => {
          gsap.set(els, { willChange: "transform,opacity" });
          gsap.to(els, {
            opacity: 0,
            y: motion.isMobile ? 28 : 50,
            duration: motion.isMobile ? 0.28 : 0.4,
            stagger: motion.cardStagger,
            ease: "power2.in",
            overwrite: true,
            onComplete: () => gsap.set(els, { clearProps: "willChange" }),
          });
        },
      });
    },
    [],
  );

  return (
    <div
      ref={sectionRef}
      id="portfolio"
      className="bg-gradient-to-b from-black to-gray-800 w-full text-white pb-20 select-none"
    >
      <div className="max-w-screen-lg p-4 pt-20 mx-auto flex flex-col justify-center w-full h-full">
        <div className="pb-0 sm:pb-2 portfolio-heading">
          <span className="relative inline-block">
            <p className="text-4xl 2xl:text-5xl font-bold inline z-10">
              Portfolio
            </p>
            <span
              aria-hidden
              className="portfolio-heading-underline absolute left-0 -bottom-1 h-1 w-full origin-left bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded"
              style={{ transform: "scaleX(0)" }}
            />
          </span>
          <p className="py-6 z-10 portfolio-sub">
            Check out some of my personal projects :
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 px-12 sm:px-12">
          {portfolios.map((portfolio) => (
            <PortfolioItem key={portfolio.id} {...portfolio} />
          ))}
        </div>
      </div>
    </div>
  );
});

export default Portfolio;
