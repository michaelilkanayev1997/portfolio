import { useEffect, useRef, memo } from "react";
import { HiChevronDoubleRight } from "react-icons/hi";
import { Link } from "react-scroll";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import gsap from "gsap";

import whatsapp from "../assets/svg/whatsapp.svg";
import linkedin from "../assets/svg/linkedin.svg";
import github from "../assets/svg/github.svg";
import phone from "../assets/svg/phone.svg";
import { isiPhone, isMobile } from "../utils";

const Home = () => {
  const [typeEffect] = useTypewriter({
    words: ["Software Developer", "Full Stack Developer", "Software Engineer"],
    loop: {},
    typeSpeed: 150,
    deleteSpeed: 40,
    delaySpeed: 2000,
  });

  const main = useRef();
  const textRef = useRef();
  const imageRef = useRef();
  const buttonGroupRef = useRef();
  const linkGroupRef = useRef();
  const typeEffectRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, scale: 0.5, y: 50 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.5,
        }
      );

      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.6,
          scrollTrigger: {
            trigger: textRef.current,
            toggleActions: "restart reverse restart reverse",
            start: "top 85%",
          },
        }
      );

      gsap.fromTo(
        buttonGroupRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 1.3,
          scrollTrigger: {
            trigger: buttonGroupRef.current,
            toggleActions: "restart reverse restart reverse",
            start: "top 85%",
          },
        }
      );
      gsap.fromTo(
        linkGroupRef.current,
        { opacity: 0, scale: 0.1 },
        {
          ease: "power2.in",
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: 1.3,
          scrollTrigger: {
            trigger: linkGroupRef.current,
          },
        }
      );
      gsap.fromTo(
        typeEffectRef.current,
        { opacity: 0, scale: 0.5, y: -100 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.2,
        }
      );
      gsap.to(".g_grow", {
        scale: 1.05,
        opacity: 1,
        ease: "power1",
        scrollTrigger: {
          trigger: ".g_grow",
          toggleActions: "restart reverse restart reverse",
          start: "top 100%",
          scrub: 2, // Smooth animation with slower progress
        },
      });
    }, main);

    return () => ctx.revert();
  }, []);

  return (
    <div
      name="home"
      ref={main}
      className={`h-screen w-full bg-gradient-to-b from-black via-black to-gray-800 select-none ${
        isiPhone() && "pt-14"
      }`}
    >
      <div className="max-w-screen-lg 3xl:max-w-screen-xl mx-auto flex flex-col items-center justify-center h-full px-4 md:flex-row">
        <div className="flex flex-col justify-center h-full">
          <h2
            ref={typeEffectRef}
            className="pt-11 text-4xl sm:text-7xl font-bold text-white z-10 max-w-[35rem] sm:min-w-[35rem] xl:min-w-[35rem] 3xl:min-w-[35rem] min-h-[8rem] md:min-h-[12rem]"
          >
            I'm a <span className="text-blue-400"> {typeEffect}</span>
            <Cursor />
          </h2>

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
            <img src={linkedin} alt="linkedin" loading="lazy" />
          </a>
          <a
            href="https://github.com/michaelilkanayev1997"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 transition duration-300 transform hover:scale-110 z-10"
            aria-label="My Github profile"
          >
            <img src={github} alt="github" loading="lazy" />
          </a>
          <a
            href="tel:972546132140"
            className="p-2 transition duration-300 transform hover:scale-110 z-10"
            aria-label="My phone number"
          >
            <img src={phone} alt="phone" loading="lazy" />
          </a>
          <a
            href="https://api.whatsapp.com/send?phone=972546132140"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 transition duration-300 transform hover:scale-110 z-10"
            aria-label="My Whatsapp"
          >
            <img src={whatsapp} alt="whatsapp" loading="lazy" />
          </a>
        </div>

        <div
          className="relative 3xl:max-w-2xl 2xl:max-w-xl xl:max-w-sm lg:max-w-xs md:max-w-44 w-2/3"
          ref={imageRef}
        >
          <img
            src={isMobile ? "/mobileHeroImage.webp" : "/heroImage.webp"}
            alt="my profile"
            className="w-full h-full object-cover scale-75 g_grow"
            fetchpriority="high"
          />
          <div className="absolute -bottom-1 left-0 right-0 h-2 mx-5 bg-gradient-to-t from-white to-transparent blur-md" />
        </div>
      </div>
    </div>
  );
};

export default memo(Home);
