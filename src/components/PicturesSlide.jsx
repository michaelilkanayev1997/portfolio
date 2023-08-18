import React from "react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

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
      loop
      style={{
        "--swiper-pagination-color": "#FFBA08",
        "--swiper-pagination-bullet-inactive-color": "white",
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
              className="w-full h-auto cursor-pointer"
              loading="lazy"
            />
          </a>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default PicturesSlide;
