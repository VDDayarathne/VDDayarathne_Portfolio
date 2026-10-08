export const profile = {
  name: "Vishwa Dayarathne",
  fullName: "Vishwa Deshan Dayarathne",
  roles: ["Software Engineering Graduate (Results Pending)", "Associate Software Engineer", "Full-Stack Developer"],
  location: "Colombo, Sri Lanka",
  phone: "+94 75 609 6595",
  email: "2001vddayarathna@gmail.com",
  linkedin: "https://www.linkedin.com/in/vishwa-dayarathne-0a0a6b2b0",
  github: "https://github.com/VDDayarathne",
  resumeUrl: "mailto:2001vddayarathna@gmail.com?subject=CV%20Request",
  tagline: "I turn complex requirements into thoughtful, dependable software combining practical engineering experience with the curiosity to keep learning and the versatility to contribute across the development lifecycle.",
  summary: "I am a growth-oriented software engineer who enjoys understanding difficult problems, shaping practical solutions, and following through with care. I adapt quickly, value clear communication, and work well with others toward shared goals. I am looking to contribute meaningful value to an organization, learn from experienced professionals, take on greater responsibility, and grow alongside the team and company I join.",
};

export type Stat = { label: string; value: string };
export const stats: Stat[] = [
  { label: "Industry Experience", value: "1+ yr" },
  { label: "Engineering Roles", value: "2" },
  { label: "Featured Projects", value: "2" },
  { label: "Degree Completion", value: "2026" },
];

export type Experience = { company: string; role: string; period: string; location: string; bullets: string[]; current?: boolean };
export const experience: Experience[] = [
  { company: "ZData Innovations", role: "Associate Software Engineer", period: "July 2026 — Present", location: "Malabe, Sri Lanka", current: true, bullets: [
    "Promoted from Software Engineer Intern in recognition of contributions to backend development for enterprise FinTech and banking solutions.",
    "Continue to work within a Spring Boot modular monolith following domain-driven design and SOLID principles, with increased ownership of feature delivery.",
  ] },
  { company: "ZData Innovations", role: "Software Engineer Intern", period: "July 2025 — July 2026", location: "Malabe, Sri Lanka", bullets: [
    "Contributed to backend development for enterprise FinTech and banking solutions within a Spring Boot modular monolith following domain-driven design and SOLID principles.",
    "Implemented and optimized CRUD operations, service-layer logic, DTO mapping, and JPA/Hibernate repositories across customer onboarding, master data, and KYC domains.",
    "Developed and tested GraphQL queries, mutations, and resolvers, supporting backend–frontend integration for banking product features.",
    "Designed and maintained Liquibase migrations for tables, relationships, and constraints, supporting stable, version-controlled database releases.",
    "Improved platform reliability through optimistic locking, soft-delete flows, active-record filtering, and robust validation logic.",
    "Supported JWT-based authentication and permission-driven authorization across banking modules, and contributed to API documentation and integration testing.",
    "Collaborated within an agile engineering team to refactor legacy components, resolve integration issues, and improve feature stability.",
  ] },
  { company: "Bank of Ceylon — Super Grade Branch", role: "Intern", period: "November 2021 — August 2022", location: "Kandy, Sri Lanka", bullets: [
    "Supported customer service operations in a structured banking environment while developing professional communication, attention to detail, and teamwork.",
  ] },
];

export type Project = { title: string; role: string; tools: string[]; description: string; links?: { label: string; url: string }[]; tag: string };
export const projects: Project[] = [
  { title: "Orion AI", tag: "AI Prompting Skills Development Game", role: "Backend Developer · Group Project", tools: ["Python", "Django", "MongoDB", "React", "JavaScript"],
    description: "Collaborated on a web-based game designed to help users improve their AI prompting skills across text, image, and code generation. Led backend development by building RESTful APIs, managing user progress data in MongoDB, and integrating prompt-enhancement logic for the interactive experience.",
    links: [{ label: "Frontend", url: "https://github.com/VDDayarathne/Orion_AI_FrontEnd" }, { label: "Backend", url: "https://github.com/VDDayarathne/Orion_backend" }] },
  { title: "SMS", tag: "Sport Management System", role: "Full-Stack Developer", tools: ["React", "JavaScript", "Java", "Spring Boot", "MySQL", "Tailwind CSS"],
    description: "Developed a web platform for university students to view sports facility schedules, register for activities, and manage team information. Contributed across the frontend and backend, with responsibility for a responsive user experience and reliable database integration.",
    links: [{ label: "Frontend", url: "https://github.com/VDDayarathne/SMS_frontend" }, { label: "Backend", url: "https://github.com/VDDayarathne/SMS_BackEnd" }] },
];

export type SkillGroup = { category: string; skills: string[] };
export const skills: SkillGroup[] = [
  { category: "Programming Languages", skills: ["Java", "Python", "PHP", "JavaScript"] },
  { category: "Frameworks & Libraries", skills: ["Spring Boot", "Django", "Laravel", "React"] },
  { category: "Databases", skills: ["MySQL", "MongoDB", "PostgreSQL"] },
  { category: "Development Tools", skills: ["Git", "GitHub", "Postman"] },
  { category: "Design & Productivity", skills: ["Figma", "Adobe Photoshop", "Microsoft 365", "Cisco Packet Tracer"] },
];
export const softSkills = ["Teamwork & Collaboration", "Communication", "Time Management", "Problem Solving", "Adaptability", "Leadership", "Self-Learning"];

export type Education = { school: string; program: string; period: string; location: string; details?: string[] };
export const education: Education[] = [
  { school: "Sabaragamuwa University of Sri Lanka", program: "BSc (Hons) in Software Engineering", period: "2022 — 2026", location: "Belihuloya, Sri Lanka", details: ["Degree requirements completed · Final results pending"] },
  { school: "K/Vidyartha College, Kandy", program: "G.C.E. Advanced Level Examination", period: "2020", location: "Kandy, Sri Lanka", details: ["Combined Mathematics — A", "Physics — B", "Chemistry — B"] },
];

export type Leadership = { title: string; org: string; bullets: string[] };
export const leadership: Leadership[] = [
  { title: "CAREERFORGE Phase 2 — Program Team Leader", org: "IEEE Student Branch · Sabaragamuwa University of Sri Lanka", bullets: [
    "Led the planning and coordination of a professional development programme, organizing workshops, panel discussions, and mentorship sessions with academic and industry stakeholders.",
    "Strengthened leadership, event management, teamwork, and professional communication skills.",
  ] },
  { title: "PEARLHACK — Logistics Team Leader", org: "IEEE Student Branch · Sabaragamuwa University of Sri Lanka", bullets: [
    "Managed end-to-end event logistics, including resources, venues, technical arrangements, and stakeholder coordination to support smooth hackathon delivery.",
    "Applied organization, problem-solving, teamwork, and communication skills in a fast-paced environment.",
  ] },
];
export const extracurricular = [
  "Active member of the IEEE Student Branch of Sabaragamuwa University of Sri Lanka, contributing to technical and professional events.",
  "Active member of the Society of Computer Sciences at Sabaragamuwa University of Sri Lanka, participating in academic and collaborative student initiatives.",
];
