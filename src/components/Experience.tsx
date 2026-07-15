import { memo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import skills from "../data/experienceData";
import { useDeferredGsap } from "../hooks/useDeferredGsap";
import { getRevealMotion } from "../utils/motion";

gsap.registerPlugin(ScrollTrigger);

const Experience = memo(() => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useDeferredGsap(
    sectionRef,
    () => {
      const motion = getRevealMotion();
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".skills-heading",
          start: motion.headingStart,
          toggleActions: "play none none reverse",
        },
        defaults: { ease: motion.ease, force3D: true },
      });
      tl.from(".skills-heading", {
        y: motion.distance,
        opacity: 0,
        duration: motion.duration,
      })
        .fromTo(
          ".skills-heading-underline",
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: motion.underlineDuration,
            ease: "power2.inOut",
          },
          "-=0.3",
        )
        .from(
          ".skills-sub",
          {
            y: motion.isMobile ? 14 : 20,
            opacity: 0,
            duration: motion.shortDuration,
          },
          "-=0.4",
        );

      gsap.utils.toArray<HTMLElement>(".skill-category").forEach((cat) => {
        gsap.from(cat.querySelector(".skill-category-title"), {
          y: motion.isMobile ? 16 : 24,
          opacity: 0,
          duration: motion.duration,
          ease: motion.ease,
          scrollTrigger: {
            trigger: cat,
            start: motion.start,
            toggleActions: "play none none reverse",
          },
        });
      });

      gsap.set(".skill-card", {
        opacity: 0,
        y: motion.distance,
        scale: motion.scale,
      });
      ScrollTrigger.batch(".skill-card", {
        start: motion.isMobile ? "top 94%" : "top 90%",
        batchMax: motion.isMobile ? 4 : 6,
        interval: 0.08,
        onEnter: (els) => {
          gsap.set(els, { willChange: "transform,opacity" });
          gsap.to(els, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: motion.duration,
            stagger: motion.cardStagger,
            ease: motion.ease,
            overwrite: true,
            onComplete: () => gsap.set(els, { clearProps: "willChange" }),
          });
        },
        onLeaveBack: (els) => {
          gsap.set(els, { willChange: "transform,opacity" });
          gsap.to(els, {
            opacity: 0,
            y: motion.distance,
            scale: motion.scale,
            duration: motion.isMobile ? 0.28 : 0.4,
            stagger: motion.cardStagger,
            ease: "power2.in",
            overwrite: true,
            onComplete: () => gsap.set(els, { clearProps: "willChange" }),
          });
        },
      });

      gsap.utils.toArray<HTMLDivElement>(".skill-level").forEach((level) => {
        gsap.fromTo(
          level,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: motion.isMobile ? 0.65 : 1.1,
            ease: motion.ease,
            scrollTrigger: {
              trigger: level,
              start: motion.isMobile ? "top 95%" : "top 92%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    },
    [],
  );

  return (
    <div
      id="experience"
      ref={sectionRef}
      className="bg-gradient-to-b from-gray-800 to-black w-full min-h-screen py-20 select-none"
    >
      <div className="max-w-screen-lg mx-auto p-4 flex flex-col justify-center w-full h-full text-white">
        <div className="skills-heading">
          <span className="relative inline-block">
            <p className="text-4xl 2xl:text-5xl font-bold inline">Skills</p>
            <span
              aria-hidden
              className="skills-heading-underline absolute left-0 -bottom-1 h-1 w-full origin-left bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded"
              style={{ transform: "scaleX(0)" }}
            />
          </span>
          <p className="py-4 md:py-6 skills-sub">
            These are some of the technologies I've worked with :
          </p>
        </div>

        <div className="space-y-12">
          {Object.entries(skills).map(([category, skillList]) => (
            <div key={category} className="skill-category">
              <h3 className="skill-category-title text-2xl sm:text-3xl font-bold mb-6 text-center">
                {category}
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:gap-8">
                {skillList.map(({ id, src, title, style, level }) => (
                  <div
                    key={id}
                    className={`skill-card p-2 sm:p-4 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-cyan-500/20 hover:shadow-lg ${style}`}
                  >
                    <div className="flex items-center mb-2">
                      <img
                        src={src}
                        alt={title}
                        className="w-6 h-6 sm:w-10 sm:h-10 mr-2 sm:mr-4"
                        loading="lazy"
                        decoding="async"
                      />
                      <p className="font-semibold text-sm sm:text-lg">
                        {title}
                      </p>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 sm:h-4 overflow-hidden">
                      <div
                        className="skill-level bg-gradient-to-r from-cyan-500 to-blue-500 h-3 sm:h-4 rounded-full origin-left"
                        data-level={level}
                        style={{ width: level }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default Experience;
