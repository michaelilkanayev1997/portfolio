import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PicturesSlide from "../components/PicturesSlide";
import VideoSlide from "../components/VideoSlide";

const ProjectDetails = () => {
  const location = useLocation();
  const {
    download,
    demo,
    git,
    introduction,
    pictures,
    secondText,
    secondTitle,
    thirdText,
    thirdTitle,
    videos,
  } = location.state.project;
  const { title } = location.state.title;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full h-full bg-gradient-to-b  from-black  to-gray-800 text-white select-none">
      <div className="w-full h-full max-w-screen-lg p-4 pt-24 sm:pt-0 mx-auto flex flex-col justify-center">
        <div className="text-xl sm:mt-24 mt-0 mx-auto text-center">
          <p className="text-3xl md:text-5xl font-bold border-b-4 border-gray-500 inline-flex z-10">
            {title}
          </p>
          <p className="text-lg sm:text-xl text-white-500 py-4 z-10 mx-auto text-center">
            {introduction}
          </p>

          {pictures?.length > 0 && (
            <>
              <h2 className="text-yellow-100 text-2xl sm:text-3xl font-bold mt-4 mb-4 border-b-4 border-gray-500 inline-flex z-10">
                Images
              </h2>
              <div className="max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-5xl mx-auto flex items-center z-10">
                <PicturesSlide backdrops={pictures} />
              </div>
            </>
          )}

          <p className="text-gray-500 py-4 max-w-2xl z-10 mx-auto text-center">
            Click on the images to view them more closely.
          </p>

          {secondTitle && (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold mt-8 mb-4 border-b-4 border-gray-500 inline-flex z-10">
                {secondTitle}
              </h2>
              <p className="text-lg sm:text-xl z-10">{secondText}</p>
            </>
          )}

          {thirdTitle && (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold mt-8 mb-4 border-b-4 border-gray-500 inline-flex z-10">
                {thirdTitle}
              </h2>
              <p className="text-lg sm:text-xl z-10 whitespace-break-spaces">
                {thirdText}
              </p>
            </>
          )}

          {videos?.length > 0 && (
            <>
              <h2 className="text-yellow-100 text-2xl sm:text-3xl font-bold mt-8 mb-4 border-b-4 border-gray-500 inline-flex z-10">
                Videos
              </h2>

              <div className="max-w-xs sm:max-w-md md:max-w-xl lg:max-w-4xl mx-auto z-10">
                <VideoSlide videos={videos} />
              </div>
            </>
          )}

          <div className="flex justify-center space-x-8 pt-8 pb-8">
            {(demo || download) && (
              <a
                href={download ? download : demo}
                target="_blank"
                rel="noopener noreferrer"
                className="z-10 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out w-1/2 sm:w-1/5"
              >
                {download ? "Download" : "Demo"}
              </a>
            )}

            <a
              href={git}
              target="_blank"
              rel="noopener noreferrer"
              className="z-10 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out w-1/2 sm:w-1/5"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
