import { memo } from "react";

import html from "../assets/html.webp";
import css from "../assets/css.webp";
import javascript from "../assets/javascript.webp";
import reactImage from "../assets/react.webp";
import firebase from "../assets/firebase.webp";
import angular from "../assets/angular.webp";
import github from "../assets/github.webp";
import tailwind from "../assets/tailwind.webp";
import cplusplus from "../assets/cplusplus.webp";
import java from "../assets/java.webp";
import python from "../assets/python.webp";
import unrealengine from "../assets/unrealengine.webp";

const techs = [
  { id: 1, src: reactImage, title: "React", style: "shadow-cyan-500" },
  { id: 2, src: javascript, title: "JavaScript", style: "shadow-yellow-500" },
  { id: 3, src: firebase, title: "Firebase", style: "shadow-yellow-600" },
  { id: 4, src: github, title: "GitHub", style: "shadow-gray-400" },
  { id: 5, src: cplusplus, title: "C++", style: "shadow-blue-400" },
  {
    id: 6,
    src: python,
    title: "Python",
    style: "half-blue-half-yellow-shadow",
  },
  { id: 7, src: java, title: "Java", style: "shadow-orange-400" },
  { id: 8, src: angular, title: "Angular", style: "shadow-pink-400" },
  {
    id: 9,
    src: unrealengine,
    title: "Unreal Engine",
    style: "shadow-gray-400",
  },
  { id: 10, src: tailwind, title: "Tailwind", style: "shadow-sky-800" },
  { id: 11, src: html, title: "HTML", style: "shadow-orange-500" },
  { id: 12, src: css, title: "CSS", style: "shadow-blue-500" },
];

const Experience = memo(() => {
  return (
    <div
      name="experience"
      className="bg-gradient-to-b from-gray-800 to-black w-full h-screen min-h-screen  pb-20 pt-40 sm:pt-12 select-none"
    >
      <div className="max-w-screen-lg pt-32 mx-auto p-4 flex flex-col justify-center w-full h-full text-white">
        <div>
          <p className="text-4xl 2xl:text-5xl font-bold border-b-4 border-gray-500 p-2 inline">
            Experience
          </p>
          <p className="py-4 md:py-6">
            These are some of the technologies I've worked with :
          </p>
        </div>

        <div className="w-full grid grid-cols-3 sm:grid-cols-6 gap-6 sm:gap-8 text-center py-2 md:py-8 px-2 sm:px-0 2xl:grid-cols-4">
          {techs.map(({ id, src, title, style }) => (
            <div
              key={id}
              className={`shadow-md hover:scale-105 duration-500 py-1 sm:py-2 rounded-lg z-10 ${style}`}
            >
              <img
                src={src}
                alt={title}
                className="w-20 mx-auto"
                loading="lazy"
              />
              <p className="mt-4">{title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default Experience;
