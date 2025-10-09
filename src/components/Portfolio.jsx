import { memo } from "react";

import PortfolioItem from "./PortfolioItem";
import portfolios from "./../data/portfolioData";

const Portfolio = memo(() => {
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
          <p className="py-6 z-10">Check out some of my personal projects :</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 px-12 sm:px-12">
          {portfolios.map((portfolio) => (
            <PortfolioItem key={portfolio.id} {...portfolio} />
          ))}
        </div>
      </div>
    </div>
  );
});

export default Portfolio;
