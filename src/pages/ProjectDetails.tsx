import { useRef } from "react";
import { useParams } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import PicturesSlide from "../components/PicturesSlide";
import VideoSlide from "../components/VideoSlide";
import Error from "../components/Error";
import ProjectSection from "../components/ProjectSection";
import portfolios from "../data/projectDetailsData";
import { useDeferredGsap } from "../hooks/useDeferredGsap";
import { getRevealMotion } from "../utils/motion";

gsap.registerPlugin(ScrollTrigger);

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const pageRef = useRef<HTMLDivElement>(null);

  useDeferredGsap(
    pageRef,
    () => {
      const motion = getRevealMotion();
      const tl = gsap.timeline({
        defaults: { ease: motion.ease, force3D: true },
      });

      // Hero block: title drops in, underline draws, intro fades up
      tl.from(".pd-title", {
        y: -motion.largeDistance,
        opacity: 0,
        duration: motion.isMobile ? 0.5 : 0.75,
      })
        .fromTo(
          ".pd-title-underline",
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: motion.underlineDuration,
            ease: "power2.inOut",
          },
          "-=0.3",
        )
        .from(
          ".pd-intro",
          {
            y: motion.distance,
            opacity: 0,
            duration: motion.isMobile ? 0.42 : 0.65,
          },
          "-=0.4",
        );

      // Action buttons at the bottom of the page
      gsap.from(".pd-action-btn", {
        y: motion.distance,
        opacity: 0,
        duration: motion.shortDuration,
        stagger: motion.stagger,
        ease: "back.out(1.35)",
        immediateRender: false,
        scrollTrigger: {
          trigger: ".pd-actions",
          start: motion.isMobile ? "top 94%" : "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    },
    [id],
  );

  const project = portfolios.find((p) => p.id === Number(id));

  if (!project || !project.details) {
    return <Error />;
  }

  const { title } = project;
  const {
    download,
    demo,
    git,
    introduction,
    pictures,
    secondText,
    secondTitle,
    thirdText,
    thirdTitle,
    videos,
  } = project.details;

  return (
    <div
      ref={pageRef}
      className="w-full min-h-screen bg-gradient-to-b from-black to-gray-800 text-white select-none"
    >
      <div className="w-full max-w-screen-lg p-4 pt-24 sm:pt-0 mx-auto flex flex-col justify-center">
        <div className="text-xl sm:mt-24 mt-0 mx-auto text-center">
          {/* Title */}
          <div className="mb-2">
            <span className="relative inline-block">
              <p className="pd-title text-3xl md:text-5xl font-bold inline-flex z-10">
                {title}
              </p>
              <span
                aria-hidden
                className="pd-title-underline absolute left-0 -bottom-1 h-[3px] w-full origin-left bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded"
                style={{ transform: "scaleX(0)" }}
              />
            </span>
          </div>

          {/* Introduction */}
          <p className="pd-intro text-lg sm:text-xl py-6 z-10 mx-auto text-center">
            {introduction}
          </p>

          {pictures?.length > 0 && (
            <ProjectSection title="Images">
              <div className="max-w-xs sm:max-w-md md:max-w-xl lg:max-w-4xl mx-auto z-10">
                <PicturesSlide backdrops={pictures} title={title} />
              </div>
              <p className="text-gray-500 py-4 max-w-2xl z-10 mx-auto text-center">
                Click on the images to view them more closely.
              </p>
            </ProjectSection>
          )}

          {secondTitle && (
            <ProjectSection title={secondTitle}>
              <p className="text-lg sm:text-xl z-10 text-left">{secondText}</p>
            </ProjectSection>
          )}

          {thirdTitle && (
            <ProjectSection title={thirdTitle}>
              <p className="text-lg sm:text-xl z-10 whitespace-pre-wrap text-left">
                {thirdText}
              </p>
            </ProjectSection>
          )}

          {videos && videos.length > 0 && (
            <ProjectSection title="Videos">
              <div className="max-w-xs sm:max-w-md md:max-w-xl lg:max-w-4xl mx-auto z-10">
                <VideoSlide videos={videos} />
              </div>
            </ProjectSection>
          )}

          <div className="pd-actions flex justify-center space-x-8 pt-8 pb-8">
            {(demo || download) && (
              <a
                href={download ?? demo}
                target="_blank"
                rel="noopener noreferrer"
                className="pd-action-btn z-10 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out w-1/2 sm:w-1/5 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,0.4)]"
              >
                {download ? "Download" : "Demo"}
              </a>
            )}

            {git && (
              <a
                href={git}
                target="_blank"
                rel="noopener noreferrer"
                className="pd-action-btn z-10 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out w-1/2 sm:w-1/5 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,184,166,0.4)]"
              >
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
