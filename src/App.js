import { Routes, Route } from "react-router-dom";
import ProjectDetails from "./pages/ProjectDetails";
import HomePage from "./pages/HomePage";
import NavBar from "./components/NavBar";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/keyboard";
import "swiper/css/a11y";

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="projectdetails" element={<ProjectDetails />} />
      </Routes>
    </>
  );
}

export default App;
