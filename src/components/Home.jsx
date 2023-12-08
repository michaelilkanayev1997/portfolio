import React from "react";
import { HiChevronDoubleRight } from "react-icons/hi";
import { Link } from "react-scroll";
import whatsapp from "../assets/svg/whatsapp.svg";
import linkedin from "../assets/svg/linkedin.svg";
import github from "../assets/svg/github.svg";
import phone from "../assets/svg/phone.svg";
import HeroImage from "../assets/heroImage.webp";

const Home = () => {
  return (
    <div
      name="home"
      className="h-screen w-full bg-gradient-to-b from-black via-black to-gray-800 select-none"
    >
      <div className="max-w-screen-lg 3xl:max-w-screen-xl mx-auto flex flex-col items-center justify-center h-full px-4 md:flex-row">
        <div className="flex flex-col justify-center h-full">
          <h2 className="pt-10 text-4xl sm:text-7xl font-bold text-white z-10">
            I'm a Software Developer
          </h2>
          <p className="text-gray-500 text-sm sm:text-lg py-4 max-w-md z-10">
            4rd-year Software Engineering student at SCE - Sami Shamoon College
            of Engineering. Currently, I love to work on web applications using
            technologies like React, Node.js, Express, tailwind,
            Styled-Components and Firebase.
          </p>
          <div>
            <div className="flex flex-row space-x-6">
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
              <a
                href={"/Michael Ilkanayev CV.pdf"}
                download={false}
                target="_blank"
                rel="noreferrer"
                className="z-10"
              >
                <button
                  className="group text-white w-fit px-6 py-3 my-2 flex items-center
             rounded-md bg-gradient-to-r from-indigo-600 to-blue-400 cursor-pointer"
                >
                  Resume
                  <span className="group-hover:rotate-90 duration-300">
                    <HiChevronDoubleRight size={25} className="ml-1" />
                  </span>
                </button>
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-10 items-center justify-center mb-4 sm:hidden">
          <a
            href="https://www.linkedin.com/in/michael-ilkanayev/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition duration-300 transform hover:scale-110 z-10"
          >
            <img src={linkedin} alt="linkedin" loading="lazy" />
          </a>
          <a
            href="https://github.com/michaelilkanayev1997"
            target="_blank"
            rel="noopener noreferrer"
            className="transition duration-300 transform hover:scale-110 z-10"
          >
            <img src={github} alt="github" loading="lazy" />
          </a>
          <a
            href="tel:972546132140"
            className="transition duration-300 transform hover:scale-110 z-10"
          >
            <img src={phone} alt="phone" loading="lazy" />
          </a>
          <a
            href="https://api.whatsapp.com/send?phone=972546132140"
            target="_blank"
            rel="noopener noreferrer"
            className="transition duration-300 transform hover:scale-110 z-10"
          >
            <img src={whatsapp} alt="whatsapp" loading="lazy" />
          </a>
        </div>

        <div className="z-10 mx-auto w-2/3 sm:w-auto relative rounded-2xl">
          <img
            src={HeroImage}
            alt="my profile"
            className="rounded-2xl md:w-full translate-z-0"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
