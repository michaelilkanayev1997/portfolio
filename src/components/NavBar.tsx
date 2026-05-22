import { type Dispatch, type SetStateAction, memo, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-scroll";
import { useLocation, Link as RouterLink } from "react-router-dom";

import { links } from "../data/navBarData";

interface NavBarProps {
  nav: boolean;
  setNav: Dispatch<SetStateAction<boolean>>;
}

const NavBar = ({ nav, setNav }: NavBarProps) => {
  const location = useLocation();

  const isProjectDetails = location.pathname.startsWith("/projectdetails");

  useEffect(() => {
    if (isProjectDetails && nav) setNav(false);
  }, [isProjectDetails, nav, setNav]);

  useEffect(() => {
    if (!nav) return;

    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
    };
  }, [nav]);

  return (
    <div className="fixed left-0 top-0 z-50 flex h-20 w-full select-none items-center justify-between bg-black px-4 text-white">
      <div>
        {isProjectDetails ? (
          <RouterLink to="/">
            <h1 className="lg:text-5xl text-3xl font-signature ml-2 cursor-pointer">
              Michael Ilkanayev
            </h1>
          </RouterLink>
        ) : (
          <Link to="home" href="#home" duration={0} className="cursor-pointer">
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
              <Link to={link} href={`#${link}`} duration={0}>
                {link}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!isProjectDetails && (
        <button
          type="button"
          onClick={() => setNav((isOpen) => !isOpen)}
          className="relative z-50 cursor-pointer p-3 pr-4 text-gray-400 md:hidden"
          aria-label={nav ? "Close navigation" : "Open navigation"}
          aria-expanded={nav}
        >
          {nav ? <FaTimes size={30} /> : <FaBars size={30} />}
        </button>
      )}

      {nav && (
        <ul
          className="fixed inset-0 z-40 flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-black to-gray-800 text-gray-400 overscroll-none md:hidden"
        >
          {links.map(({ id, link }) => (
            <li
              key={id}
              className="px-4 cursor-pointer capitalize py-6 text-4xl"
            >
              <Link
                onClick={() => setNav(false)}
                to={link}
                href={`#${link}`}
                duration={0}
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
