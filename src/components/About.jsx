import { ulText } from "../data/aboutData";

const About = () => {
  return (
    <div
      name="about"
      className="w-full h-screen bg-gradient-to-b from-gray-800 to-black text-white select-none"
    >
      <div className="max-w-screen-lg 3xl:max-w-screen-xl p-4 pt-24 sm:pt-0 mx-auto flex flex-col justify-center w-full h-full">
        <div className="md:pb-6 sm:pb-6 pb-2 ">
          <p className="text-4xl 2xl:text-5xl font-bold inline border-b-4 border-gray-500">
            About Me
          </p>
        </div>
        <div className="text-xl md:mt-5 mt-0">
          <p>
            Hello there! My name is Michael, a Software Engineering graduate
            from SCE - Sami Shamoon College of Engineering.
          </p>
        </div>

        <div className="text-lg sm:text-xl mt-4 sm:mt-6">
          <div className="flex items-center sm:mb-4">
            <p>Let me share a bit about myself </p>
            <span className="text-2xl ml-2 leading-none font-bold">:</span>
          </div>

          {ulText.map((item, index) => (
            <ul key={index} className="list-none pl-1.5 md:pl-6 mt-2">
              <li className="mb-4 flex items-start">
                <svg
                  className="w-5 h-5 mr-2 text-cyan-500 flex-shrink-0 md:w-6 md:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-base md:text-lg">{item.text}</p>
              </li>
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
