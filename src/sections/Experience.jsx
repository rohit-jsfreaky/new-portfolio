import { useRef } from "react";
import { experiences } from "../constants";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useMediaQuery } from "react-responsive";

gsap.registerPlugin(ScrollTrigger);

const Experience = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const lineRef = useRef(null);
  const cardRefs = useRef([]);
  const dotRefs = useRef([]);

  const isDesktop = useMediaQuery({ minWidth: "768px" });

  // Calculate date range
  const startDate = experiences[experiences.length - 1].date.split(" - ")[0];
  const endDate = experiences[0].date.split(" - ")[1];
  const dateRange = `${startDate} — ${endDate}`;

  useGSAP(() => {
    // Animate header
    gsap.from(headerRef.current, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: headerRef.current,
        start: "top 85%",
      },
    });

    // Animate timeline line
    if (lineRef.current) {
      gsap.from(lineRef.current, {
        scaleY: 0,
        transformOrigin: "top",
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
        },
      });
    }

    // Animate dots
    dotRefs.current.forEach((dot, index) => {
      if (!dot) return;
      gsap.from(dot, {
        scale: 0,
        duration: 0.4,
        delay: 0.08 * index,
        ease: "back.out(2)",
        scrollTrigger: {
          trigger: dot,
          start: "top 85%",
        },
      });
    });

    // Animate cards
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const direction = isDesktop && index % 2 === 0 ? -80 : 80;
      gsap.from(card, {
        x: isDesktop ? direction : 0,
        y: isDesktop ? 0 : 50,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
        },
      });
    });
  }, [isDesktop]);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="min-h-screen bg-black py-20 overflow-hidden"
    >
      {/* Timeline Header */}
      <div ref={headerRef} className="px-10 mb-16">
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-indigo" />
            <span className="text-sm font-mono text-indigo tracking-wider">
              {dateRange}
            </span>
          </div>
          <div>
            <p className="text-sm font-light tracking-[0.5rem] uppercase text-white/40 mb-2">
              Professional Journey
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-white">
              Work <span className="text-indigo">Experience</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative px-6 md:px-16 lg:px-24">
        {/* Timeline Line */}
        <div
          ref={lineRef}
          className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px
            bg-gradient-to-b from-indigo via-indigo/40 to-transparent
            md:-translate-x-1/2"
        />

        {/* Experience Cards */}
        <div className="space-y-10 md:space-y-16">
          {experiences.map((experience, index) => {
            const isLeft = index % 2 === 0;
            return (
              <div
                key={index}
                className={`relative flex items-start
                  ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}
                  flex-row`}
              >
                {/* Timeline Dot */}
                <div
                  ref={(el) => (dotRefs.current[index] = el)}
                  className="absolute left-8 md:left-1/2
                    -translate-x-1/2
                    w-3 h-3 rounded-full bg-indigo
                    ring-4 ring-black
                    z-10 mt-6"
                />

                {/* Date Badge - Desktop */}
                <div
                  className={`hidden md:flex w-1/2 items-start pt-5
                  ${isLeft ? "justify-end pr-10" : "justify-start pl-10"}`}
                >
                  <span
                    className="inline-block px-4 py-2
                    bg-indigo/10 text-indigo text-sm
                    rounded-full border border-indigo/30"
                  >
                    {experience.date}
                  </span>
                </div>

                {/* Experience Card */}
                <div
                  ref={(el) => (cardRefs.current[index] = el)}
                  className={`ml-14 md:ml-0 md:w-1/2
                    ${isLeft ? "md:pl-10" : "md:pr-10"}`}
                >
                  <div
                    className="bg-white/5 backdrop-blur-sm rounded-2xl
                    p-5 md:p-7 border border-white/10
                    hover:border-indigo/30 transition-colors duration-300"
                  >
                    {/* Mobile Date */}
                    <span
                      className="md:hidden inline-block mb-4 px-3 py-1
                      bg-indigo/10 text-indigo text-xs rounded-full"
                    >
                      {experience.date}
                    </span>

                    {/* Company Info */}
                    <div className="flex items-center gap-4 mb-5">
                      <div
                        className="w-12 h-12 rounded-xl overflow-hidden
                        bg-white/10 flex items-center justify-center shrink-0"
                      >
                        <img
                          src={experience.icon}
                          alt={experience.company_name}
                          className="w-9 h-9 object-cover rounded-lg"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl text-white font-light">
                          {experience.title}
                        </h3>
                        <p className="text-base text-gold">
                          {experience.company_name}
                        </p>
                      </div>
                    </div>

                    {/* Points */}
                    <ul className="space-y-3">
                      {experience.points.map((point, pointIndex) => (
                        <li
                          key={pointIndex}
                          className="flex items-start gap-3 text-white/70"
                        >
                          <span className="text-indigo text-xs mt-1.5 shrink-0 font-mono">
                            {String(pointIndex + 1).padStart(2, "0")}
                          </span>
                          <p className="text-sm leading-relaxed">{point}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Experience;
