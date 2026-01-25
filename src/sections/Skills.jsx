import { useRef } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { skillCategories } from "../constants";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const Skills = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const categoryRefs = useRef([]);

  useGSAP(() => {
    // Animate header
    gsap.fromTo(
      headerRef.current,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 85%",
        },
      }
    );

    // Animate each category
    categoryRefs.current.forEach((cat) => {
      if (!cat) return;

      const title = cat.querySelector(".category-title");
      const skills = cat.querySelectorAll(".skill-badge");

      gsap.fromTo(
        title,
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cat,
            start: "top 85%",
          },
        }
      );

      gsap.fromTo(
        skills,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: cat,
            start: "top 80%",
          },
        }
      );
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="min-h-screen bg-black py-20"
    >
      {/* Simple Inline Header */}
      <div ref={headerRef} className="px-10 mb-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-sm font-light tracking-[0.5rem] uppercase text-white/40 mb-4">
              Stacks I Ship With
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-white">
              Technical <span className="text-teal">Skills</span>
            </h2>
          </div>
          <p className="text-base md:text-lg text-white/50 max-w-md md:text-right leading-relaxed">
            Pragmatic stack spanning languages, frameworks, tooling, and data
            layers.
          </p>
        </div>
        <div className="w-full h-px bg-white/10 mt-10" />
      </div>

      {/* Skills Grid by Category */}
      <div className="px-10 space-y-14">
        {skillCategories.map((category, catIndex) => (
          <div
            key={category.title}
            ref={(el) => (categoryRefs.current[catIndex] = el)}
          >
            {/* Category Header */}
            <div className="category-title flex items-baseline gap-4 mb-6">
              <span className="text-teal text-sm font-mono">
                0{catIndex + 1}
              </span>
              <h3 className="text-xl md:text-2xl text-white font-light">
                {category.title}
              </h3>
              <span className="text-white/30 text-sm hidden md:block">
                — {category.subtitle}
              </span>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {category.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="skill-badge group flex items-center gap-3 p-3
                    bg-white/5 rounded-xl border border-white/10
                    hover:bg-teal/10 hover:border-teal/30
                    transition-all duration-300 cursor-default"
                >
                  <div
                    className="w-9 h-9 rounded-lg bg-black/60
                    flex items-center justify-center shrink-0
                    group-hover:bg-teal/20 transition-colors duration-300"
                  >
                    <Icon
                      icon={skill.icon}
                      className={`w-5 h-5 ${
                        skill.iconClassName ?? "text-white/80"
                      } group-hover:text-teal transition-colors duration-300`}
                    />
                  </div>
                  <span
                    className="text-sm font-light text-white/80
                    group-hover:text-white transition-colors duration-300"
                  >
                    {skill.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
