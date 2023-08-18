import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination } from "swiper/modules";

const certifications = [
  {
    id: 1,
    img: "https://udemy-certificate.s3.amazonaws.com/image/UC-631fb29d-5cbb-4ca5-a8de-6745b4b57284.jpg?v=1691858982000",
    src: "https://www.udemy.com/certificate/UC-631fb29d-5cbb-4ca5-a8de-6745b4b57284/",
  },
  {
    id: 2,
    img: "https://udemy-certificate.s3.amazonaws.com/image/UC-2ba67ac7-fcbd-49fe-8628-8d54ff0037c1.jpg?v=1691423164000",
    src: "https://www.udemy.com/certificate/UC-2ba67ac7-fcbd-49fe-8628-8d54ff0037c1/",
  },
  {
    id: 3,
    img: "https://udemy-certificate.s3.amazonaws.com/image/UC-45c1f880-d0f4-47d7-ba80-6b72780ea5c6.jpg?v=1664539516000",
    src: "https://www.udemy.com/certificate/UC-45c1f880-d0f4-47d7-ba80-6b72780ea5c6/",
  },
];

const Certifications = () => {
  const isMobile = window.innerWidth <= 768;

  return (
    <div className="bg-gradient-to-b from-black to-black w-full  pb-22 pt-0 select-none">
      <div
        name="certifications"
        className="max-w-screen-lg pt-24 mx-auto p-4  flex flex-col justify-center w-full h-full text-white md:pt-20"
      >
        <div>
          <p className="text-4xl font-bold border-b-4 border-gray-500 p-2 inline">
            Certifications
          </p>
          <p className="py-6 md:py-6 pb-12">
            These are some of the certifications I have obtained from Udemy:
          </p>
        </div>

        <div className="w-full">
          <Swiper
            effect={"coverflow"}
            pagination={{ clickable: true }}
            grabCursor={true}
            centeredSlides
            style={{
              "--swiper-pagination-bullet-size": "10px",
              "--swiper-pagination-bullet-horizontal-gap": "15px",
            }}
            slidesPerView={isMobile ? 1.15 : 2}
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 500,
              modifier: 1,
            }}
            modules={[EffectCoverflow, Pagination]}
            className="mySwiper"
          >
            {certifications?.map(({ id, img, src }) => (
              <SwiperSlide key={id}>
                <a
                  key={id}
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={img} alt="" />
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
};

export default Certifications;
