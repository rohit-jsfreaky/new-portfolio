import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  basics,
  aboutBullets,
  quote,
  allProjects,
  experienceList,
  skillGroups,
  packages,
  achievements,
} from "./data/onyxData";

/**
 * Onyx — a bold black-and-white "craft" portfolio: bordered center column,
 * crosshatch rails, serif headings, real project screenshots, a filterable
 * tech stack, a live GitHub heatmap, and a built-in dark/light toggle.
 */

const cn = (...parts) => parts.filter(Boolean).join(" ");

const THEMES = {
  dark: {
    "--bg": "#0a0a0a",
    "--fg": "#f5f5f4",
    "--muted": "#a1a1aa",
    "--soft": "#63636b",
    "--line": "rgba(255,255,255,0.10)",
    "--stripe": "rgba(255,255,255,0.055)",
    "--hover": "rgba(255,255,255,0.05)",
    "--card": "#101010",
    "--chip": "#161616",
  },
  light: {
    "--bg": "#fcfcfb",
    "--fg": "#18181b",
    "--muted": "#52525b",
    "--soft": "#a1a1aa",
    "--line": "rgba(0,0,0,0.10)",
    "--stripe": "rgba(0,0,0,0.055)",
    "--hover": "rgba(0,0,0,0.04)",
    "--card": "#ffffff",
    "--chip": "#f4f4f5",
  },
};

/* gradient palette cycled across project thumbs */
const THUMB_GRADIENTS = [
  ["#7dd3fc", "#2563eb"],
  ["#fda4af", "#e11d48"],
  ["#fdba74", "#ea580c"],
  ["#86efac", "#16a34a"],
  ["#c4b5fd", "#7c3aed"],
  ["#5eead4", "#0d9488"],
];

const STRIPES =
  "[background-image:repeating-linear-gradient(315deg,var(--stripe)_0,var(--stripe)_1px,transparent_1px,transparent_7px)]";

const serif = { fontFamily: '"Instrument Serif", Georgia, serif' };

/* ------------------------------ layout helpers ----------------------------- */

function Shell({ children, className }) {
  return (
    <div className={cn("mx-auto w-full max-w-[720px] border-x border-[var(--line)]", className)}>
      {children}
    </div>
  );
}

function SectionHeader({ title, aside }) {
  return (
    <div className={cn("w-full border-y border-[var(--line)]", STRIPES)}>
      <Shell className="flex items-center justify-between gap-4 bg-[var(--bg)] px-6 py-2.5 sm:px-8">
        <h2 style={serif} className="text-2xl tracking-wide text-[var(--fg)]">
          {title}
        </h2>
        {aside}
      </Shell>
    </div>
  );
}

function GapBand({ h = "h-7" }) {
  return (
    <div className={cn("w-full", STRIPES, h)}>
      <Shell className="h-full" />
    </div>
  );
}

/* --------------------------------- heatmap --------------------------------- */

const HEAT_OPACITY = [0.07, 0.25, 0.45, 0.7, 1];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Deterministic pseudo-random fallback so the section never looks broken. */
function buildFallbackHeatmap(seedText) {
  let seed = 5381;
  for (let i = 0; i < seedText.length; i++) seed = (seed * 33) ^ seedText.charCodeAt(i);
  const cells = [];
  let s = seed >>> 0;
  for (let i = 0; i < 53 * 7; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const v = s % 100;
    cells.push(v < 34 ? 0 : v < 60 ? 1 : v < 80 ? 2 : v < 93 ? 3 : 4);
  }
  return { cells, total: cells.reduce((a, b) => a + b * 2, 0), live: false };
}

/** Live GitHub contributions for the last year (public API, no auth). */
function useGithubHeatmap(user) {
  const fallback = useMemo(() => buildFallbackHeatmap(user), [user]);
  const [heatmap, setHeatmap] = useState(fallback);

  useEffect(() => {
    let cancelled = false;
    fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad status"))))
      .then((d) => {
        const contribs = d?.contributions ?? [];
        if (cancelled || contribs.length === 0) return;
        // pad so the first column starts on the right weekday
        const firstDow = new Date(contribs[0].date).getDay();
        const cells = Array(firstDow)
          .fill(null)
          .concat(contribs.map((c) => c.level));
        const total =
          d?.total?.lastYear ?? contribs.reduce((a, c) => a + c.count, 0);
        setHeatmap({ cells, total, live: true });
      })
      .catch(() => {}); // keep the fallback
    return () => {
      cancelled = true;
    };
  }, [user]);

  return heatmap;
}

