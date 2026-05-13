import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import { memo, useLayoutEffect, useRef, type CSSProperties } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination } from "swiper/modules";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { is3XLorLarger, isMobile } from "../utils";
import { prefersReducedMotion } from "../utils/motion";
import certifications from "../data/certificatesData";

gsap.registerPlugin(ScrollTrigger);

const swiperStyle = {
  "--swiper-pagination-bullet-size": "10px",
  "--swiper-pagination-bullet-horizontal-gap": "15px",
} as CSSProperties;

const Certifications = memo(() => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        defaults: { ease: "power3.out", force3D: true },
      });

      tl.from(".cert-heading", { y: 30, opacity: 0, duration: 0.6 })
        .fromTo(
          ".cert-heading-underline",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.7, ease: "power2.inOut" },
          "-=0.3",
        )
        .from(".cert-sub", { y: 20, opacity: 0, duration: 0.5 }, "-=0.4")
        .from(
          ".cert-swiper",
          { y: 60, opacity: 0, scale: 0.95, duration: 0.9 },
          "-=0.3",
        )
        .from(".cert-caption", { y: 16, opacity: 0, duration: 0.4 }, "-=0.4");
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="bg-gradient-to-b from-black to-black w-full  pb-22 pt-0 select-none"
    >
      <div
        id="certifications"
        className="max-w-screen-lg pt-24 mx-auto p-4  flex flex-col justify-center w-full h-full text-white md:pt-20"
      >
        <div className="cert-heading">
          <span className="relative inline-block">
            <p className="text-4xl 2xl:text-5xl font-bold inline">
              Certifications
            </p>
            <span
              aria-hidden
              className="cert-heading-underline absolute left-0 -bottom-1 h-1 w-full origin-left bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded"
              style={{ transform: "scaleX(0)" }}
            />
          </span>
          <p className="py-6 md:py-6 pb-12 cert-sub">
            These are some of the certifications I have obtained from Udemy:
          </p>
        </div>

        <div className="w-full 2xl:min-w-96 cert-swiper">
          <Swiper
            effect={"coverflow"}
            pagination={{ clickable: true }}
            grabCursor={true}
            centeredSlides
            style={swiperStyle}
            slidesPerView={isMobile || is3XLorLarger() ? 1.15 : 2}
            coverflowEffect={{
              rotate: 30,
              stretch: 100,
              depth: 500,
              modifier: 1,
            }}
            modules={[EffectCoverflow, Pagination]}
          >
            {certifications?.map(({ id, img, src, title }) => (
              <SwiperSlide
                key={id}
                onClick={() => window.open(src, "_blank")}
                className="p-4 flex justify-center items-center"
                style={{ cursor: "pointer" }}
                role="link"
                aria-label={`View certificate for ${title}`}
              >
                <img src={img} alt={title} loading="lazy" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <p className="text-gray-400 py-4 max-w-2xl z-10 mx-auto text-center cert-caption">
          Click on the image to view the certificate.
        </p>
      </div>
    </div>
  );
});

export default Certifications;
