import { memo, type RefObject } from "react";
import { Cursor, useTypewriter } from "react-simple-typewriter";

interface HeroTypewriterProps {
  headingRef: RefObject<HTMLHeadingElement | null>;
}

const HeroTypewriter = ({ headingRef }: HeroTypewriterProps) => {
  const [typeEffect] = useTypewriter({
    words: ["Software Developer", "Full Stack Developer", "Software Engineer"],
    loop: 0,
    typeSpeed: 150,
    deleteSpeed: 40,
    delaySpeed: 2000,
  });

  return (
    <h2
      ref={headingRef}
      className="pt-11 text-4xl sm:text-7xl font-bold text-white z-10 max-w-[35rem] sm:min-w-[35rem] xl:min-w-[35rem] 3xl:min-w-[35rem] min-h-[8rem] md:min-h-[12rem]"
    >
      I'm a <span className="text-blue-400"> {typeEffect}</span>
      <Cursor />
    </h2>
  );
};

export default memo(HeroTypewriter);
