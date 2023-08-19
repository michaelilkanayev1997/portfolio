import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NavBar from "./components/NavBar";
import ParticlesContainer from "./components/ParticlesContainer";
import React, { lazy, Suspense } from "react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/keyboard";
import "swiper/css/a11y";
import "swiper/css/effect-coverflow";

const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));

// Custom loading component
const Loading = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "black",
      color: "white",
      fontSize: "1.2rem",
    }}
  >
    <h1>Loading...</h1>
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
