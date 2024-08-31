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
      {[...backdrops].splice(0, 20).map((item, index) => (
        <SwiperSlide key={index}>
          <a
            key={index}
            href={item.big}
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center"
          >
            <img
              src={item.lower}
              alt={`_${index}`}
              className="h-auto sm:h-[250px] md:h-[350px] lg:h-[400px] xl:h-[499px] cursor-pointer"
            />
          </a>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default PicturesSlide;
