import { useState, memo } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-scroll";
import { useLocation } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";

import { links } from "../data/navBarData";

const NavBar = () => {
  const location = useLocation();
  const [nav, setNav] = useState(false);

  // Check if the location starts with /projectdetails
  const isProjectDetails = location.pathname.startsWith("/projectdetails");

  return (
    <div className="flex justify-between z-20 items-center w-full h-20 px-4 text-white bg-black fixed select-none">
      <div>
        {isProjectDetails ? (
          <RouterLink to="/">
            <h1 className="lg:text-5xl text-3xl font-signature ml-2 cursor-pointer">
              Michael Ilkanayev
            </h1>
          </RouterLink>
        ) : (
          <Link to="home" smooth duration={500} className="cursor-pointer">
            <h1 className="lg:text-5xl text-3xl font-signature ml-2">
              Michael Ilkanayev
            </h1>
          </Link>
        )}
      </div>

      {isProjectDetails ? (
        <ul className="flex">
          <li className="text-xl px-4 cursor-pointer capitalize font-medium text-gray-400 hover:text-gray-300 hover:scale-105 duration-200">
            <RouterLink to={"/"}>Home</RouterLink>
          </li>
        </ul>
      ) : (
        <ul className="hidden md:flex">
          {links.map(({ id, link }) => (
            <li
              key={id}
              className="px-4 cursor-pointer capitalize font-medium text-gray-400 hover:text-gray-300 hover:scale-105 duration-200"
            >
              <Link to={link} href="" smooth duration={500}>
                {link}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!isProjectDetails && (
        <button
          type="button"
          onClick={() => setNav(!nav)}
          className="cursor-pointer p-3 pr-4 z-10 text-gray-400 md:hidden"
          aria-label={nav ? "Close navigation" : "Open navigation"}
        >
          {nav ? <FaTimes size={30} /> : <FaBars size={30} />}
        </button>
      )}

      {nav && (
        <ul
          className="flex flex-col justify-center items-center absolute top-0 left-0 w-full h-screen 
      bg-gradient-to-b from-black to-gray-800 text-gray-400"
        >
          {links.map(({ id, link }) => (
            <li
              key={id}
              className="px-4 cursor-pointer capitalize py-6 text-4xl"
            >
              <Link
                onClick={() => setNav(!nav)}
                to={link}
                smooth
                duration={700}
              >
                {link}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default memo(NavBar);
