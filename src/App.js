import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import ParticlesContainer from "./components/ParticlesContainer";
import React, { lazy, Suspense } from "react";
import LinearProgress from "@mui/material/LinearProgress";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/keyboard";
import "swiper/css/a11y";
import "swiper/css/effect-coverflow";

// Lazy Loading
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const HomePage = lazy(() => import("./pages/HomePage"));

// Custom loading component
const Loading = () => (
  <div className="pt-20 bg-black text-white h-screen">
    <LinearProgress />
  </div>
);

function App() {
  return (
    <>
      <ParticlesContainer />
      <NavBar />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="projectdetails" element={<ProjectDetails />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
