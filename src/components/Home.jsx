import React from "react";
import HeroImage from "../assets/heroImage.png";
import { HiChevronDoubleRight } from "react-icons/hi";
import ParticlesContainer from "./ParticlesContainer";
import { Link } from "react-scroll";

const Home = () => {
  return (
    <div
      name="home"
      className="h-screen w-full bg-gradient-to-b from-black via-black to-gray-800 "
    >
      <ParticlesContainer />
      <div className="max-w-screen-lg mx-auto flex flex-col items-center justify-center h-full px-4 md:flex-row">
        <div className="flex flex-col justify-center h-full">
          <h2 className="pt-10 text-4xl sm:text-7xl font-bold text-white z-10">
            I'm a Full Stack Developer
          </h2>
          <p className="text-gray-500 py-4 max-w-md z-10">
            4rd-year Software Engineering student at SCE - Sami Shamoon College
            of Engineering Currently, I love to work on web applications using
            technologies like React, Styled-Components, Next JS and Firebase.
          </p>
          <div>
            <div className="flex flex-row space-x-6">
              <Link
                to="portfolio"
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

        <div className="z-10">
          <img
            src={HeroImage}
            alt="my profile"
            className="rounded-2xl mx-auto w-2/3 md:w-full translate-z-0 "
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
