import React from "react";
import gameofdeath from "../assets/portfolio/GameOfDeath.png";
import scemoviesocial from "../assets/portfolio/SceMovieSocial.png";
import crwnclothing from "../assets/portfolio/CrwnClothing.png";
import travelagency from "../assets/portfolio/TravelAgency.png";
import gatsbyblog from "../assets/portfolio/Gatsbyblog.png";
import passwordmanager from "../assets/portfolio/PasswordManager.png";

const Portfolio = () => {
  const portfolios = [
    {
      id: 1,
      src: scemoviesocial,
      title: "SCE-MOVIE-SOCIAL",
      techs: ["React", "Context", "styled", "Firebase", "TMDB's api"],
    },
    {
      id: 2,
      src: crwnclothing,
      title: "Crwn-Clothing",
      techs: ["React", "Redux", "GraphQl", "Firebase", "Stripe api"],
    },
    {
      id: 3,
      src: gameofdeath,
      title: "Game-Of-Death",
      techs: ["Unreal-Engine 5", "C++", "BluePrints"],
    },
    {
      id: 4,
      src: travelagency,
      title: "Travel-Agency",
      techs: ["React", "styled", "Firebase", "PayPal api"],
    },
    {
      id: 5,
      src: gatsbyblog,
      title: "Gatsby-blog",
      techs: ["Gatsby", "React", "styled", "GraphQl"],
    },
    {
      id: 6,
      src: passwordmanager,
      title: "Password-Manager",
      techs: ["Java", "GUI", "AES encryption", "Excel"],
    },
  ];

  return (
    <div
      name="portfolio"
      className="bg-gradient-to-b from-black to-gray-800 w-full text-white ms:h-screen pb-20"
    >
      <div className="max-w-screen-lg p-4 pt-20 mx-auto flex flex-col justify-center w-full h-full">
        <div className="pb-0 sm:pb-2 ">
          <p className="text-4xl font-bold inline border-b-4 border-gray-500 z-10">
            Portfolio
          </p>
          <p className="py-6 z-10">Check out some of my work :</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 px-12 sm:px-12">
          {portfolios.map(({ id, src, title, techs }) => (
            <div
              key={id}
              className="shadow-md shadow-gray-600 rounded-lg duration-200 hover:scale-105 z-10"
            >
              <img
                src={src}
                alt=""
                className="w-full h-36 object-cover rounded-md"
              />
              <p className="text-lg font-bold border-b-4 border-gray-500 py-2 flex justify-center items-center">
                {title}
              </p>
              <div className="p-4">
                <div className="flex flex-wrap gap-2 overflow-x-auto">
                  {techs.map((tech, index) => (
                    <>
                      <span
                        key={index}
                        className=" text-gray-300 duration-200 hover:scale-90"
                      >
                        {tech}
                      </span>
                      |
                    </>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center">
                <button className="rounded-md font-semibold tracking-wide transform w-full px-6 py-2 m-1 sm:m-4 duration-200 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white hover:text-white hover:scale-105 hover:shadow-md">
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
