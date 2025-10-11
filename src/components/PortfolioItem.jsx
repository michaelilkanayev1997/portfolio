import { Fragment, memo } from "react";
import { Link } from "react-router-dom";

const PortfolioItem = memo(({ id, src, title, techs }) => (
  <div className="shadow-md shadow-gray-600 rounded-lg duration-150 hover:scale-105 z-10">
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
    <Link to={`/projectdetails/${id}`}>
      <div className="flex items-center justify-center">
        <button className="rounded-md font-semibold tracking-wide transform w-full px-6 py-2 m-1 sm:m-4 duration-200 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white hover:text-white hover:scale-105 hover:shadow-md">
          <span className="sr-only">Learn more about {title} project</span>
          Read More
        </button>
      </div>
    </Link>
  </div>
));

export default PortfolioItem;
