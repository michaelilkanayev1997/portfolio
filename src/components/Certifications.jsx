import { memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination } from "swiper/modules";

import { is3XLorLarger, isMobile } from "../utils";
import certifications from "../data/certificatesData";

const Certifications = memo(() => {
  return (
    <div className="bg-gradient-to-b from-black to-black w-full  pb-22 pt-0 select-none">
      <div
        name="certifications"
        className="max-w-screen-lg pt-24 mx-auto p-4  flex flex-col justify-center w-full h-full text-white md:pt-20"
      >
        <div>
          <p className="text-4xl 2xl:text-5xl font-bold border-b-4 border-gray-500 p-2 inline">
            Certifications
          </p>
          <p className="py-6 md:py-6 pb-12">
            These are some of the certifications I have obtained from Udemy:
          </p>
        </div>

        <div className="w-full 2xl:min-w-96">
          <Swiper
            effect={"coverflow"}
            pagination={{ clickable: true }}
            grabCursor={true}
            centeredSlides
            style={{
              "--swiper-pagination-bullet-size": "10px",
              "--swiper-pagination-bullet-horizontal-gap": "15px",
            }}
            slidesPerView={isMobile || is3XLorLarger() ? 1.15 : 2}
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 500,
              modifier: 1,
            }}
            modules={[EffectCoverflow, Pagination]}
          >
            {certifications?.map(({ id, img, src, title }) => (
              <SwiperSlide key={id}>
                <a
                  key={id}
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={img} alt={title} loading="lazy" />
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <p className="text-gray-400 py-4 max-w-2xl z-10 mx-auto text-center">
          Click on the image to view the certificate.
        </p>
      </div>
    </div>
  );
});

export default Certifications;
