import { Icon } from "@iconify/react/dist/iconify.js";
import { npmPackages } from "../constants";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const NpmPackages = () => {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const cardRefs = useRef([]);
  const titleRef = useRef(null);

  useGSAP(() => {
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    }

    if (cardRefs.current.length > 0) {
      gsap.fromTo(
        cardRefs.current.filter(Boolean),
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
          },
        }
      );
    }
  }, [sectionRef, gridRef, cardRefs]);

  return (
    <section
      ref={sectionRef}
      id="npm-packages"
      className="min-h-screen bg-black py-20"
    >
      {/* Header */}
      <div className="px-10 mb-16">
        <div ref={titleRef} className="space-y-4">
          <p className="text-sm font-light tracking-[0.5rem] uppercase text-gold/80 mb-4">
            Open Source
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl text-white font-light">
            NPM <span className="text-gold italic">Packages</span>
          </h2>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl leading-relaxed">
            Production-ready tools I've built to solve real developer problems.
            From zero-config error handling to atomic rate limiting.
          </p>
        </div>
      </div>

      {/* Packages Grid - Horizontal Scroll on Mobile, Grid on Desktop */}
      <div
        ref={gridRef}
        className="px-6 md:px-10 relative overflow-x-auto md:overflow-x-visible pb-8 md:pb-0
          scrollbar-visible scrollbar-thin scrollbar-thumb-gold/40 scrollbar-track-white/5"
      >
        {/* Scroll Indicator - Mobile Only */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 z-10 md:hidden
          flex items-center justify-center w-10 h-10
          bg-black/80 backdrop-blur-sm rounded-full
          border border-gold/30 animate-pulse">
          <Icon icon="lucide:chevron-right" className="w-5 h-5 text-gold" />
        </div>

        {/* Swipe Hint - Mobile Only */}
        <div className="md:hidden absolute bottom-4 right-10 flex items-center gap-2 text-white/40 text-xs">
          <Icon icon="lucide:hand" className="w-4 h-4 animate-pulse" />
          <span>Swipe to see more</span>
        </div>

        <div className="flex md:grid flex-row md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 min-w-max md:min-w-0">
          {npmPackages.map((pkg, index) => (
            <div
              key={pkg.id}
              ref={(el) => (cardRefs.current[index] = el)}
              className="group relative w-80 md:w-auto flex-shrink-0 opacity-100
                bg-gradient-to-b from-white/5 to-white/0
                border border-white/10 rounded-3xl overflow-hidden
                hover:border-gold/50 transition-all duration-500
                hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold/10"
            >
              {/* Package Image with Gradient Overlay */}
              <div className="relative h-48 md:h-56 overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="w-full h-full object-cover object-center
                    transition-transform duration-700 ease-out
                    group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/90" />

                

                {/* Emoji Badge
                <div className="absolute bottom-4 right-4 w-14 h-14
                  bg-gradient-to-br from-gold to-amber-600
                  rounded-2xl flex items-center justify-center
                  text-2xl shadow-lg shadow-gold/30
                  transform group-hover:rotate-12 group-hover:scale-110
                  transition-all duration-300">
                  {pkg.emoji}
                </div> */}
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-xl md:text-2xl text-white font-light">
                      {pkg.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gold/80 font-medium uppercase tracking-wide">
                    {pkg.tagline}
                  </p>
                </div>

                {/* Problem Statement */}
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-white/40">
                    The Problem
                  </p>
                  <p className="text-sm text-white/60 leading-relaxed line-clamp-2">
                    {pkg.problem}
                  </p>
                </div>

                {/* Solution */}
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-white/40">
                    The Solution
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed line-clamp-2">
                    {pkg.solution}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-white/40">
                    Key Features
                  </p>
                  <ul className="space-y-1">
                    {pkg.features.slice(0, 2).map((feature, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-white/60 flex items-start gap-2"
                      >
                        <span className="text-gold mt-0.5">•</span>
                        <span>{feature.split(" - ")[0]}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {pkg.techStack.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 text-xs
                        bg-white/5 text-white/70 rounded-lg
                        border border-white/10
                        hover:bg-gold/20 hover:text-gold
                        hover:border-gold/30 transition-all duration-300"
                    >
                      {tech}
                    </span>
                  ))}
                  {pkg.techStack.length > 3 && (
                    <span className="px-2.5 py-1 text-xs bg-teal/20 text-teal rounded-lg">
                      +{pkg.techStack.length - 3}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  {pkg.githubLink && (
                    <a
                      href={pkg.githubLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2
                        px-4 py-2.5 bg-white/10 text-white rounded-xl
                        border border-white/10
                        hover:bg-white hover:text-black
                        hover:border-white transition-all duration-300"
                    >
                      <Icon icon="mdi:github" className="w-4 h-4" />
                      <span className="text-sm font-medium">GitHub</span>
                    </a>
                  )}
                  {pkg.npmLink && (
                    <a
                      href={pkg.npmLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2
                        px-4 py-2.5 bg-gradient-to-r from-gold/20 to-amber-600/20
                        text-gold rounded-xl border border-gold/30
                        hover:from-gold hover:to-amber-600 hover:text-black
                        transition-all duration-300"
                    >
                      <Icon icon="simple-icons:npm" className="w-4 h-4" />
                      <span className="text-sm font-medium">NPM</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="mt-16 px-10">
        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>
    </section>
  );
};

export default NpmPackages;