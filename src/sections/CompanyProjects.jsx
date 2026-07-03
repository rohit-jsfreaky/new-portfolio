import { Icon } from "@iconify/react/dist/iconify.js";
import { companyProjects } from "../constants";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const CompanyProjects = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardRefs = useRef([]);

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

    cardRefs.current.filter(Boolean).forEach((card) => {
      gsap.fromTo(
        card,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        }
      );
    });
  }, [sectionRef, cardRefs]);

  return (
    <section
      ref={sectionRef}
      id="company-projects"
      className="min-h-screen bg-black py-20"
    >
      {/* Header */}
      <div className="px-10 mb-16">
        <div ref={titleRef} className="space-y-4">
          <p className="text-sm font-light tracking-[0.5rem] uppercase text-gold/80 mb-4">
            Professional Work
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl text-white font-light">
            Company <span className="text-gold italic">Projects</span>
          </h2>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl leading-relaxed">
            Production systems I've built and scaled for real businesses —
            shipped to real users, running in production today.
          </p>
        </div>
      </div>

      {/* Project Cards */}
      <div className="px-6 md:px-10 space-y-10">
        {companyProjects.map((project, index) => (
          <div
            key={project.id}
            ref={(el) => (cardRefs.current[index] = el)}
            className={`group relative flex flex-col ${
              index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
            } bg-gradient-to-b from-white/5 to-white/0
              border border-white/10 rounded-3xl overflow-hidden
              hover:border-gold/50 transition-all duration-500
              hover:shadow-2xl hover:shadow-gold/10`}
          >
            {/* Image */}
            <div
              className="relative lg:w-1/2 min-h-[280px] md:min-h-[380px] overflow-hidden
                flex items-center justify-center p-6 md:p-10 pt-16 md:pt-20"
            >
              {/* Background Texture */}
              <img
                src={project.bgImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/85" />

              {/* Screenshot - full, uncropped */}
              <img
                src={project.image}
                alt={project.name}
                className="relative max-h-[240px] md:max-h-[340px] lg:max-h-[420px]
                  w-auto max-w-full object-contain
                  rounded-xl border border-white/10 shadow-2xl shadow-black/50
                  transition-transform duration-700 ease-out
                  group-hover:scale-[1.03]"
              />

              {/* Company Badge */}
              <span
                className="absolute top-5 left-5 px-4 py-2
                  bg-gold text-black text-xs uppercase tracking-wider rounded-full
                  font-medium"
              >
                Built at {project.company}
              </span>
            </div>

            {/* Content */}
            <div className="lg:w-1/2 p-6 md:p-10 flex flex-col justify-center space-y-6">
              <div>
                <p className="text-sm text-gold/80 font-medium uppercase tracking-wide mb-2">
                  {project.role}
                </p>
                <h3 className="text-3xl md:text-4xl lg:text-5xl text-white font-light">
                  {project.name}
                </h3>
              </div>

              <p className="text-base md:text-lg text-white/60 leading-relaxed">
                {project.description}
              </p>

              {/* Contributions */}
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-white/40">
                  What I Built
                </p>
                <ul className="space-y-2">
                  {project.contributions.map((contribution, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-white/70 flex items-start gap-3 leading-relaxed"
                    >
                      <span className="text-gold mt-0.5 flex-shrink-0">▹</span>
                      <span>{contribution}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
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
              </div>

              {/* Live Link */}
              {project.liveLink && (
                <div className="pt-2">
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2
                      px-6 py-3 bg-gradient-to-r from-gold/20 to-amber-600/20
                      text-gold rounded-xl border border-gold/30
                      hover:from-gold hover:to-amber-600 hover:text-black
                      transition-all duration-300"
                  >
                    <span className="text-sm font-medium">View Live</span>
                    <Icon icon="lucide:arrow-up-right" className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Accent */}
      <div className="mt-16 px-10">
        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>
    </section>
  );
};

export default CompanyProjects;
