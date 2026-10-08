"use client";

import { GraduationCap, Users, BookOpen, type LucideIcon } from "lucide-react";
import {
  education,
  leadership,
  extracurricular,
  type Education as EducationEntry,
  type Leadership,
} from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import ScrollHandoff from "@/components/ui/ScrollHandoff";

export default function Education() {
  return (
    <section id="education" className="section">
      <ScrollHandoff className="site-container">
        <SectionHeading
          index="05"
          eyebrow="Education & Leadership"
          title="A foundation for continuous growth."
          description="Completed degree requirements supported by leadership and volunteering experience in collaborative student initiatives."
        />

        <div className="section-content education-grid grid items-start gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-8">
            <div>
              <SubHeading icon={GraduationCap} label="Education" />
              <div className="mt-5 space-y-4">
                {education.map((edu) => (
                  <Reveal key={edu.school} preset="card">
                    <EducationCard edu={edu} />
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal preset="support">
              <div className="education-note">
                <SubHeading icon={BookOpen} label="Extracurricular" />
                <ul className="detail-list body-copy mt-5">
                  {extracurricular.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </Reveal>
          </div>

          <div>
            <SubHeading icon={Users} label="Leadership & Volunteering" />
            <div className="mt-5 space-y-4">
              {leadership.map((role) => (
                <Reveal key={role.title} preset="card">
                  <LeadershipCard role={role} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </ScrollHandoff>
    </section>
  );
}

function SubHeading({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <h3 className="flex items-center gap-3 text-base font-semibold leading-relaxed text-foreground">
      <span className="icon-tile shrink-0"><Icon size={17} aria-hidden="true" /></span>
      {label}
    </h3>
  );
}

function EducationCard({ edu }: { edu: EducationEntry }) {
  return (
    <article className="education-entry">
      <p className="meta">{edu.period}</p>
      <h4 className="card-title mt-3">{edu.school}</h4>
      <p className="body-copy mt-2">{edu.program}</p>
      <p className="meta mt-2">{edu.location}</p>
      {edu.details && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {edu.details.map((detail) => <li key={detail} className="tag">{detail}</li>)}
        </ul>
      )}
    </article>
  );
}

function LeadershipCard({ role }: { role: Leadership }) {
  return (
    <article className="education-entry">
      <h4 className="card-title">{role.title}</h4>
      <p className="meta mt-2">{role.org}</p>
      <ul className="detail-list body-copy mt-5">
        {role.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
      </ul>
    </article>
  );
}
