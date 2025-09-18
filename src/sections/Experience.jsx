import { useRef } from "react";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import { experiences } from "../constants";
import { useMediaQuery } from "react-responsive";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const Experience = () => {
  const text = `Professional journey building scalable solutions
    and creating meaningful impact across
    diverse tech environments.`;
  const experienceRefs = useRef([]);
  const isDesktop = useMediaQuery({ minWidth: "48rem" }); //768px

  useGSAP(() => {
    experienceRefs.current.forEach((el) => {
      if (!el) return;

      gsap.from(el, {
        y: 200,
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
        },
        duration: 1,
        ease: "circ.out",
      });
    });
  }, []);

  return (
    <section id="experience" className="min-h-screen bg-black rounded-t-4xl">
      <AnimatedHeaderSection
        subTitle={"Building Tomorrow, One Code at a time"}
        title={"Experience"}
        text={text}
        textColor={"text-white"}
        withScrollTrigger={true}
      />
      {experiences.map((experience, index) => (
        <div
          ref={(el) => (experienceRefs.current[index] = el)}
          key={index}
          className="sticky px-10 pt-6 pb-12 text-white bg-black border-t-2 border-white/30"
          style={
            isDesktop
              ? {
                  top: `calc(10vh + ${index * 5}em)`,
                  marginBottom: `${(experiences.length - index - 1) * 5}rem`,
                }
              : { top: 0 }
          }
        >
          <div className="flex items-start justify-between gap-6 font-light">
            <div className="flex flex-col gap-6 flex-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                  <img 
                    src={experience.icon} 
                    alt={experience.company_name}
                    className="w-8 h-8 object-cover rounded-full"
                  />
                </div>
                <div>
                  <h2 className="text-3xl lg:text-4xl">{experience.title}</h2>
                  <h3 className="text-xl lg:text-2xl text-gold">{experience.company_name}</h3>
                  <p className="text-sm lg:text-base text-white/60 tracking-wider uppercase">
                    {experience.date}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-4 text-lg lg:text-xl text-white/80">
                {experience.points.map((point, pointIndex) => (
                  <div key={`point-${index}-${pointIndex}`} className="flex items-start gap-4">
                    <span className="text-gold text-sm mt-2 flex-shrink-0">
                      0{pointIndex + 1}
                    </span>
                    <p className="leading-relaxed tracking-wide text-pretty">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Experience;