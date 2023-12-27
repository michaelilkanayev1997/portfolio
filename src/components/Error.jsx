import { Link } from "react-router-dom";
import { FaExclamationCircle } from "react-icons/fa";

const Error = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-black to-gray-800 text-white select-none">
      <FaExclamationCircle className="text-7xl text-red-500 mb-4 z-10" />
      <h1 className="text-4xl font-bold mb-2 z-10">
        Oops! Something went wrong.
      </h1>
      <p className="text-lg text-gray-400 text-center mb-6 z-10">
        The content you are looking for is not available.
      </p>
      <Link
        to="/"
        className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out z-10"
      >
        Go back to Home Page
      </Link>
    </div>
  );
};

export default Error;
