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
export const projects = [
  {
    id: 1,
    name: "Skill Arena",
    description:
      "An online Esport Tournament Management System with team registrations, match scheduling, and real-time score updates.",
    href: "https://github.com/rohit-jsfreaky/skill-arena-frontend",
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
    href: "https://github.com/rohit-jsfreaky/Csv-Editor",
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
    href: "https://github.com/rohit-jsfreaky/Ai-mock-interview",
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
    href: "https://github.com/rohit-jsfreaky/resume-builder-ai",
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
    href: "https://github.com/rohit-jsfreaky/job-portal",
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
export const socials = [
  { name: "Whatsapp", href: "https://wa.me/916397883500?text=Hi%20Rohit%2C%20I%20saw%20your%20portfolio" },
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