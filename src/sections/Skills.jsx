import { useRef } from "react";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import { Icon } from "@iconify/react/dist/iconify.js";
import { skillCategories } from "../constants";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useMediaQuery } from "react-responsive";

gsap.registerPlugin(ScrollTrigger);

const Skills = () => {
  const cardRefs = useRef([]);
  const isDesktop = useMediaQuery({ minWidth: "48rem" }); // 768px
  const text = `Pragmatic stack spanning languages, frameworks,
    tooling, and data layers ready for prototypes
    or hardened production systems.`;

  useGSAP(() => {
    cardRefs.current.forEach((card) => {
      if (!card) return;

      gsap.from(card, {
        y: 200,
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
        },
        duration: 1,
        ease: "circ.out",
      });
    });
  }, []);

  return (
    <section id="skills" className="min-h-screen bg-black rounded-t-4xl">
      <AnimatedHeaderSection
        subTitle={"Stacks I Ship With"}
        title={"Skills"}
        text={text}
        textColor={"text-white"}
        withScrollTrigger={true}
      />
      
      {skillCategories.map((category, index) => (
        <div
          ref={(el) => (cardRefs.current[index] = el)}
          key={index}
          className="sticky px-10 pt-6 pb-12 text-white bg-black border-t-2 border-white/30"
          style={
            isDesktop
              ? {
                  top: `calc(10vh + ${index * 5}em)`,
                  marginBottom: `${(skillCategories.length - index - 1) * 5}rem`,
                }
              : { top: 0 }
          }
        >
           <div className="flex flex-col gap-8 md:flex-row md:justify-between md:items-start">
              <div className="md:w-1/3">
                 <h2 className="text-4xl lg:text-5xl mb-4">{category.title}</h2>
                 <p className="text-xl leading-relaxed tracking-widest lg:text-2xl text-white/60 text-pretty">
                    {category.subtitle}
                 </p>
              </div>
              
              <div className="md:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-4">
                 {category.skills.map((skill) => (
                    <div key={skill.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                       <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-black/40 border border-white/10 shrink-0">
                          <Icon
                            icon={skill.icon}
                            className={`w-6 h-6 ${skill.iconClassName ?? "text-gold"}`}
                          />
                       </div>
                       <span className="text-base font-light tracking-wide text-white/90">
                          {skill.name}
                       </span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      ))}
    </section>
  );
};

export default Skills;