/* --------------------------------- page ----------------------------------- */

const OnyxPortfolio = () => {
  const [dark, setDark] = useState(true);
  const heatmap = useGithubHeatmap(basics.githubUser);
  const socials = basics.socials;

  const monthLabels = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => MONTH_NAMES[(now.getMonth() + 1 + i) % 12]);
  }, []);

  const contactLinks = [
    { label: "GitHub", href: socials.github, icon: "mdi:github" },
    { label: "LinkedIn", href: socials.linkedin, icon: "mdi:linkedin" },
    { label: "Twitter", href: socials.twitter, icon: "simple-icons:x" },
    { label: "Mail", href: `mailto:${basics.email}`, icon: "lucide:mail" },
    { label: "Resume", href: basics.resume, icon: "lucide:file-text" },
  ];

  return (
    <div
      id="top"
      style={THEMES[dark ? "dark" : "light"]}
      className="min-h-dvh scroll-smooth bg-[var(--bg)] font-sans text-[var(--fg)] antialiased transition-colors duration-300"
    >
      {/* ------------------------------- nav ------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur-md">
        <Shell className="flex items-center justify-between px-6 py-3 sm:px-8">
          <a href="#top" style={serif} className="text-xl tracking-wide">
            {basics.firstName}
          </a>
          <nav className="flex items-center gap-5 text-[13px] text-[var(--muted)]">
            {[
              ["Home", "#top"],
              ["Projects", "#projects"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a key={href} href={href} className="group relative transition-colors hover:text-[var(--fg)]">
                {label}
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
              </a>
            ))}
            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle theme"
              className="grid size-7 place-items-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-all duration-300 hover:rotate-45 hover:text-[var(--fg)]"
            >
              <Icon icon={dark ? "lucide:sun" : "lucide:moon"} className="size-3.5" />
            </button>
          </nav>
        </Shell>
      </header>

      {/* ------------------------------ banner ------------------------------ */}
      <Shell className="px-2 pt-2 sm:px-3 sm:pt-3">
        <div
          className="relative h-36 overflow-hidden sm:h-44"
          style={{
            background:
              "linear-gradient(160deg,#0c1f1d 0%,#123832 34%,#1d5c46 58%,#2e8560 78%,#7fc9a4 100%)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(38% 60% at 18% 8%, rgba(210,245,225,0.35), transparent 70%), radial-gradient(30% 55% at 82% 0%, rgba(190,235,255,0.28), transparent 70%), radial-gradient(55% 40% at 50% 108%, rgba(4,18,14,0.75), transparent 75%)",
            }}
          />
          <div className="absolute inset-0 opacity-30 [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.05)_0,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_5px)]" />
          <div className="absolute inset-0 [background-image:repeating-linear-gradient(90deg,rgba(0,0,0,0.12)_0,rgba(0,0,0,0.12)_1px,transparent_1px,transparent_28px)] opacity-40" />
        </div>
      </Shell>

      {/* ----------------------------- identity ----------------------------- */}
      <Shell className="px-6 py-6 sm:px-8">
        <div className="flex items-center gap-5">
          <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--chip)]">
            <img src={basics.avatar} alt={basics.name} className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 style={serif} className="text-[28px] leading-tight tracking-wide">
              {basics.name}
            </h1>
            <p className="mt-0.5 font-mono text-[13px] text-[var(--muted)]">{basics.headline}</p>
            <p className="mt-1 flex items-center gap-1 font-mono text-[11px] text-[var(--soft)]">
              <Icon icon="lucide:map-pin" className="size-3" /> {basics.location}
            </p>
          </div>
        </div>
      </Shell>

      {/* ------------------------------- about ------------------------------ */}
      <SectionHeader title="About" />
      <Shell className="px-6 py-7 sm:px-8">
        <ul className="space-y-3.5">
          {aboutBullets.map((line, i) => (
            <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed text-[var(--muted)]">
              <span className="mt-[9px] size-1 shrink-0 rounded-full bg-[var(--soft)]" />
              {line}
            </li>
          ))}
        </ul>
      </Shell>

      {/* ----------------------------- highlights --------------------------- */}
      <SectionHeader title="Highlights" />
      <Shell className="overflow-hidden px-6 py-6 sm:px-8">
        <div className="onyx-scroll flex gap-4 overflow-x-auto pb-3 sm:grid sm:grid-cols-2">
          {achievements.map((a, i) => (
            <div
              key={a.title}
              className={cn(
                "w-64 shrink-0 rounded-xl border border-[var(--line)] bg-[var(--card)] p-4 transition-transform duration-300 hover:rotate-0 sm:w-auto",
                i % 2 === 0 ? "rotate-[1.2deg]" : "-rotate-[1.2deg]",
              )}
            >
              <p className="text-[13px] font-semibold">{a.title}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--muted)]">
                {a.description}
              </p>
            </div>
          ))}
        </div>
      </Shell>

      {/* ------------------------------ contact ----------------------------- */}
      <div id="contact">
        <SectionHeader title="Contact" />
        <Shell>
          <div className="flex flex-wrap">
            {contactLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="group flex min-w-[50%] flex-1 items-center justify-center gap-2.5 border-b border-r border-[var(--line)] px-4 py-4 text-[13px] font-medium transition-colors duration-200 last:border-r-0 hover:bg-[var(--hover)] sm:min-w-0 sm:border-b-0"
              >
                <span className="grid size-8 place-items-center rounded-lg border border-[var(--line)] bg-[var(--chip)] text-[var(--muted)] transition-colors group-hover:text-[var(--fg)]">
                  <Icon icon={l.icon} className={l.icon === "simple-icons:x" ? "size-3.5" : "size-4"} />
                </span>
                {l.label}
                <Icon
                  icon="lucide:arrow-up-right"
                  className="size-3.5 text-[var(--soft)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--fg)]"
                />
              </a>
            ))}
          </div>
        </Shell>
      </div>

      {/* ------------------------------ projects ---------------------------- */}
      <div id="projects">
        <SectionHeader
          title="Projects"
          aside={
            <a
              href={socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1 font-mono text-[12px] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
            >
              View all
              <Icon
                icon="lucide:arrow-up-right"
                className="size-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          }
        />
        <Shell>
          <div className="grid sm:grid-cols-2">
            {allProjects.map((p, i) => (
              <ProjectCard key={p.name + i} project={p} index={i} />
            ))}
          </div>
        </Shell>
      </div>

      {/* ----------------------------- experience --------------------------- */}
      <SectionHeader title="Experience" />
      <Shell>
        {experienceList.map((e, i) => (
          <div
            key={e.company + i}
            className={cn(
              "px-6 py-6 transition-colors duration-200 hover:bg-[var(--hover)] sm:px-8",
              i > 0 && "border-t border-[var(--line)]",
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-[15px] font-semibold">
                {e.role} <span className="text-[var(--soft)]">·</span>{" "}
                <span className="text-[var(--muted)]">{e.company}</span>
              </h3>
              <span className="font-mono text-[11px] text-[var(--soft)]">{e.date}</span>
            </div>
            <ul className="mt-3 space-y-2">
              {e.highlights.map((h, j) => (
                <li key={j} className="flex gap-3 text-[13.5px] leading-relaxed text-[var(--muted)]">
                  <span className="mt-[8px] size-1 shrink-0 rounded-full bg-[var(--soft)]" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Shell>

      {/* ----------------------------- tech stack --------------------------- */}
      <TechStack groups={skillGroups} />

      {/* --------------------------- github activity ------------------------ */}
      <SectionHeader
        title="GitHub Activity"
        aside={
          heatmap.live ? (
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--muted)]">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
          ) : undefined
        }
      />
      <Shell className="px-6 py-6 sm:px-8">
        <div className="onyx-scroll overflow-x-auto pb-2">
          <div className="min-w-[640px]">
            <div className="mb-1.5 flex justify-between pr-8 font-mono text-[10px] text-[var(--soft)]">
              {monthLabels.map((m, i) => (
                <span key={m + i}>{m}</span>
              ))}
            </div>
            <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
              {heatmap.cells.map((lvl, i) =>
                lvl === null ? (
                  <span key={i} className="size-[10px]" />
                ) : (
                  <span
                    key={i}
                    className="size-[10px] rounded-[2px] bg-[var(--fg)] transition-transform duration-150 hover:scale-125"
                    style={{ opacity: HEAT_OPACITY[lvl] }}
                  />
                ),
              )}
            </div>
            <div className="mt-2.5 flex items-center justify-between font-mono text-[11px] text-[var(--muted)]">
              <span>{heatmap.total} contributions in the last year</span>
              <span className="flex items-center gap-1.5">
                Less
                {HEAT_OPACITY.map((o) => (
                  <span key={o} className="size-[10px] rounded-[2px] bg-[var(--fg)]" style={{ opacity: o }} />
                ))}
                More
              </span>
            </div>
          </div>
        </div>
      </Shell>

      {/* --------------------------- open source / npm ----------------------- */}
      <SectionHeader
        title="Open Source"
        aside={
          <span className="hidden font-mono text-[10px] tracking-wider text-[var(--soft)] sm:inline">
            ( published on npm )
          </span>
        }
      />
      <Shell className="overflow-hidden px-6 py-6 sm:px-8">
        <div className="onyx-scroll flex gap-4 overflow-x-auto pb-3">
          {packages.map((pkg, i) => (
            <div
              key={pkg.id}
              className={cn(
                "w-64 shrink-0 rounded-xl border border-[var(--line)] bg-[var(--card)] p-4 transition-transform duration-300 hover:rotate-0",
                i % 2 === 0 ? "rotate-[1.2deg]" : "-rotate-[1.2deg]",
              )}
            >
              <p className="text-[13px] font-semibold">
                {pkg.emoji} {pkg.name}
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--muted)]">{pkg.solution}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono text-[10px] text-[var(--soft)]">{pkg?.downloads}</span>
                <span className="flex items-center gap-2 text-[var(--soft)]">
                  <a
                    href={pkg.npmLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${pkg.name} on npm`}
                    className="transition-colors hover:text-[var(--fg)]"
                  >
                    <Icon icon="simple-icons:npm" className="size-4" />
                  </a>
                  <a
                    href={pkg.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${pkg.name} repository`}
                    className="transition-colors hover:text-[var(--fg)]"
                  >
                    <Icon icon="mdi:github" className="size-4" />
                  </a>
                </span>
              </div>
            </div>
          ))}
        </div>
      </Shell>

      {/* --------------------------- scrolled too far ----------------------- */}
      <SectionHeader title="Scrolled Too Far" />
      <Shell className="px-6 py-12 text-center sm:px-8">
        <p className="text-[14px] text-[var(--muted)]">
          If you&apos;ve read this far, you might be interested in what I do.
        </p>
        <a
          href={`mailto:${basics.email}`}
          className="group mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--fg)] px-5 py-2.5 text-[13px] font-semibold text-[var(--bg)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          Let&apos;s Talk
          <Icon icon="lucide:arrow-right" className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </a>
      </Shell>

      {/* -------------------------------- quote ----------------------------- */}
      <GapBand />
      <div className="w-full border-y border-[var(--line)]">
        <Shell className="px-8 py-14 text-center">
          <span style={serif} className="text-4xl text-[var(--soft)]">
            &ldquo;
          </span>
          <p style={serif} className="mx-auto -mt-2 max-w-md text-[26px] italic leading-snug">
            {quote}
          </p>
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--soft)]">
            — {basics.name}
          </p>
        </Shell>
      </div>

      {/* ------------------------------- footer ----------------------------- */}
      <GapBand h="h-5" />
      <div className="w-full border-t border-[var(--line)]">
        <Shell className="border-b-0 px-6 py-8 text-center sm:px-8">
          <p className="text-[13px] text-[var(--muted)]">
            Designed &amp; Developed by <span className="font-semibold text-[var(--fg)]">{basics.name}</span>
          </p>
          <p className="mt-1 font-mono text-[11px] text-[var(--soft)]">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </Shell>
      </div>
    </div>
  );
};

/* ------------------------------ project card ------------------------------- */

function ProjectCard({ project: p, index }) {
  const [c1, c2] = THUMB_GRADIENTS[index % THUMB_GRADIENTS.length];
  return (
    <div
      className={cn(
        "group border-[var(--line)] p-4 transition-colors duration-200 hover:bg-[var(--hover)] sm:p-5",
        index % 2 === 0 && "sm:border-r",
        index > 0 && "border-t",
        index === 1 && "sm:border-t-0",
      )}
    >
      {/* gradient thumb holding a real screenshot in a browser frame */}
      <div
        className="relative h-40 overflow-hidden rounded-lg"
        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
      >
        {p.featured && (
          <div className="absolute -right-9 top-4 z-10 rotate-45 bg-amber-300 px-10 py-1 text-center font-mono text-[9px] font-bold uppercase tracking-wider text-black shadow-md">
            Featured
          </div>
        )}
        <div className="absolute inset-x-5 bottom-0 top-5 overflow-hidden rounded-t-lg bg-white shadow-xl transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.02]">
          <div className="flex gap-1 border-b border-neutral-100 px-2.5 py-2">
            <span className="size-1.5 rounded-full bg-neutral-300" />
            <span className="size-1.5 rounded-full bg-neutral-300" />
            <span className="size-1.5 rounded-full bg-neutral-300" />
          </div>
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover object-top"
          />
        </div>
      </div>

      {/* name + live */}
      <div className="mt-4 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold">{p.name}</h3>
        {p.live_url && (
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--muted)]">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
        )}
      </div>
      <p className="mt-0.5 font-mono text-[11px] text-[var(--soft)]">{p.tag}</p>
      <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)] line-clamp-4">{p.description}</p>

      {/* tech + links */}
      <div className="mt-3.5 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {p.tech.map((t) => (
            <span
              key={t}
              className="rounded-md border border-[var(--line)] bg-[var(--chip)] px-2 py-0.5 font-mono text-[11px] text-[var(--muted)]"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2.5 text-[var(--soft)]">
          {p.live_url && (
            <a
              href={p.live_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${p.name} live site`}
              className="transition-all duration-200 hover:-translate-y-0.5 hover:text-[var(--fg)]"
            >
              <Icon icon="lucide:globe" className="size-4" />
            </a>
          )}
          {p.repo_url && (
            <a
              href={p.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${p.name} repository`}
              className="transition-all duration-200 hover:-translate-y-0.5 hover:text-[var(--fg)]"
            >
              <Icon icon="mdi:github" className="size-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- tech stack ------------------------------- */

function TechStack({ groups }) {
  const [active, setActive] = useState("All");
  const tabs = ["All", ...groups.map((g) => g.category)];
  const items =
    active === "All"
      ? groups.flatMap((g) => g.items)
      : groups.find((g) => g.category === active)?.items ?? [];

  return (
    <>
      <SectionHeader
        title="Tech Stack"
        aside={
          <span className="hidden font-mono text-[10px] tracking-wider text-[var(--soft)] sm:inline">
            ( hover to play )
          </span>
        }
      />
      <Shell className="px-6 py-6 sm:px-8">
        <div className="flex flex-wrap gap-1 rounded-lg border border-[var(--line)] bg-[var(--chip)] p-1">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActive(t)}
              className={cn(
                "rounded-md px-3 py-1 text-[12px] font-medium transition-colors duration-200",
                active === t
                  ? "bg-[var(--fg)] text-[var(--bg)]"
                  : "text-[var(--muted)] hover:text-[var(--fg)]",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span
              key={item + i}
              className={cn(
                "flex cursor-default items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--chip)] px-2.5 py-1.5 font-mono text-[12px] text-[var(--muted)] transition-all duration-200",
                "hover:-translate-y-1 hover:border-[var(--fg)] hover:bg-[var(--fg)] hover:text-[var(--bg)]",
                i % 2 === 0 ? "hover:rotate-2" : "hover:-rotate-2",
              )}
            >
              <span className="size-1 rounded-full bg-current opacity-60" />
              {item}
            </span>
          ))}
        </div>
      </Shell>
    </>
  );
}

export default OnyxPortfolio;
