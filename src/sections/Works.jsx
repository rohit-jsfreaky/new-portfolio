import { Icon } from "@iconify/react/dist/iconify.js";
import { projects } from "../constants";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const Works = () => {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const cardRefs = useRef([]);

  const featuredProject = projects[0];
  const otherProjects = projects.slice(1);

  useGSAP(() => {
    gsap.from(cardRefs.current, {
      y: 80,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: {
        trigger: gridRef.current,
        start: "top 85%",
      },
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="min-h-screen bg-primary py-20"
    >
      {/* Minimal Header */}
      <div className="px-10 mb-12">
        <p className="text-sm font-light tracking-[0.5rem] uppercase text-black/50 mb-4">
          Featured Work
        </p>
        <h2 className="text-4xl md:text-6xl lg:text-7xl text-black">
          Selected <span className="text-gold italic">Projects</span>
        </h2>
      </div>

      {/* Bento Grid */}
      <div
        ref={gridRef}
        className="px-6 md:px-10 grid gap-4 md:gap-6
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3"
      >
        {/* Featured Project - Full Width */}
        <div
          ref={(el) => (cardRefs.current[0] = el)}
          className="group relative col-span-1 md:col-span-2 lg:col-span-3
            rounded-2xl overflow-hidden cursor-pointer bg-black"
          onClick={() =>
            window.open(
              featuredProject.liveLink || featuredProject.githubLink,
              "_blank"
            )
          }
        >
          {/* Background Texture */}
          <div className="absolute inset-0">
            <img
              src={featuredProject.bgImage}
              alt=""
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/85" />
          </div>

          {/* Content */}
          <div className="relative p-6 md:p-10 pt-20 md:pt-24 flex flex-col gap-8">
            {/* Featured Badge */}
            <span
              className="absolute top-5 left-5 px-4 py-2
              bg-gold text-black text-xs uppercase tracking-wider rounded-full
              font-medium"
            >
              Featured Project
            </span>

            {/* Links */}
            <div className="absolute top-5 right-5 flex gap-3">
              {featuredProject.githubLink && (
                <a
                  href={featuredProject.githubLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm
                    flex items-center justify-center text-white
                    hover:bg-white hover:text-black transition-all duration-300"
                >
                  <Icon icon="mdi:github" className="w-5 h-5" />
                </a>
              )}
              {featuredProject.liveLink && (
                <a
                  href={featuredProject.liveLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-11 h-11 rounded-full bg-gold
                    flex items-center justify-center
                    hover:scale-110 transition-all duration-300"
                >
                  <Icon
                    icon="lucide:arrow-up-right"
                    className="w-5 h-5 text-black"
                  />
                </a>
              )}
            </div>

            {/* Project Screenshot - full, uncropped */}
            <div className="flex items-center justify-center">
              <img
                src={featuredProject.image}
                alt={featuredProject.name}
                className="max-h-[280px] md:max-h-[400px] lg:max-h-[460px]
                  w-auto max-w-full object-contain
                  rounded-xl border border-white/10 shadow-2xl shadow-black/50
                  transition-transform duration-700 ease-out
                  group-hover:scale-[1.02]"
              />
            </div>

            {/* Project Info */}
            <div className="space-y-4">
              <h3 className="text-3xl md:text-5xl lg:text-6xl text-white font-light">
                {featuredProject.name}
              </h3>
              <p className="text-base md:text-lg text-white/70 max-w-2xl leading-relaxed">
                {featuredProject.description}
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 pt-2">
                {featuredProject.frameworks.map((framework) => (
                  <span
                    key={framework.id}
                    className="px-3 py-1.5 bg-white/10 backdrop-blur-sm
                      text-white text-sm rounded-full
                      border border-white/20
                      hover:bg-teal hover:text-black hover:border-teal
                      transition-all duration-300"
                  >
                    {framework.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Other Projects Grid */}
        {otherProjects.map((project, index) => (
          <div
            key={project.id}
            ref={(el) => (cardRefs.current[index + 1] = el)}
            className="group relative rounded-2xl overflow-hidden cursor-pointer
              bg-black flex flex-col"
            onClick={() =>
              window.open(project.liveLink || project.githubLink, "_blank")
            }
          >
            {/* Background Texture */}
            <div className="absolute inset-0">
              <img
                src={project.bgImage}
                alt=""
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/85" />
            </div>

            {/* Content */}
            <div className="relative p-5 md:p-6 flex flex-col h-full">
              {/* Links */}
              <div className="flex justify-end gap-2 mb-3">
                {project.githubLink && (
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm
                      flex items-center justify-center text-white
                      hover:bg-white hover:text-black transition-all duration-300"
                  >
                    <Icon icon="mdi:github" className="w-4 h-4" />
                  </a>
                )}
                {project.liveLink && (
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-9 h-9 rounded-full bg-gold
                      flex items-center justify-center
                      hover:scale-110 transition-all duration-300"
                  >
                    <Icon
                      icon="lucide:arrow-up-right"
                      className="w-4 h-4 text-black"
                    />
                  </a>
                )}
              </div>

              {/* Project Screenshot - full, uncropped */}
              <div className="flex-1 flex items-center justify-center mb-4 min-h-[160px] md:min-h-[190px]">
                <img
                  src={project.image}
                  alt={project.name}
                  className="max-h-[160px] md:max-h-[190px]
                    w-auto max-w-full object-contain
                    rounded-lg border border-white/10 shadow-xl shadow-black/50
                    transition-transform duration-500 ease-out
                    group-hover:scale-105"
                />
              </div>

              {/* Project Name */}
              <h3 className="text-xl md:text-2xl text-white font-light mb-2">
                {project.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-white/70 line-clamp-2 mb-3">
                {project.description}
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-1.5">
                {project.frameworks.slice(0, 4).map((framework) => (
                  <span
                    key={framework.id}
                    className="px-2 py-1 bg-white/10 text-white text-xs rounded-full"
                  >
                    {framework.name}
                  </span>
                ))}
                {project.frameworks.length > 4 && (
                  <span className="px-2 py-1 bg-teal/20 text-teal text-xs rounded-full">
                    +{project.frameworks.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Works;
