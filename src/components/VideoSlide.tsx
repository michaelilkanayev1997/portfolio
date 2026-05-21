import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { memo, useCallback, useState, type CSSProperties } from "react";
import type { Swiper as SwiperType } from "swiper";
import { A11y, Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

interface VideoSlideProps {
  videos: string[];
}

const swiperStyle = {
  "--swiper-pagination-bullet-size": "10px",
  "--swiper-pagination-bullet-horizontal-gap": "15px",
  "--swiper-pagination-bottom": "-7px",
} as CSSProperties;

const VideoSlide = ({ videos }: VideoSlideProps) => {
  const [loadedVideos, setLoadedVideos] = useState(() => new Set([0]));

  const loadVideo = useCallback(
    (activeIndex: number) => {
      setLoadedVideos((current) => {
        const next = new Set(current);

        if (activeIndex >= 0 && activeIndex < videos.length) {
          next.add(activeIndex);
        }

        return next.size === current.size ? current : next;
      });
    },
    [videos.length],
  );

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      loadVideo(swiper.activeIndex);
    },
    [loadVideo],
  );

  const shouldLoadVideo = useCallback(
    (index: number) => loadedVideos.has(index),
    [loadedVideos],
  );

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
      onSlideChange={handleSlideChange}
      style={swiperStyle}
    >
      {[...videos].splice(0, 5).map((item, index) => (
        <SwiperSlide key={index}>
          {shouldLoadVideo(index) ? (
            <iframe
              title="video"
              width="100%"
              className="w-full h-[180px] sm:h-[255px] md:h-[325px] lg:h-[510px] xl:h-[505px] z-10"
              src={item}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            ></iframe>
          ) : (
            <div className="w-full h-[180px] sm:h-[255px] md:h-[325px] lg:h-[510px] xl:h-[505px]" />
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default memo(VideoSlide);
