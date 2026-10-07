export const profile = {
  name: "Vishwa Dayarathne",
  fullName: "Vishwa Deshan Dayarathne",
  roles: [
    "Software Engineering Undergraduate",
    "Associate Software Engineer",
    "Backend Developer",
  ],
  location: "Colombo, Sri Lanka",
  phone: "+94 75 609 6595",
  email: "2001vddayarathna@gmail.com",
  linkedin: "https://www.linkedin.com/in/vishwa-dayarathne",
  github: "https://github.com/VDDayarathna",
  resumeUrl: "/Vishwa_Dayarathne_CV.pdf",
  tagline:
    "I build reliable, scalable backend systems — from banking-grade Spring Boot services to full-stack products — with clean architecture and an obsession for detail.",
  summary:
    "Motivated and detail-oriented Software Engineering undergraduate with hands-on experience delivering production-level software in a professional engineering environment. Skilled in building scalable backend features, optimizing system reliability, and writing clean, maintainable code aligned with modern engineering practices. Adept at working in collaborative, fast-paced environments and analyzing complex requirements to deliver high-quality solutions. Recognized for adaptability, strong problem-solving abilities, and a commitment to continuous learning and professional growth.",
};

export type Stat = { label: string; value: string };

export const stats: Stat[] = [
  { label: "Years in Industry", value: "1+" },
  { label: "Production Domains", value: "3" },
  { label: "Projects Shipped", value: "4+" },
  { label: "Core Technologies", value: "10+" },
];

export type Experience = {
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
  current?: boolean;
};

export const experience: Experience[] = [
  {
    company: "ZData Innovations",
    role: "Associate Software Engineer",
    period: "July 2026 — Present",
    location: "Malabe, Sri Lanka",
    current: true,
    bullets: [
      "Promoted from Software Engineer Intern to Associate Software Engineer in recognition of contributions to backend development for enterprise FinTech and banking solutions.",
      "Continuing to work within a Spring Boot modular monolith following DDD and SOLID principles, taking on increased ownership of feature delivery.",
    ],
  },
  {
    company: "ZData Innovations",
    role: "Software Engineer Intern",
    period: "July 2025 — July 2026",
    location: "Malabe, Sri Lanka",
    bullets: [
      "Contributed to backend development for enterprise FinTech and banking solutions, working within a Spring Boot modular monolith following DDD and SOLID principles.",
      "Implemented and optimized CRUD operations, service-layer logic, DTO mapping, and JPA/Hibernate repositories across customer onboarding, master data, and KYC domains.",
      "Developed and tested GraphQL queries, mutations, and resolvers; supported smooth backend–frontend API integration for banking product features.",
      "Designed and maintained Liquibase schema migrations (tables, relationships, constraints) ensuring stable and version-controlled database releases.",
      "Improved platform reliability by implementing optimistic locking, soft-delete flows, active-record filtering, and robust validation logic.",
      "Supported JWT-based authentication and permission-driven authorization used across banking modules; contributed to API documentation and integration testing.",
      "Collaborated within an agile engineering team to refactor legacy components, resolve API integration issues, and enhance feature stability for financial applications.",
    ],
  },
  {
    company: "Bank of Ceylon — Super Grade Branch",
    role: "Internship",
    period: "November 2021 — August 2022",
    location: "Kandy, Sri Lanka",
    bullets: [
      "Gained professional experience in a structured banking environment, supporting customer service operations and developing key soft skills such as communication, attention to detail, and teamwork.",
    ],
  },
];

export type Project = {
  title: string;
  role: string;
  tools: string[];
  description: string;
  links?: { label: string; url: string }[];
  tag: string;
};

