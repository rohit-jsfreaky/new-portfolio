import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);
const ServiceSummary = () => {
  useGSAP(() => {
    // Only apply scroll animations on desktop (md and up)
    const mm = gsap.matchMedia();
    
    mm.add("(min-width: 768px)", () => {
      gsap.to("#title-service-1", {
        xPercent: 20,
        scrollTrigger: {
          target: "#title-service-1",
          scrub: true,
        },
      });
      gsap.to("#title-service-2", {
        xPercent: -30,
        scrollTrigger: {
          target: "#title-service-2",
          scrub: true,
        },
      });
      gsap.to("#title-service-3", {
        xPercent: 100,
        scrollTrigger: {
          target: "#title-service-3",
          scrub: true,
        },
      });
      gsap.to("#title-service-4", {
        xPercent: -100,
        scrollTrigger: {
          target: "#title-service-4",
          scrub: true,
        },
      });
    });
  });
  return (
    <section className="mt-20 overflow-hidden font-light leading-snug text-center mb-42 contact-text-responsive">
      <div id="title-service-1" className="md:translate-x-0">
        <p>Architucture</p>
      </div>
      <div
        id="title-service-2"
        className="flex items-center justify-center gap-3 md:translate-x-16 flex-wrap md:flex-nowrap"
      >
        <p className="font-normal">Development</p>
        <div className="w-10 h-1 md:w-32 bg-gold" />
        <p>Deployment</p>
      </div>
      <div
        id="title-service-3"
        className="flex items-center justify-center gap-3 md:-translate-x-48 flex-wrap md:flex-nowrap"
      >
        <p>APIs</p>
        <div className="w-10 h-1 md:w-32 bg-gold" />
        <p className="italic">Frontends</p>
        <div className="w-10 h-1 md:w-32 bg-gold" />
        <p>Scalability</p>
      </div>
      <div id="title-service-4" className="md:translate-x-48">
        <p>Databases</p>
      </div>
    </section>
  );
};

export default ServiceSummary;
