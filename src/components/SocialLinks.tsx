import { useEffect, useRef, memo } from "react";
import gsap from "gsap";

import { links } from "../data/socialLinksData";
import { prefersReducedMotion } from "../utils/motion";

const SocialLinks = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion()) return;
    gsap.fromTo(
      containerRef.current,
      { x: "-200px", opacity: 0 },
      {
        x: "0",
        opacity: 1,
        duration: 1,
        ease: "back.out",
      }
    );
  }, []);

  return (
    <div
      className="hidden xl:flex flex-col top-[35%] left-0 fixed select-none"
      ref={containerRef}
    >
      <ul>
        {links.map(({ id, child, href, style }) => (
          <li
            key={id}
            className={
              "flex justify-between items-center w-40 h-14 px-4 ml-[-100px] hover:ml-[-10px] hover:rounded-md duration-300 bg-gray-500" +
              " " +
              (style ?? "")
            }
          >
            <a
              href={href}
              className="flex justify-between items-center w-full text-white"
              download={false}
              target="_blank"
              rel="noreferrer"
            >
              {child}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default memo(SocialLinks);
