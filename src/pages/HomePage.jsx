import React from "react";
import Home from "../components/Home";
import About from "../components/About";
import Portfolio from "../components/Portfolio";
import Experience from "../components/Experience";
import Contact from "../components/Contact";
import SocialLinks from "../components/SocialLinks";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HomePage = () => {
  return (
    <>
      <ToastContainer />
      <div>
        <Home />
        <About />
        <Portfolio />
        <Experience />
        <Contact />

        <SocialLinks />
      </div>
    </>
  );
};

export default HomePage;
