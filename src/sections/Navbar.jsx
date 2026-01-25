import React, { useEffect, useRef, useState } from "react";
import { socials } from "../constants";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Link } from "react-scroll";

const navLinks = ["home", "services", "skills", "about", "experience", "work", "npm-packages", "contact"];

const Navbar = () => {
  const navRef = useRef(null);
  const linksRef = useRef([]);
  const contactRef = useRef(null);
  const topLineRef = useRef(null);
  const bottomLineRef = useRef(null);
  const desktopNavRef = useRef(null);
  const tl = useRef(null);
  const iconTl = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useGSAP(() => {
    gsap.set(navRef.current, { xPercent: 100 });
    gsap.set([linksRef.current, contactRef.current], {
      autoAlpha: 0,
      x: -20,
    });

    tl.current = gsap
      .timeline({ paused: true })
      .to(navRef.current, {
        xPercent: 0,
        duration: 1,
        ease: "power3.out",
      })
      .to(
        linksRef.current,
        {
          autoAlpha: 1,
          x: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out",
        },
        "<"
      )
      .to(
        contactRef.current,
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        "<+0.2"
      );

    iconTl.current = gsap
      .timeline({ paused: true })
      .to(topLineRef.current, {
        rotate: 45,
        y: 3.3,
        duration: 0.3,
        ease: "power2.inOut",
      })
      .to(
        bottomLineRef.current,
        {
          rotate: -45,
          y: -3.3,
          duration: 0.3,
          ease: "power2.inOut",
        },
        "<"
      );
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setShowNav(currentScrollY <= lastScrollY || currentScrollY < 10);
      setScrolled(currentScrollY > 50);

      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    if (isOpen) {
      tl.current.reverse();
      iconTl.current.reverse();
    } else {
      tl.current.play();
      iconTl.current.play();
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Desktop Navigation Bar */}
      <header
        ref={desktopNavRef}
        className={`fixed top-0 left-0 right-0 z-40 hidden md:flex items-center justify-between px-10 py-4 transition-all duration-500 ${
          showNav ? "translate-y-0" : "-translate-y-full"
        } ${scrolled ? "bg-black/90 backdrop-blur-md" : "bg-transparent"}`}
      >
        <Link
          to="home"
          smooth
          duration={1500}
          className="text-xl font-bold cursor-pointer"
        >
          <span className={`transition-colors duration-300 ${scrolled ? "text-white" : "text-black"}`}>
            Rohit<span className="text-gold">.</span>
          </span>
        </Link>

        <nav className="flex items-center gap-8">
          {navLinks.slice(1, -1).map((section) => (
            <Link
              key={section}
              to={section}
              smooth
              offset={0}
              duration={1500}
              className={`text-sm uppercase tracking-wider cursor-pointer transition-colors duration-300 hover:text-gold ${
                scrolled ? "text-white/80 hover:text-gold" : "text-black/80 hover:text-gold"
              }`}
            >
              {section}
            </Link>
          ))}
          <Link
            to="contact"
            smooth
            duration={1500}
            className="px-5 py-2 text-sm uppercase tracking-wider cursor-pointer bg-black text-white hover:bg-gold transition-all duration-300 rounded-sm"
          >
            Contact
          </Link>
        </nav>
      </header>

      {/* Mobile Slide-out Navigation */}
      <nav
        ref={navRef}
        className="fixed z-50 flex md:hidden flex-col justify-between w-full h-full px-10 uppercase bg-black text-white/80 py-28 gap-y-10"
      >
        <div className="flex flex-col text-3xl gap-y-2 md:text-6xl">
          {navLinks.map(
            (section, index) => (
              <div key={index} ref={(el) => (linksRef.current[index] = el)}>
                <Link
                  className="transition-all duration-300 cursor-pointer hover:text-white"
                  to={`${section}`}
                  smooth
                  offset={0}
                  duration={2000}
                  onClick={toggleMenu}
                >
                  {section}
                </Link>
              </div>
            )
          )}
        </div>
        <div
          ref={contactRef}
          className="flex flex-col flex-wrap justify-between gap-8 md:flex-row"
        >
          <div className="font-light">
            <p className="tracking-wider text-white/50">E-mail</p>
            <a
              href="mailto:rohitkashyapmrt@gmail.com"
              className="text-xl tracking-widest lowercase text-pretty hover:text-gold transition-colors duration-300"
            >
              rohitkashyapmrt@gmail.com
            </a>
          </div>
          <div className="font-light">
            <p className="tracking-wider text-white/50">Social Media</p>
            <div className="flex flex-col flex-wrap md:flex-row gap-x-2">
              {socials.map((social, index) => (
                <a
                  key={index}
                  target="_blank"
                  href={social.href}
                  className="text-sm leading-loose tracking-widest uppercase hover:text-white transition-colors duration-300"
                >
                  {"{ "}
                  {social.name}
                  {" }"}
                </a>
              ))}
            </div>
          </div>
          <div className="font-light">
            <a
              target="_blank"
              href="https://drive.google.com/file/d/14l1_2QIpBWmQRYJpXOcFA3JQcDLFnZFV/view?usp=sharing"
              className="px-6 py-3 text-sm tracking-widest uppercase border border-white/50 hover:bg-white hover:text-black transition-all duration-300 text-center rounded-sm"
            >
              Preview Resume
            </a>
          </div>
        </div>
      </nav>

      {/* Hamburger Button - Mobile Only */}
      <div
        className="fixed z-50 flex md:hidden flex-col items-center justify-center gap-1 transition-all duration-300 bg-black rounded-full cursor-pointer w-14 h-14 top-4 right-10"
        onClick={toggleMenu}
        style={
          showNav
            ? { clipPath: "circle(50% at 50% 50%)" }
            : { clipPath: "circle(0% at 50% 50%)" }
        }
      >
        <span
          ref={topLineRef}
          className="block w-8 h-0.5 bg-white rounded-full origin-center"
        ></span>
        <span
          ref={bottomLineRef}
          className="block w-8 h-0.5 bg-white rounded-full origin-center"
        ></span>
      </div>
    </>
  );
};

export default Navbar;
