// index.js
export const servicesData = [
  {
    title: "FullStack Development",
    description:
      "Your business deserves a fast, secure, and future-proof digital foundation. I develop custom web apps with clean architecture, optimized databases, and seamless integrations—ensuring reliability at every layer.",
    items: [
      {
        title: "Backend Engineering",
        description: "(REST/GraphQL APIs, Microservices, Auth Systems)",
      },
      {
        title: "Frontend Excellence",
        description: "(React, Vue, TypeScript, Interactive UI/UX)",
      },
      {
        title: "Database Design",
        description: "(SQL/NoSQL Optimization, Scalable Structures)",
      },
    ],
  },
  {
    title: "Security & Optimization",
    description:
      "Slow or hacked apps destroy trust. I harden security (XSS/SQLI protection, OAuth) and optimize bottlenecks so your app stays fast, safe, and scalable as you grow.",
    items: [
      {
        title: "Code Audits",
        description: "(Refactoring, Tech Debt Cleanup)",
      },
      {
        title: "Pen Testing",
        description: "(Vulnerability Assessments)",
      },
      {
        title: "SEO Tech Stack",
        description: "(SSR, Metadata, Structured Data)",
      },
    ],
  },
  {
    title: "Web & Mobile Apps",
    description:
      "A clunky interface can sink even the best ideas. I craft responsive, pixel perfect web and mobile apps (React Native) that users love—bridging design and functionality seamlessly.",
    items: [
      {
        title: "Cross-Platform Apps",
        description: "(Single codebase for iOS/Android/Web)",
      },
      {
        title: "PWAs",
        description: "(Offline mode, Push Notifications)",
      },
      {
        title: "E-Commerce",
        description: "(Checkout flows, Payment Gateways, Inventory APIs)",
      },
    ],
  },
];
export const skillCategories = [
  {
    title: "Languages",
    subtitle: "Polyglot foundations across frontend and systems",
    skills: [
      { name: "JavaScript", icon: "logos:javascript" },
      { name: "TypeScript", icon: "logos:typescript-icon" },
      { name: "HTML", icon: "logos:html-5" },
      { name: "CSS", icon: "logos:css-3" },
      { name: "C", icon: "mdi:language-c" },
      { name: "C++", icon: "mdi:language-cpp" },
    ],
  },
  {
    title: "Frameworks & Libraries",
    subtitle: "Production-ready UI, API, and deployment stacks",
    skills: [
      { name: "React", icon: "logos:react" },
      { name: "Next.js", icon: "skill-icons:nextjs-light" },
      { name: "Redux", icon: "logos:redux" },
      {
        name: "Express.js",
        icon: "simple-icons:express",
        iconClassName: "text-white",
      },
      { name: "Node.js", icon: "logos:nodejs-icon" },
      { name: "React Native", icon: "tabler:brand-react-native" },
      { name: "AWS", icon: "logos:aws" },
      {
        name: "Redux Toolkit",
        icon: "simple-icons:redux",
        iconClassName: "text-white",
      },
    ],
  },
  {
    title: "Tools",
    subtitle: "Collaboration, delivery, and observability essentials",
    skills: [
      { name: "Git", icon: "logos:git-icon" },
      { name: "Firebase", icon: "logos:firebase" },
      { name: "Supabase", icon: "logos:supabase-icon" },
      { name: "Jira", icon: "logos:jira" },
      { name: "Bitbucket", icon: "logos:bitbucket" },
    ],
  },
  {
    title: "Databases",
    subtitle: "Structured and document-first data layers",
    skills: [
      { name: "MongoDB", icon: "logos:mongodb-icon" },
      { name: "SQL", icon: "mdi:database", iconClassName: "text-white" },
      {
        name: "NoSQL",
        icon: "mdi:database-cog-outline",
        iconClassName: "text-white",
      },
      { name: "PostgreSQL", icon: "logos:postgresql" },
    ],
  },
];
export const projects = [
  {
    id: 0,
    name: "SaaS Guard",
    description:
      "A centralized entitlement and permission management system for SaaS applications, handling feature access, roles, usage limits, and user-level overrides without hard-coded logic.",
    liveLink: "https://saasguard.rohitbuilds.tech/",
    githubLink: "https://github.com/rohit-jsfreaky/SaasGuard-frontend",
    image: "/assets/projects/saasguard.png",
    bgImage: "/assets/backgrounds/blanket.jpg",
    frameworks: [
      { id: 1, name: "React" },
      { id: 2, name: "TypeScript" },
      { id: 3, name: "Node.js" },
      { id: 4, name: "Express.js" },
      { id: 5, name: "PostgreSQL" },
      { id: 6, name: "Redis" },
      { id: 7, name: "Tailwind CSS" },
      { id: 8, name: "shadcn/ui" },
    ],
  },
  {
    id: 1,
    name: "Skill Arena",
    description:
      "An online Esport Tournament Management System with team registrations, match scheduling, and real-time score updates.",
    liveLink: "https://eskillarena.in/",
    githubLink: null,
    image: "/assets/projects/skill-arena.png",
    bgImage: "/assets/backgrounds/blanket.jpg",
    frameworks: [
      { id: 1, name: "React" },
      { id: 2, name: "Node.js" },
      { id: 3, name: "Express.js" },
      { id: 4, name: "Typescript" },
      { id: 5, name: "Shad cn" },
      { id: 6, name: "PostgreSQL" },
      { id: 7, name: "Razorpay" },
    ],
  },
  {
    id: 2,
    name: "Csv Editor",
    description:
      "This project is a robust CSV management platform that combines dynamic table editing, cloud storage with AWS S3, and secure authentication to deliver a seamless and user-friendly experience for managing and editing CSV files.",
    liveLink: "https://csv-editor-steel.vercel.app/",
    githubLink: "https://github.com/rohit-jsfreaky/Csv-Editor",
    image: "/assets/projects/cvs-editor.png",
    bgImage: "/assets/backgrounds/curtains.jpg",
    frameworks: [
      { id: 1, name: "Next.js" },
      { id: 2, name: "Aws S3" },
      { id: 3, name: "Shad cn" },
      { id: 4, name: "Clerk" },
      { id: 5, name: "Tailwind CSS" },
      { id: 6, name: "Next Api" },
    ],
  },
  {
    id: 3,
    name: "Ai Mock Interview",
    description:
      "Built an AI-powered mock interview platform with Next.js, Drizzle ORM, and NeonDB, enhancing user preparation by 80%. Integrated Gemini API for tailored questions and Clerk for secure authentication, ensuring efficiency and scalability.",
    liveLink: "https://ai-mock-interview-iota-blush.vercel.app/",
    githubLink: "https://github.com/rohit-jsfreaky/Ai-mock-interview",
    image: "/assets/projects/ai-interview.png",
    bgImage: "/assets/backgrounds/map.jpg",
    frameworks: [
      { id: 1, name: "Next.js" },
      { id: 2, name: "Drizzle ORM" },
      { id: 3, name: "Tailwind CSS" },
      { id: 4, name: "NeonDB" },
    ],
  },
  {
    id: 4,
    name: "Ai Resume Builder",
    description:
      "I've developed an AI-powered resume builder using React, Node.js, and MongoDB, featuring AI-driven suggestions via Gemini API and secure authentication with Clerk",
    liveLink: null,
    githubLink: "https://github.com/rohit-jsfreaky/resume-builder-ai",
    image: "/assets/projects/resume.png",
    bgImage: "/assets/backgrounds/poster.jpg",
    frameworks: [
      { id: 1, name: "React.js" },
      { id: 2, name: "Mongo DB" },
      { id: 3, name: "Tailwind Css" },
      { id: 4, name: "Node.js" },
      { id: 5, name: "Express.js" },
    ],
  },
  {
    id: 5,
    name: "Job Portal",
    description:
      "Developed a job portal using React, Node.js, and MongoDB. Features include secure authentication, job postings, and application management, bridging the gap between students andemployers.",
    liveLink: null,
    githubLink: "https://github.com/rohit-jsfreaky/job-portal",
    image: "/assets/projects/job-portal.jpg",
    bgImage: "/assets/backgrounds/table.jpg",
    frameworks: [
      { id: 1, name: "React.js" },
      { id: 2, name: "Mongo DB" },
      { id: 3, name: "Tailwind Css" },
      { id: 4, name: "Node.js" },
      { id: 5, name: "Express.js" },
    ],
  },
];
export const npmPackages = [
  {
    id: 1,
    name: "error-less",
    tagline: "The 'Viral' Star",
    emoji: "🌟",
    problem: "Standard Node.js stack traces are noisy, monochromatic, and force developers to manually hunt for line numbers.",
    solution: "A zero-config library that intercepts V8 stack traces to print beautiful, syntax-highlighted code frames directly in the terminal, complete with AI-style troubleshooting tips.",
    features: ["Visual Context - Displays exact 5 lines of code surrounding error", "Smart Suggestions - Auto-generates tips based on error types", "Lightweight - < 100kB packed size with no heavy dependencies"],
    techStack: ["TypeScript", "V8 Stack Trace API", "AST Parsing", "Source Maps"],
    image: "/assets/projects/error-less.png",
    npmLink: "https://www.npmjs.com/package/error-less",
    githubLink: "https://github.com/rohit-jsfreaky/error-less",
    downloads: "1.2k+"
  },
  {
    id: 2,
    name: "cron-safe",
    tagline: "The 'Reliability' Engine",
    emoji: "🛡️",
    problem: "Standard cron jobs fail silently, overlap during long tasks, and vanish during server restarts.",
    solution: "A drop-in wrapper for `node-cron` that brings enterprise reliability features—usually found in Redis/BullMQ—to simple file-based setups.",
    features: ["Idempotency & Retries - Automatic exponential backoff", "Overlap Prevention - Atomic locking prevents zombie processes", "Persistence - SQLite-backed job history survives restarts"],
    techStack: ["TypeScript", "SQLite (WAL Mode)", "Event Emitters", "Process Locking"],
    image: "/assets/projects/cron-safe.png",
    npmLink: "https://www.npmjs.com/package/cron-safe",
    githubLink: "https://github.com/rohit-jsfreaky/cron-safe",
    downloads: "800+"
  },
  {
    id: 3,
    name: "node-network-tab",
    tagline: "The 'Internal' Tool",
    emoji: "📡",
    problem: "Debugging HTTP requests on a headless server usually involves messy `console.log` spam.",
    solution: "A TUI (Terminal User Interface) that visualizes outgoing network traffic in real-time, allowing developers to inspect headers, payloads, and timings without leaving the CLI.",
    features: ["Zero-Latency - Monkey-patches Node.js http/https modules", "Interactive TUI - Scrollable request history built with Ink"],
    techStack: ["React (Ink)", "Monkey Patching", "Node.js Streams", "Proxy Patterns"],
    image: "/assets/projects/node-network-tab.png",
    npmLink: "https://www.npmjs.com/package/node-network-tab",
    githubLink: "https://github.com/rohit-jsfreaky/node-network-tab",
    downloads: "500+"
  },
  {
    id: 4,
    name: "express-rate-limit-redis-slim",
    tagline: "The 'Performance' Optimizer",
    emoji: "⚡",
    problem: "Existing Redis rate-limiters were bloated with dependencies, slowing down high-throughput microservices.",
    solution: "A hyper-optimized middleware that uses raw Redis atomic commands (Lua scripts) to handle thousands of requests per second with minimal CPU usage.",
    features: ["60% Smaller - Stripped of all non-essential dependencies", "Atomic Precision - Prevents race conditions in distributed systems"],
    techStack: ["Redis (Lua Scripting)", "Express Middleware", "Distributed Systems"],
    image: "/assets/projects/express-rate-limit-redis-slim.png",
    npmLink: "https://www.npmjs.com/package/express-rate-limit-redis-slim",
    githubLink: "https://github.com/rohit-jsfreaky/express-rate-limit-redis-slim",
    downloads: "2.5k+"
  },
  {
    id: 5,
    name: "zod-mock-data",
    tagline: "The 'DX' Booster",
    emoji: "🛠️",
    problem: "Writing mock data for tests is tedious and often drifts out of sync with actual Type definitions.",
    solution: "A utility that recursively parses Zod schemas to generate realistic, randomized test fixtures automatically.",
    features: ["Single Source of Truth - Zod schema defines validation & mock data", "Complex Types - Handles nested objects, arrays, optional fields"],
    techStack: ["TypeScript", "Zod", "Recursive Algorithms", "Generics"],
    image: "/assets/projects/zod-to-mock-data.png",
    npmLink: "https://www.npmjs.com/package/zod-mock-data",
    githubLink: "https://github.com/rohit-jsfreaky/zod-mock-data",
    downloads: "900+"
  }
];
export const socials = [
  {
    name: "Whatsapp",
    href: "https://wa.me/916397883500?text=Hi%20Rohit%2C%20I%20saw%20your%20portfolio",
  },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/r2609/" },
  { name: "GitHub", href: "https://github.com/rohit-jsfreaky" },
];

