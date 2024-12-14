import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ScrollTrigger } from "gsap/all";
import gsap from "gsap";

import Home from "../components/Home";
import About from "../components/About";
import Portfolio from "../components/Portfolio";
import Experience from "../components/Experience";
import Contact from "../components/Contact";
import SocialLinks from "../components/SocialLinks";
import Certifications from "../components/Certifications";

gsap.registerPlugin(ScrollTrigger);
const HomePage = () => {
  return (
    <>
      <ToastContainer />
      <div>
        <Home />
        <About />
        <Certifications />
        <Portfolio />
        <Experience />
        <Contact />
        <SocialLinks />
      </div>
    </>
  );
};

export default HomePage;
