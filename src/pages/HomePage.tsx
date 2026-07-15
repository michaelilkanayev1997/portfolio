import { lazy, Suspense, useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

import Home from "../components/Home";
import About from "../components/About";
import Portfolio from "../components/Portfolio";
import Experience from "../components/Experience";
import Contact from "../components/Contact";
import SocialLinks from "../components/SocialLinks";
import Certifications from "../components/Certifications";

gsap.registerPlugin(ScrollTrigger);

const ToastContainer = lazy(() =>
  import("react-toastify").then((m) => ({ default: m.ToastContainer })),
);

const HomePage = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const idleId = w.requestIdleCallback(() => setHydrated(true), {
        timeout: 3000,
      });
      return () => w.cancelIdleCallback?.(idleId);
    }
    const timeoutId = window.setTimeout(() => setHydrated(true), 1500);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <>
      {hydrated && (
        <Suspense fallback={null}>
          <ToastContainer />
        </Suspense>
      )}
      <main>
        <Home />
        <About />
        <Certifications />
        <Portfolio />
        <Experience />
        <Contact />
        <SocialLinks />
      </main>
    </>
  );
};

export default HomePage;
