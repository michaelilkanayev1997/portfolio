import React from "react";
import { A11y, Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const VideoSlide = ({ videos }) => {
  return (
    <Swiper
      modules={[Keyboard, Pagination, Navigation, A11y]}
      navigation={true}
      pagination={{ clickable: true }}
      grabCursor={true}
      spaceBetween={0}
      slidesPerView={1}
      keyboard={{
        enabled: true,
      }}
      style={{
        "--swiper-pagination-color": "#FFBA08",
        "--swiper-pagination-bullet-inactive-color": "white",
        "--swiper-pagination-bullet-size": "10px",
        "--swiper-pagination-bullet-horizontal-gap": "15px",
        "--swiper-pagination-bottom": "-7px",
      }}
    >
      {[...videos].splice(0, 5).map((item, index) => (
        <SwiperSlide key={index}>
          <iframe
            title="video"
            width="100%"
            className="w-full h-[180px] sm:h-[255px] md:h-[325px] lg:h-[510px] xl:h-[505px] z-10"
            src={item}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default VideoSlide;
