import { memo, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import skills from "../data/experienceData";

gsap.registerPlugin(ScrollTrigger);

const Experience = memo(() => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const skillLevels = gsap.utils.toArray(".skill-level");

      skillLevels.forEach((level) => {
        const width = level.dataset.level;
        gsap.fromTo(
          level,
          { width: 0 },
          {
            width: width,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
              trigger: level,
              start: "top 90%",
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      name="experience"
      className="bg-gradient-to-b from-gray-800 to-black w-full min-h-screen py-20 select-none"
    >
      <div className="max-w-screen-lg mx-auto p-4 flex flex-col justify-center w-full h-full text-white">
        <div>
          <p className="text-4xl 2xl:text-5xl font-bold border-b-4 border-gray-500 p-2 inline">
            Skills
          </p>
          <p className="py-4 md:py-6">
            These are some of the technologies I've worked with :
          </p>
        </div>

        <div ref={containerRef} className="space-y-12">
          {Object.entries(skills).map(([category, skillList]) => (
            <div key={category}>
              <h3 className="text-2xl font-bold mb-6 text-center">
                {category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {skillList.map(({ id, src, title, style, level }) => (
                  <div key={id} className={`p-4 rounded-lg shadow-md ${style}`}>
                    <div className="flex items-center mb-2">
                      <img src={src} alt={title} className="w-10 h-10 mr-4" />
                      <p className="font-semibold">{title}</p>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div
                        className="skill-level bg-gradient-to-r from-cyan-500 to-blue-500 h-4 rounded-full"
                        data-level={level}
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
