import React, { useEffect, useState } from "react";
import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import ServiceSummary from "./sections/ServiceSummary";
import Services from "./sections/Services";
import ReactLenis from "lenis/react";
import About from "./sections/About";
import Skills from "./sections/Skills";
import Experience from "./sections/Experience";
import Works from "./sections/Works";
import CompanyProjects from "./sections/CompanyProjects";
import NpmPackages from "./sections/NpmPackages";
import Contact from "./sections/Contact";
import { useProgress } from "@react-three/drei";
import { useMediaQuery } from "react-responsive";

const App = () => {
  const { progress } = useProgress();
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // On mobile the 3D model never loads, so don't wait for its progress
    if (progress === 100 || isMobile) {
      setIsReady(true);
    }
  }, [progress, isMobile]);

  return (
    <ReactLenis root className="relative w-screen min-h-screen overflow-x-auto">
      {!isReady && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black text-white transition-opacity duration-700 font-light">
          <p className="mb-4 text-xl tracking-widest animate-pulse">
            Loading {Math.floor(progress)}%
          </p>
          <div className="relative h-1 overflow-hidden rounded w-60 bg-white/20">
            <div
              className="absolute top-0 left-0 h-full transition-all duration-300 bg-white"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      <div
        className={`${
          isReady ? "opacity-100" : "opacity-0"
        } transition-opacity duration-1000`}
      >
        <Navbar />
        <Hero />
        <ServiceSummary />
        <Services />
        <Skills />
        <About />
        <Experience />
        <CompanyProjects />
        <Works />
        <NpmPackages />
        <Contact />
      </div>
    </ReactLenis>
  );
};

export default App;
