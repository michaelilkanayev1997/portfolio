import { memo, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { ulText } from "../data/aboutData";
import { prefersReducedMotion } from "../utils/motion";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out", force3D: true },
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      tl.from(".about-heading", { y: 30, opacity: 0, duration: 0.7 })
        .fromTo(
          ".about-heading-underline",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.7, ease: "power2.inOut" },
          "-=0.4"
        )
        .from(".about-intro", { y: 30, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(".about-lead", { y: 20, opacity: 0, duration: 0.5 }, "-=0.3")
        .from(
          ".about-item",
          {
            y: 24,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
          },
          "-=0.2"
        );

      // Glow orb that drifts with scroll
      gsap.to(".about-orb", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      id="about"
      ref={containerRef}
      className="relative w-full h-screen bg-gradient-to-b from-gray-800 to-black text-white select-none overflow-hidden"
    >
      <div
        aria-hidden
        className="about-orb pointer-events-none absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-cyan-500/10 blur-3xl"
      />
      <div className="max-w-screen-lg 3xl:max-w-screen-xl p-4 pt-24 sm:pt-0 mx-auto flex flex-col justify-center w-full h-full relative z-10">
        <div className="md:pb-6 sm:pb-6 pb-2 about-heading">
          <span className="relative inline-block">
            <p className="text-4xl 2xl:text-5xl font-bold inline">About Me</p>
            <span
              aria-hidden
              className="about-heading-underline absolute left-0 -bottom-1 h-1 w-full origin-left bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded"
              style={{ transform: "scaleX(0)" }}
            />
          </span>
        </div>
        <div className="text-xl md:mt-5 mt-0 about-intro">
          <p>
            Hello there! My name is Michael, a Software Engineering graduate
            from SCE - Sami Shamoon College of Engineering.
          </p>
        </div>

        <div className="text-lg sm:text-xl mt-4 sm:mt-6">
          <div className="flex items-center sm:mb-4 about-lead">
            <p>Let me share a bit about myself </p>
            <span className="text-2xl ml-2 leading-none font-bold">:</span>
          </div>

          {ulText.map((item, index) => (
            <ul key={index} className="list-none pl-1.5 md:pl-6 mt-2">
              <li className="about-item mb-4 flex items-start">
                <svg
                  className="w-5 h-5 mr-2 text-cyan-500 flex-shrink-0 md:w-6 md:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-base md:text-lg">{item.text}</p>
              </li>
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(About);
