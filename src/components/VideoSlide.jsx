import React, { useRef } from "react";
import { Navigation, Pagination, Keyboard, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css/keyboard";
import "swiper/css/a11y";

const VideoSlide = ({ videos }) => {
  return (
    <>
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
          "--swiper-pagination-bullet-inactive-color": "#999999",
          "--swiper-pagination-bullet-size": "10px",
        }}
      >
        {videos?.map((url, i) => (
          <SwiperSlide key={i}>
            <Video key={i} url={url} />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

const Video = (props) => {
  const url = props.url;

  const iframeRef = useRef(null);

  return (
    <div
      className="video"
      style={{ padding: "40px", paddingTop: "0", paddingBottom: "0%" }}
    >
      <div className="video__title"></div>
      <iframe
        className="w-full h-auto sm:h-[315px] md:h-[420px] lg:h-[560px] xl:h-[640px]"
        src={url}
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default VideoSlide;
