import { ArrowUpRight } from "lucide-react";
import { projects } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

export default function Projects() {
  return (
    <section id="projects" className="section">
      <div className="site-container">
        <SectionHeading index="03" eyebrow="Selected Work" title="Ideas into working software."
          description="Independent and collaborative builds. Backend architecture, full-stack products, and applied AI." />
        <div className="section-content project-list">
          {projects.map((project, index) => (
            <Reveal key={project.title}>
              <article className={"project-row" + (index === 0 ? " project-featured" : "")}>
                <div className="project-identity">
                  <p className="project-kicker"><span className="row-index">0{index + 1}</span><span className="eyebrow">{project.tag}</span></p>
                  <h3 className="project-title">{project.title}</h3>
                  <p className="meta">{project.role}</p>
                </div>
                <div className="project-detail">
                  <p className="body-copy">{project.description}</p>
                  <ul className="project-tools" aria-label="Technologies">{project.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
                  <div className="project-links">
                    {project.links?.filter((link) => link.url === "#").map((link) => <span key={link.label} className="project-unavailable meta" title="Repository URL not provided">{link.label} <span aria-hidden="true">—</span></span>)}
                    {project.links?.filter((link) => link.url !== "#").map((link) => <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="text-link">{link.label}<ArrowUpRight size={17} aria-hidden="true" /></a>)}
                    {!project.links?.some((link) => link.url !== "#") && <a className="text-link" href="#contact">Discuss this project <ArrowUpRight size={17} aria-hidden="true" /></a>}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
