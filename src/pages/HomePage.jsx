import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "../components/Home";
import About from "../components/About";
import Portfolio from "../components/Portfolio";
import Experience from "../components/Experience";
import Contact from "../components/Contact";
import SocialLinks from "../components/SocialLinks";
import Certifications from "../components/Certifications";
import portfolios from "../portfolioData";

const HomePage = () => {
  return (
    <>
      <ToastContainer />
      <div>
        <Home />
        <About />
        <Certifications />
        <Portfolio portfolios={portfolios} />
        <Experience />
        <Contact />
        <SocialLinks />
      </div>
    </>
  );
};

export default HomePage;
