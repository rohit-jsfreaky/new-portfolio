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
  resume:
    "https://drive.google.com/file/d/1JxHra95AtuX60PkrXZSaYAUSWGhfjt7E/view?usp=sharing",
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
  "Author of 5 npm packages (error-less, cron-safe, and friends) with thousands of downloads.",
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
  featured: p.name === "Pannly",
}));

export const allProjects = [...companyCards, ...personalCards];

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
    category: "AI / LLM",
    items: ["OpenAI", "Gemini", "Claude", "RAG", "AI Agents"],
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
