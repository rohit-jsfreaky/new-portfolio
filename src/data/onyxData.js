// All real data for the Onyx portfolio, adapted from src/constants
import {
  projects as personalProjects,
  companyProjects,
  npmPackages,
  experiences,
} from "../constants";

export const basics = {
  name: "Rohit Kumar Kashyap",
  firstName: "Rohit",
  headline: "Full-Stack Engineer · Django / FastAPI / React / Next.js",
  location: "India",
  email: "rohitkashyapmrt@gmail.com",
  avatar: "/images/profile.png",
  // Served from our own domain, not Google Drive: the Drive copy went stale
  // (old two-column build, still listed SaaSGuard, no Cairn) and nothing here
  // could tell. This file is rebuilt by shared/resume/build_resume.py.
  resume: "/Rohit_Kumar_Kashyap_Resume.pdf",
  socials: {
    github: "https://github.com/rohit-jsfreaky",
    linkedin: "https://www.linkedin.com/in/r2609/",
    twitter: "https://x.com/rohit_jsfreaky",
    website: "https://rohitcodes.me/",
  },
  githubUser: "rohit-jsfreaky",
};

export const aboutBullets = [
  "Full-stack engineer at Techorigins, building and scaling production SaaS — a football transfer marketplace, an AI bookkeeping app, an AI product-photography studio, an agency task platform, and an email-verification API.",
  "Backend-heavy: took a 5-minute endpoint to under 1 second with indexing and layered Redis caching, and deduplicated roughly a million records across four data providers with pg_trgm.",
  "I ship AI features the honest way — LLM pipelines with multi-model fallback chains, prompt engineering measured on labeled test sets, and MCP servers so AI agents can use my APIs as tools.",
  "Built Cairn, an MCP server that gives an AI agent memory of websites. Published on PyPI, and measured over 90 benchmarked sessions at 52% fewer tool calls and 47% fewer tokens than Playwright MCP.",
  "Author of 5 npm developer tools (error-less, cron-safe and friends), and a contributor to OpenClaw, Graphify and Reflex.",
];

export const quote =
  "I help growing brands and startups gain an unfair advantage through premium, results-driven web apps.";

const companyCards = companyProjects.map((p) => ({
  name: p.name,
  tag: `Built at ${p.company}`,
  description: p.description,
  live_url: p.liveLink,
  repo_url: null,
  image: p.image,
  tech: p.techStack.slice(0, 5),
  featured: p.name === "TransferPitch",
}));

const personalCards = personalProjects.map((p) => ({
  name: p.name,
  tag: "Personal project",
  description: p.description,
  live_url: p.liveLink,
  repo_url: p.githubLink,
  image: p.image,
  tech: p.frameworks.slice(0, 5).map((f) => f.name),
  featured: p.name === "Cairn",
}));

// Cairn leads the grid; the rest keep their existing order.
const cards = [...companyCards, ...personalCards];
const lead = cards.findIndex((p) => p.name === "Cairn");

export const allProjects =
  lead > 0 ? [cards[lead], ...cards.filter((_, i) => i !== lead)] : cards;

export const experienceList = experiences.map((e) => ({
  role: e.title,
  company: e.company_name,
  date: e.date,
  highlights: e.points,
}));

export const skillGroups = [
  {
    category: "Languages",
    items: ["TypeScript", "Python", "SQL"],
  },
  {
    category: "Frontend",
    items: ["React", "Next.js", "React Native", "Tailwind CSS"],
  },
  {
    category: "Backend",
    items: ["Node.js", "Django", "FastAPI"],
  },
  {
    // Providers are not skills — what goes here is what I actually build with them.
    category: "AI / LLM",
    items: ["MCP", "AI Agents", "RAG", "LLM evaluation", "Vector search", "Multi-model routing"],
  },
  {
    category: "Databases",
    items: ["PostgreSQL", "Redis", "MongoDB", "Typesense", "pgvector"],
  },
  {
    category: "Infrastructure",
    items: ["AWS", "Docker", "Cloudflare", "GitHub Actions"],
  },
  {
    category: "Tools",
    items: ["Git", "Playwright", "Postman"],
  },
];

export const packages = npmPackages;

/**
 * Contributions to other people's repositories. Star counts and the merged
 * state of every PR were checked against the GitHub API on 2026-09-14.
 * Graphify says "commits shipped", never "merged PRs" — that project's
 * maintainers cherry-pick and close the PR, so the merged count really is 0
 * while the commits are genuinely on main.
 */
export const contributions = [
  {
    repo: "OpenClaw",
    stars: "390k",
    url: "https://github.com/openclaw/openclaw",
    summary:
      "1 PR merged to main in an open-source personal AI assistant — fixed default vaults being dropped during memory-wiki configure.",
  },
  {
    repo: "Graphify",
    stars: "117k",
    url: "https://github.com/Graphify-Labs/graphify",
    summary:
      "3 commits shipped to main in a Python/tree-sitter code knowledge-graph engine used by Claude Code, Cursor and Codex. Built by a YC S26 company.",
  },
  {
    repo: "Reflex",
    stars: "28.9k",
    url: "https://github.com/reflex-dev/reflex",
    summary:
      "1 PR merged to main in a Python web framework — fixed the dashboard tutorial's dialog closing before required-field validation could run.",
  },
];

export const achievements = [
  {
    title: "🏆 Won the Unlayer Hackathon",
    description:
      "Winner of the \"Build with Elements\" hackathon by Unlayer (YC W22).",
  },
  {
    title: "🔀 Contributor at Graphify (YC S26)",
    description:
      "3 commits shipped to main in Graphify, a code knowledge-graph engine built by a YC S26 company.",
  },
];
