import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import ReactGA from "react-ga4";

import NavBar from "./components/NavBar";
import ScrollProgress from "./components/ScrollProgress";
import DragonGuide from "./components/DragonGuide";
import Ilona from "./components/Ilona";

const GA_ID = import.meta.env.VITE_GOOGLE_ANALYTICS;
if (GA_ID) ReactGA.initialize(GA_ID);

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

const scheduleIdle = (cb: () => void) => {
  const w = window as Window & {
    requestIdleCallback?: (
      cb: () => void,
      opts?: { timeout: number },
    ) => number;
  };
  if (w.requestIdleCallback) w.requestIdleCallback(cb, { timeout: 2000 });
  else setTimeout(cb, 1200);
};

function App() {
  const { pathname } = useLocation();
  const [particlesReady, setParticlesReady] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    if (!GA_ID) return;
    ReactGA.send({
      hitType: "pageview",
      page: pathname,
      title: document.title,
    });
  }, [pathname]);

  useEffect(() => {
    if (import.meta.env.DEV) return;
    // Defer particle mount until browser is idle so it never competes with LCP.
    scheduleIdle(() => setParticlesReady(true));
  }, []);

  return (
    <>
      {(particlesReady || import.meta.env.DEV) && (
        <Suspense fallback={null}>
          <ParticlesContainer />
        </Suspense>
      )}
      <ScrollProgress forceFull={mobileMenuOpen} />
      <DragonGuide />
      <Ilona />
      <NavBar nav={mobileMenuOpen} setNav={setMobileMenuOpen} />
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
