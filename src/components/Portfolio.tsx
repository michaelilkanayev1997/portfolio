import { memo, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import PortfolioItem from "./PortfolioItem";
import portfolios from "../data/portfolioData";
import { prefersReducedMotion } from "../utils/motion";

gsap.registerPlugin(ScrollTrigger);

const Portfolio = memo(() => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".portfolio-heading",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        defaults: { ease: "power3.out", force3D: true },
      });
      tl.from(".portfolio-heading", { y: 30, opacity: 0, duration: 0.6 })
        .fromTo(
          ".portfolio-heading-underline",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.7, ease: "power2.inOut" },
          "-=0.3",
        )
        .from(".portfolio-sub", { y: 20, opacity: 0, duration: 0.5 }, "-=0.4");

      gsap.set(".portfolio-card", { opacity: 0, y: 50 });

      ScrollTrigger.batch(".portfolio-card", {
        start: "top 88%",
        onEnter: (els) =>
          gsap.to(els, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: "power3.out",
            overwrite: true,
          }),
        onLeaveBack: (els) =>
          gsap.to(els, {
            opacity: 0,
            y: 50,
            duration: 0.4,
            stagger: 0.06,
            ease: "power2.in",
            overwrite: true,
          }),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      id="portfolio"
      className="bg-gradient-to-b from-black to-gray-800 w-full text-white ms:h-screen pb-20 select-none"
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
