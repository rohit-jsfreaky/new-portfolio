import { useRef } from "react";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import { Icon } from "@iconify/react/dist/iconify.js";
import { skillCategories } from "../constants";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const Skills = () => {
  const cardRefs = useRef([]);
  const text = `Pragmatic stack spanning languages, frameworks,
    tooling, and data layers ready for prototypes
    or hardened production systems.`;

  useGSAP(() => {
    cardRefs.current.forEach((card) => {
      if (!card) return;

      gsap.from(card, {
        y: 120,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
        },
      });
    });
  }, []);

  return (
    <section id="skills" className="min-h-screen bg-black border-t-2 border-white/20">
      <AnimatedHeaderSection
        subTitle={"Stacks I Ship With"}
        title={"Skills"}
        text={text}
        textColor={"text-white"}
        withScrollTrigger={true}
      />
      <div className="px-10 pb-20">
        <div className="grid gap-8 md:grid-cols-2">
          {skillCategories.map((category, index) => (
            <article
              key={category.title}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="relative flex flex-col gap-6 p-8 overflow-hidden border border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm"
            >
              <header className="space-y-2">
                <p className="text-xs tracking-[0.4rem] uppercase text-white/40">
                  {category.subtitle}
                </p>
                <h3 className="text-3xl font-light md:text-4xl text-white">
                  {category.title}
                </h3>
              </header>
              <div className="grid gap-3 sm:grid-cols-2">
                {category.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-center gap-4 p-4 transition-colors duration-300 rounded-2xl bg-white/5 hover:bg-white/10"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-black/40 border border-white/10">
                      <Icon
                        icon={skill.icon}
                        className={`w-7 h-7 ${skill.iconClassName ?? "text-gold"}`}
                      />
                    </div>
                    <span className="text-lg font-light tracking-wide text-white">
                      {skill.name}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
