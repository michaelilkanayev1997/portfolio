import { useCallback, useEffect, useRef, memo, useState } from "react";
import { HiChevronDoubleRight } from "react-icons/hi";
import { Link } from "react-scroll";
import gsap from "gsap";

import whatsapp from "../assets/svg/whatsapp.svg";
import linkedin from "../assets/svg/linkedin.svg";
import github from "../assets/svg/github.svg";
import phone from "../assets/svg/phone.svg";
import { isiPhone } from "../utils";
import { getRevealMotion, prefersReducedMotion } from "../utils/motion";
import HeroTypewriter from "./HeroTypewriter";
import PhysicsPortrait from "./PhysicsPortrait";

const Home = () => {
  const [portraitSource, setPortraitSource] = useState(() =>
    window.matchMedia("(max-width: 640px)").matches
      ? "/mobileHeroImage.webp"
      : "/heroImage.webp",
  );
  const [portraitReady, setPortraitReady] = useState(false);
  const main = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const buttonGroupRef = useRef<HTMLDivElement>(null);
  const linkGroupRef = useRef<HTMLDivElement>(null);
  const typeEffectRef = useRef<HTMLHeadingElement>(null);
  const handlePortraitReady = useCallback(() => {
    setPortraitReady(true);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const updateSource = () =>
      setPortraitSource(
        query.matches ? "/mobileHeroImage.webp" : "/heroImage.webp",
      );
    query.addEventListener("change", updateSource);
    return () => query.removeEventListener("change", updateSource);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const motion = getRevealMotion();
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: motion.largeDistance },
        {
          opacity: 1,
          y: 0,
          duration: motion.isMobile ? 0.45 : 1,
          delay: motion.isMobile ? 0.2 : 0.6,
          ease: motion.ease,
          scrollTrigger: {
            trigger: textRef.current,
            toggleActions: "restart reverse restart reverse",
            start: motion.start,
          },
        },
      );

      gsap.fromTo(
        buttonGroupRef.current,
        { opacity: 0, y: motion.largeDistance },
        {
          opacity: 1,
          y: 0,
          duration: motion.isMobile ? 0.45 : 1,
          delay: motion.isMobile ? 0.35 : 1.3,
          ease: motion.ease,
          scrollTrigger: {
            trigger: buttonGroupRef.current,
            toggleActions: "restart reverse restart reverse",
            start: motion.start,
          },
        },
      );
      gsap.fromTo(
        linkGroupRef.current,
        { opacity: 0, scale: motion.isMobile ? 0.82 : 0.1 },
        {
          ease: motion.ease,
          opacity: 1,
          scale: 1,
          duration: motion.isMobile ? 0.38 : 0.8,
          delay: motion.isMobile ? 0.35 : 1.3,
          scrollTrigger: {
            trigger: linkGroupRef.current,
          },
        },
      );
      gsap.fromTo(
        typeEffectRef.current,
        {
          opacity: 0,
          scale: motion.isMobile ? 0.9 : 0.5,
          y: motion.isMobile ? -40 : -100,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: motion.isMobile ? 0.55 : 1.2,
          ease: motion.ease,
        },
      );
    }, main);

    return () => ctx.revert();
  }, []);

  return (
    <div
      id="home"
      ref={main}
      className={`min-h-screen w-full bg-gradient-to-b from-black via-black to-gray-800 select-none supports-[height:100svh]:min-h-svh md:h-screen ${
        isiPhone() ? "pt-14" : ""
      }`}
    >
      <div className="max-w-screen-lg 3xl:max-w-screen-xl mx-auto flex min-h-screen flex-col items-center justify-center px-4 supports-[height:100svh]:min-h-svh md:h-full md:min-h-0 md:flex-row">
        <div className="flex flex-col justify-center md:h-full">
          <HeroTypewriter headingRef={typeEffectRef} />

          <p
            className="text-gray-400 text-sm sm:text-lg py-4 max-w-md z-10 font-bold"
            ref={textRef}
          >
            Hey, <span className="text-white font-semibold">I'm Michael!</span>{" "}
            👋
            <br />I specialize in&nbsp;
            <span className="text-white font-bold">
              React, React Native, Angular, Node.js, Express, MongoDB, Firebase,
              JavaScript, TypeScript, Python
            </span>
            .<br />
            <span className="text-white font-semibold">
              Dive in & check out my work!
            </span>
          </p>

          <div>
            <div className="flex flex-row space-x-6" ref={buttonGroupRef}>
              <Link
                to="portfolio"
                href=""
                smooth
                duration={500}
                data-magnetic
                data-ripple
                className="group text-white w-fit px-6 py-3 my-2 flex items-center
             rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 cursor-pointer z-10"
              >
                Portfolio
                <span className="group-hover:rotate-90 duration-300">
                  <HiChevronDoubleRight size={25} className="ml-1" />
                </span>
              </Link>

              <Link
                to="about"
                href=""
                smooth
                duration={500}
                data-magnetic
                data-ripple
                className="group text-white w-fit px-6 py-3 my-2 flex items-center
             rounded-md bg-gradient-to-r from-indigo-600 to-blue-400 cursor-pointer z-10"
              >
                About Me
                <span className="group-hover:rotate-90 duration-300">
                  <HiChevronDoubleRight size={25} className="ml-1" />
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div
          className="flex flex-row gap-10 items-center justify-center mb-4 sm:hidden"
          ref={linkGroupRef}
        >
          <a
            href="https://www.linkedin.com/in/michael-ilkanayev/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 transition duration-300 transform hover:scale-110 z-10"
            aria-label="My LinkedIn profile"
          >
            <img
              src={linkedin}
              alt="linkedin"
              width={50}
              height={50}
              loading="lazy"
              decoding="async"
            />
          </a>
          <a
            href="https://github.com/michaelilkanayev1997"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 transition duration-300 transform hover:scale-110 z-10"
            aria-label="My Github profile"
          >
            <img
              src={github}
              alt="github"
              width={45}
              height={45}
              loading="lazy"
              decoding="async"
            />
          </a>
          <a
            href="tel:972546132140"
            className="p-2 transition duration-300 transform hover:scale-110 z-10"
            aria-label="My phone number"
          >
            <img
              src={phone}
              alt="phone"
              width={37}
              height={37}
              loading="lazy"
              decoding="async"
            />
          </a>
          <a
            href="https://api.whatsapp.com/send?phone=972546132140"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 transition duration-300 transform hover:scale-110 z-10"
            aria-label="My Whatsapp"
          >
            <img
              src={whatsapp}
              alt="whatsapp"
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
            />
          </a>
        </div>

        <div
          className={`hero-portrait-stage relative w-1/2 3xl:max-w-2xl 2xl:max-w-xl xl:max-w-sm lg:max-w-xs md:w-2/3 md:max-w-44 ${
            portraitReady ? "hero-portrait-stage--ready" : ""
          }`}
        >
          <span className="hero-portrait-stage__halo" aria-hidden />
          <PhysicsPortrait
            src={portraitSource}
            alt="Michael Ilkanayev"
            onReady={handlePortraitReady}
          />
          <div className="hero-portrait-stage__plinth" aria-hidden />
        </div>
      </div>
    </div>
  );
};

export default memo(Home);
