"use client";

import { useState } from "react";
import { skills, softSkills } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

const categories = ["All", ...skills.map((group) => group.category)];
const allSkills = skills.flatMap((group) => group.skills.map((skill) => ({ skill, category: group.category })));

export default function Skills() {
  const [active, setActive] = useState("All");
  const visible = active === "All" ? allSkills : allSkills.filter((item) => item.category === active);

  return (
    <section id="skills" className="section">
      <div className="site-container">
        <SectionHeading index="04" eyebrow="Skills" title="My technical toolkit."
          description="Languages, frameworks, and tools I use to take products from idea to production — tap a category to filter." />
        <Reveal className="section-content">
          <div className="skills-filter" role="group" aria-label="Filter technical skills">
            {categories.map((category) => (
              <button key={category} type="button" aria-pressed={active === category} aria-controls="technical-skills"
                onClick={() => setActive(category)}>{category}</button>
            ))}
          </div>
          <p className="meta mt-5" role="status" aria-live="polite">{visible.length} skills · {active === "All" ? "All categories" : active}</p>
          <div id="technical-skills" className="skill-groups" aria-label={`${active} technical skills`}>
            {skills.filter((group) => active === "All" || group.category === active).map((group) => (
              <div key={group.category} className="skill-group">
                <h3 className="eyebrow">{group.category}</h3>
                <ul className="skills-list">{group.skills.map((skill) => <li key={skill} className="skill-item">{skill}</li>)}</ul>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal className="work-principles mt-10 border-t border-border pt-8">
          <h3 className="card-title">How I work</h3>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Professional skills">
            {softSkills.map((skill) => <li key={skill} className="tag">{skill}</li>)}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
