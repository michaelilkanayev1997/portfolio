import { Fragment, memo } from "react";
import { Link } from "react-router-dom";

const Portfolio = memo(({ portfolios }) => {
  return (
    <div
      name="portfolio"
      className="bg-gradient-to-b from-black to-gray-800 w-full text-white ms:h-screen pb-20 select-none"
    >
      <div className="max-w-screen-lg p-4 pt-20 mx-auto flex flex-col justify-center w-full h-full">
        <div className="pb-0 sm:pb-2 ">
          <p className="text-4xl 2xl:text-5xl font-bold inline border-b-4 border-gray-500 z-10">
            Portfolio
          </p>
          <p className="py-6 z-10">Check out some of my work :</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 px-12 sm:px-12">
          {portfolios.map(({ id, src, title, techs, details }) => (
            <div
              key={id}
              className="shadow-md shadow-gray-600 rounded-lg duration-150 hover:scale-105 z-10"
            >
              <img
                src={src}
                alt={title}
                className="w-full h-36 object-cover rounded-md"
                loading="lazy"
              />
              <p className="text-lg font-bold border-b-4 border-gray-500 py-2 flex justify-center items-center">
                {title}
              </p>
              <div className="p-4">
                <div className="flex flex-wrap gap-2 overflow-x-auto">
                  {techs.map((tech, index) => (
                    <Fragment key={index}>
                      <span className="text-gray-300 duration-200 hover:scale-90">
                        {tech}
                      </span>
                      {index < techs.length - 1 && " | "}{" "}
                    </Fragment>
                  ))}
                </div>
              </div>
              <Link
                to={"projectdetails"}
                state={{ project: details, title: { title } }}
              >
                <div className="flex items-center justify-center">
                  <button className="rounded-md font-semibold tracking-wide transform w-full px-6 py-2 m-1 sm:m-4 duration-200 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white hover:text-white hover:scale-105 hover:shadow-md">
                    <span className="sr-only">
                      Learn more about {title} project
                    </span>
                    Read More
                  </button>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default Portfolio;
