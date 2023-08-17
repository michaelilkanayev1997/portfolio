import React from "react";
import { useLocation } from "react-router-dom";
import PicturesSlide from "../components/PicturesSlide";

const ProjectDetails = () => {
  const location = useLocation();
  const project = location.state.project;

  return (
    <div className="w-full h-full bg-gradient-to-b  from-black  to-gray-800 text-white">
      <div className="w-full h-full max-w-screen-lg p-4 pt-24 sm:pt-0 mx-auto flex flex-col justify-center">
        <div className="text-xl md:mt-24 mt-0 mx-auto text-center">
          <p className="text-4xl font-bold border-b-4 border-gray-500 inline-flex z-10">
            Game-Of-Death
          </p>
          <p className="text-white-500 py-4 max-w-xl z-10 mx-auto text-center">
            "Game of Death" stands not only as a personal project but also as a
            testament to my journey of self-improvement as a software engineer.
            This large and immersive third-person game was built in Unreal
            Engine 5, with C++ and Blueprint scripting.
          </p>

          <p className="m-4 rounded-lg text-yellow-100 inline ">
            Pictures from the game:
          </p>

          {project?.pictures?.length > 0 && (
            <div className="max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-5xl mx-auto flex items-center z-10">
              <PicturesSlide backdrops={project?.pictures} />
            </div>
          )}

          <p className="text-gray-500 py-4 max-w-2xl z-10 mx-auto text-center">
            You can click on the images to zoom in.
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold mt-8 mb-4 border-b-4 border-gray-500 inline-flex">
            Crafting the Experience
          </h2>
          <p>
            Drawing inspiration from Bruce Lee's "Game of Death," I embarked on
            crafting an engaging gaming experience. The game features three
            progressively challenging stages, each presenting unique bosses and
            obstacles. Through rigorous learning and experimentation, I brought
            these levels to life, enhancing my problem-solving skills in the
            process.
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold mt-8 mb-4 border-b-4 border-gray-500 inline-flex">
            Skill Development
          </h2>
          <p>
            The project commenced as a self-taught endeavor. I dove into the
            world of Unreal Engine, C++ programming, and Blueprint scripting.
            Creating "Game of Death" served as an intense learning opportunity.
            I mastered programming with C++ in Visual Studio, implemented
            intricate logic through Blueprints, and fine-tuned graphical
            elements. This multifaceted skill development equipped me with a
            toolkit essential for tackling diverse development challenges.
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold mt-8 mb-4 border-b-4 border-gray-500 inline-flex">
            Building Unique Features
          </h2>
          <p>
            The project boasts diverse features, including enemies with random
            pickups, bosses with unique attacks, and character progression
            through collectibles. I incorporated health and stamina systems and
            coin-based upgrades, demonstrating my ability to merge creative
            storytelling with complex mechanics.
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold mt-8 mb-4 border-b-4 border-gray-500 inline-flex">
            Conclusion
          </h2>
          <p>
            "Game of Death" for me is more than a game; it's a narrative of
            personal evolution. Through traversing the landscapes of C++
            programming, software architecture, and creative problem-solving,
            I've unlocked a newfound proficiency. As the project reaches its
            conclusion, I'm left with not just a game but a skill set that
            empowers me to create innovative solutions and bring imaginative
            concepts to life in the realm of software development.
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold mt-8 mb-4 border-b-4 border-gray-500 inline-flex">
            Videos
          </h2>
          {/* <iframe
            title="video"
            className="w-full h-auto sm:h-[315px] md:h-[420px] lg:h-[560px] xl:h-[576px] z-10"
            src="https://www.youtube.com/embed/PMsAm4yWlOA"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe> */}
          <p className="mt-4">
            You can download the game for free at the following link:{" "}
            <a
              href="https://drive.google.com/file/d/1c6KBDMeUnWDJ3G6rZSkvV6xHV5xjscsN/view"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-500"
            >
              Download Game
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
