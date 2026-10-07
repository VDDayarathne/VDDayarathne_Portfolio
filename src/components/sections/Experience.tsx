import { experience } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

export default function Experience() {
  return (
    <section id="experience" className="section">
      <div className="site-container">
        <SectionHeading index="02" eyebrow="Experience" title="Built in the real world."
          description="Production experience across FinTech and banking domains — a path of growing ownership and craft." />
        <ol className="section-content experience-list">
          {experience.map((job, index) => (
            <li key={job.company + job.period}><Reveal>
              <article className="experience-row">
                <div className="experience-meta"><span className="row-index" aria-hidden="true">0{index + 1}</span><p className="meta">{job.period}</p>{job.current && <span className="current-status">Current role</span>}</div>
                <div className="experience-detail"><p className="eyebrow">{job.company}</p><h3 className="experience-title">{job.role}</h3><p className="meta">{job.location}</p>
                  <ul className="detail-list mt-6">{job.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
                </div>
              </article>
            </Reveal></li>
          ))}
        </ol>
      </div>
    </section>
  );
}
