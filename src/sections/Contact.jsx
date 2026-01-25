import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import Marquee from "../components/Marquee";
import { socials } from "../constants";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const sectionRef = useRef(null);
  const quoteRef = useRef(null);
  const ctaRef = useRef(null);
  const detailsRef = useRef(null);

  const inspirationalItems = [
    "Innovation",
    "Precision",
    "Trust",
    "Collaboration",
    "Excellence",
  ];

  const closingItems = [
    "just imagine, I code",
    "just imagine, I code",
    "just imagine, I code",
    "just imagine, I code",
  ];

  useGSAP(() => {
    // Quote animation
    gsap.from(quoteRef.current, {
      y: 80,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: quoteRef.current,
        start: "top 80%",
      },
    });

    // CTA buttons
    if (ctaRef.current) {
      gsap.from(ctaRef.current.children, {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 85%",
        },
      });
    }

    // Contact details
    gsap.from(".contact-detail", {
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: {
        trigger: detailsRef.current,
        start: "top 85%",
      },
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="min-h-screen bg-primary flex flex-col"
    >
      {/* Top Marquee */}
      <Marquee items={inspirationalItems} className="text-black bg-transparent" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 md:px-10">
        {/* Inspirational Quote */}
        <div ref={quoteRef} className="text-center mb-14">
          <p className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight">
            " Let's build a
            <br />
            <span className="font-normal">memorable</span> &{" "}
            <span className="italic">inspiring</span>
            <br />
            web application <span className="text-gold">together</span> "
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          ref={ctaRef}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <a
            href="mailto:rohitkashyapmrt@gmail.com"
            className="px-8 py-4 text-sm font-medium tracking-wider uppercase
              bg-black text-white rounded-sm
              hover:bg-gold hover:text-black hover:scale-105
              transition-all duration-300"
          >
            Get In Touch
          </a>
          <a
            href="https://wa.me/916397883500?text=Hi%20Rohit"
            target="_blank"
            rel="noreferrer"
            className="px-8 py-4 text-sm font-medium tracking-wider uppercase
              border-2 border-black text-black rounded-sm
              hover:bg-black hover:text-white
              transition-all duration-300"
          >
            WhatsApp
          </a>
        </div>

        {/* Contact Details Grid */}
        <div
          ref={detailsRef}
          className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6"
        >
          {/* Email */}
          <div className="contact-detail text-center md:text-left">
            <p className="text-sm uppercase tracking-wider text-black/40 mb-2">
              E-mail
            </p>
            <a
              href="mailto:rohitkashyapmrt@gmail.com"
              className="text-base md:text-lg hover:text-gold transition-colors duration-300"
            >
              rohitkashyapmrt@gmail.com
            </a>
          </div>

          {/* Phone */}
          <div className="contact-detail text-center">
            <p className="text-sm uppercase tracking-wider text-black/40 mb-2">
              Phone
            </p>
            <a
              href="tel:+916397883500"
              className="text-base md:text-lg hover:text-gold transition-colors duration-300"
            >
              +91 6397 883 500
            </a>
          </div>

          {/* Social */}
          <div className="contact-detail text-center md:text-right">
            <p className="text-sm uppercase tracking-wider text-black/40 mb-2">
              Social Media
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-3">
              {socials.map((social, index) => (
                <a
                  key={index}
                  target="_blank"
                  rel="noreferrer"
                  href={social.href}
                  className="text-sm hover:text-gold transition-colors duration-300"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Marquee */}
      <Marquee
        items={closingItems}
        reverse={true}
        className="text-white bg-black"
      />
    </section>
  );
};

export default Contact;
