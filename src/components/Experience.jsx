import { memo } from "react";

import techs from "./../experienceData";

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
                // loading="lazy"
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