export const projects: Project[] = [
  {
    title: "Orion AI",
    tag: "AI Prompting Skills Game",
    role: "Backend Developer · Group Project",
    tools: ["Python", "Django", "MongoDB", "React", "JavaScript"],
    description:
      "A web-based game that helps users enhance their AI prompting skills across text, image, and code generation. Led backend development — RESTful APIs, MongoDB-backed progress tracking, and prompt-enhancement logic powering interactive gameplay.",
    links: [
      { label: "Frontend", url: "#" },
      { label: "Backend", url: "#" },
    ],
  },
  {
    title: "Uvindu Food Cabin",
    tag: "Food Ordering Platform",
    role: "Full-Stack Developer · Group Project",
    tools: ["Python", "Django", "React", "Tailwind CSS"],
    description:
      "A scalable food ordering platform for efficient restaurant and customer interaction, with user authentication, dynamic menu management, and real-time order tracking behind a clean, user-friendly interface.",
    links: [{ label: "GitHub", url: "#" }],
  },
  {
    title: "SaLoN",
    tag: "Smart Salon Management & Booking",
    role: "Full-Stack Developer",
    tools: ["Laravel", "PHP", "JavaScript"],
    description:
      "A web platform that streamlines salon operations — product browsing, multi-option payments, and online appointment booking — enhanced with an AI-powered support chatbot and an admin dashboard for services, orders, and bookings.",
    links: [{ label: "GitHub", url: "#" }],
  },
  {
    title: "SMS",
    tag: "Sport Management System",
    role: "Full-Stack Developer",
    tools: ["React", "JavaScript", "Spring Boot", "MySQL", "Tailwind CSS"],
    description:
      "A platform to streamline sports facility management and event coordination for university students — schedules, activity registration, and team management — with a responsive frontend and robust database integration.",
    links: [
      { label: "Frontend", url: "#" },
      { label: "Backend", url: "#" },
    ],
  },
];

export type SkillGroup = {
  category: string;
  skills: string[];
};

export const skills: SkillGroup[] = [
  { category: "Languages", skills: ["Java", "Python", "PHP", "JavaScript"] },
  { category: "Frameworks", skills: ["Spring Boot", "Django", "Laravel", "React"] },
  { category: "Databases", skills: ["MySQL", "MongoDB", "PostgreSQL"] },
  { category: "DevOps & VCS", skills: ["Git", "GitHub"] },
  { category: "Tools", skills: ["Figma", "Postman", "Adobe Photoshop", "Cisco Packet Tracer"] },
];

export const softSkills: string[] = [
  "Teamworking & Collaboration",
  "Communication",
  "Time Management",
  "Problem Solving",
  "Adaptability",
  "Leadership",
  "Self Learning Ability",
];

export type Education = {
  school: string;
  program: string;
  period: string;
  location: string;
  details?: string[];
};

export const education: Education[] = [
  {
    school: "Sabaragamuwa University of Sri Lanka",
    program: "BSc (Hons) in Software Engineering",
    period: "08/2022 — Present",
    location: "Belihuloya, Sri Lanka",
  },
  {
    school: "K/Vidyartha College, Kandy",
    program: "G.C.E. Advanced Level Examination",
    period: "2020",
    location: "Kandy, Sri Lanka",
    details: ["Combined Mathematics — A", "Physics — B", "Chemistry — B"],
  },
];

export type Leadership = {
  title: string;
  org: string;
  bullets: string[];
};

export const leadership: Leadership[] = [
  {
    title: "CAREERFORGE Phase 2 — Program Team Leader",
    org: "Sabaragamuwa University of Sri Lanka — IEEE Student Branch",
    bullets: [
      "Led the planning and coordination of CAREERFORGE, a professional development program connecting students with industry insights and career guidance.",
      "Contributed to the success of interactive workshops, panel discussions, and mentorship sessions that supported student career readiness.",
      "Developed strong leadership, event management, team collaboration, and professional communication skills through active engagement with academic and industry stakeholders.",
    ],
  },
  {
    title: "PEARLHACK — Logistics Team Leader",
    org: "Sabaragamuwa University of Sri Lanka — IEEE Student Branch",
    bullets: [
      "Oversaw end-to-end logistics operations for PEARLHACK, ensuring smooth coordination of resources, venues, and technical setups throughout the event.",
      "Contributed to the overall success of the hackathon by maintaining timely execution, minimizing disruptions, and enhancing the participant experience.",
      "Applied strong organizational, problem-solving, teamwork, and communication skills to manage tasks under pressure and collaborate with multiple stakeholders.",
    ],
  },
];

export const extracurricular: string[] = [
  "Active member of the IEEE Student Branch of Sabaragamuwa University of Sri Lanka, contributing to various technical and professional events.",
  "Active member of the Society of Computer Sciences at Sabaragamuwa University of Sri Lanka, participating in academic and collaborative student initiatives.",
];
