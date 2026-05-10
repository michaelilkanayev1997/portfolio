import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import ReactGA from "react-ga4";

import NavBar from "./components/NavBar";
import ScrollProgress from "./components/ScrollProgress";

ReactGA.initialize(import.meta.env.VITE_GOOGLE_ANALYTICS);

const HomePage = lazy(() => import("./pages/HomePage"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const ParticlesContainer = lazy(
  () => import("./components/ParticlesContainer"),
);

const Loading = () => (
  <div className="pt-20 bg-black text-white h-screen">
    <LinearProgress />
  </div>
);

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  ReactGA.send({
    hitType: "pageview",
    page: window.location.pathname,
    title: window.location.pathname,
  });

  return (
    <>
      <Suspense>
        <ParticlesContainer />
      </Suspense>
      <ScrollProgress />
      <NavBar />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="projectdetails/:id" element={<ProjectDetails />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