export const experiences = [
  {
    title: "Frontend Engineer",
    company_name: "Techorigins",
    icon: "/assets/company/techorigins.jpg",
    iconBg: "#383E56",
    date: "July 2025 - Present",
    points: [
      "Developed and optimized responsive UIs with React.js, improving page load performance by 30% and enhancing user retention",
      "Implemented reusable component libraries with TypeScript and Tailwind CSS, reducing development time by 25% across projects.",
      "Collaborated with backend teams to integrate REST and GraphQL APIs, cutting integration issues by 40%",
      "Improved accessibility and SEO scores of web apps, achieving 95+ Lighthouse scores and boosting organic traffic",
    ],
  },
  {
    title: "React.js Developer",
    company_name: "Revenza Tech",
    icon: "/assets/company/revenza.jpg",
    iconBg: "#383E56",
    date: "May 2025 - July 2025",
    points: [
      "Developed and deployed custom ERP systems, streamlining workflows and reducing manual processing time by 30%.",
      "Built responsive web applications that improved user engagement and led to a 25% faster load time across platforms.",
      "Delivered cross-platform mobile apps that enhanced customer reach, achieving 40% higher user adoption within the first release cycle.",
      "Managed full-stack development independently, completing projects 20% ahead of deadlines while ensuring 99.9% uptime",
    ],
  },
  {
    title: "Software Developer Engineer intern (React-native)",
    company_name: "CoRider",
    icon: "/assets/company/corider.jpg",
    iconBg: "#383E56",
    date: "Jan 2025 - May 2025",
    points: [
      "Improved UI Performance by 40% – Optimized re-renders and data flow to enhance app responsiveness and user experience.",
      "Integrated 100% Functional Features – Successfully implemented Google APIs, user KYC verification, and real-time chat, ensuring seamless interactions.",
      "Ensured 99.9% Uptime on Both Platforms – Fixed Android and iOS-specific issues, enabling smooth cross-platform functionality.",
      "Enhanced State Management by 60% – Optimized data handling for real-time updates, reducing lag and improving app efficiency.",
    ],
  },
  {
    title: "Software Developer intern",
    company_name: "Cogent Web Services",
    icon: "/assets/company/cogent.png",
    iconBg: "#383E56",
    date: "July 2024 - Dec 2024",
    points: [
      "Developed 5+ full-stack web applications using MERN stack and PostgreSQL, including complex platforms like an esports tournament management system with secure authentication, payment integration, and admin control.",
      "Engineered complete backend and frontend architecture for multiple client projects, handling RESTful APIs, responsive UI, and real-time data using React, Node.js, and Express.",
      "Built and deployed a cross-platform mobile application using React Native under NDA, integrating secure user flows, API consumption, and native device capabilities.",
      "Delivered production-ready solutions for businesses, from modern portfolio websites to scalable multi-user platforms, improving user engagement and functionality by 40%+.",
    ],
  },
  {
    title: "Mern Stack Developer intern",
    company_name: "Zidio Development",
    icon: "/assets/company/zidio.png",
    iconBg: "#383E56",
    date: "Apr 2024 - June 2024",
    points: [
      "Developed a full-stack AI-powered resume builder using React, Node.js, and MongoDB, integrating Gemini API for AI-driven suggestions and Clerk for secure authentication.",
      "Built a dynamic job portal using the MERN stack, implementing recruiter and student authentication, job posting features, and job application tracking.",
      "Utilized RESTful APIs to handle user authentication, job data retrieval, and secure communication between frontend and backend systems.",
      "Ensured seamless UI/UX with Tailwind CSS and Shadcn UI, improving user experience across devices while optimizing performance.",
    ],
  },
];
