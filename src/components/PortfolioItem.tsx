import { Fragment, memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";

import type { PortfolioSummary } from "../types";
import { canHover } from "../utils/motion";

const TILT_MAX = 8;

const PortfolioItem = memo(({ id, src, title, techs }: PortfolioSummary) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const supportsHover = useMemo(() => canHover(), []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    pointerRef.current = { x: e.clientX, y: e.clientY };
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (pointerRef.current.x - rect.left) / rect.width;
      const py = (pointerRef.current.y - rect.top) / rect.height;
      const rx = (0.5 - py) * TILT_MAX * 2;
      const ry = (px - 0.5) * TILT_MAX * 2;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
    });
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const onMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={supportsHover ? onMouseMove : undefined}
      onMouseLeave={supportsHover ? onMouseLeave : undefined}
      className="portfolio-card tilt-card relative shadow-md shadow-gray-600 rounded-lg z-10 bg-gray-900/30"
    >
      <div className="overflow-hidden rounded-t-md">
        <img
          src={src}
          alt={title}
          className="w-full h-36 object-cover transition-transform duration-500 ease-out hover:scale-110"
          loading="lazy"
          decoding="async"
        />
      </div>
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
          <button data-magnetic data-ripple className="rounded-md font-semibold tracking-wide transform w-full px-6 py-2 m-1 sm:m-4 duration-200 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white hover:text-white hover:scale-105 hover:shadow-md">
            <span className="sr-only">Learn more about {title} project</span>
            Read More
          </button>
        </div>
      </Link>
      <span aria-hidden className="tilt-shine" />
    </div>
  );
});

export default PortfolioItem;
