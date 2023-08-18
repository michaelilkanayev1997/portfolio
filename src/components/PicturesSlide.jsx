import React from "react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const PicturesSlide = ({ backdrops }) => {
  return (
    <Swiper
      modules={[Pagination, Navigation]}
      pagination={{ clickable: true }}
      navigation={true}
      grabCursor={true}
      spaceBetween={20}
      slidesPerView={1.25}
      centeredSlides
      style={{
        "--swiper-pagination-bullet-size": "10px",
        "--swiper-pagination-bullet-horizontal-gap": "15px",
        "--swiper-pagination-bottom": "-7px",
      }}
    >
      {[...backdrops].splice(0, 10).map((item, index) => (
        <SwiperSlide key={index}>
          <a
            key={index}
            href={item.big}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={item.lower}
              alt={`_${index}`}
              className="w-full h-auto sm:h-[250px] md:h-[350px] lg:h-[400px] xl:h-[499px] cursor-pointer"
              loading="lazy"
            />
          </a>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default PicturesSlide;
