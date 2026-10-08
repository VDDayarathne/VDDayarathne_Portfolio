import { ArrowUpRight } from "lucide-react";
import { projects } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal, { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import ScrollHandoff from "@/components/ui/ScrollHandoff";

export default function Projects() {
  return (
    <section id="projects" className="section">
      <ScrollHandoff className="site-container">
        <SectionHeading index="03" eyebrow="Selected Work" title="Ideas turned into useful software."
          description="Collaborative projects that demonstrate practical problem-solving, ownership, and contribution across the development lifecycle." />
        <div className="section-content project-list">
          {projects.map((project, index) => (
            <ScrollHandoff key={project.title} preset="project" direction={index % 2 === 0 ? 1 : -1}>
            <Reveal preset={index === 0 ? "project" : "card"}>
              <article className={"project-row" + (index === 0 ? " project-featured" : "")} data-cursor="project">
                <StaggerGroup className="project-motion-grid" stagger={0.055}>
                <StaggerItem preset="support" className="project-identity">
                  <p className="project-kicker"><span className="row-index">0{index + 1}</span><span className="eyebrow">{project.tag}</span></p>
                  <h3 className="project-title">{project.title}</h3>
                  <p className="meta">{project.role}</p>
                </StaggerItem>
                <StaggerItem preset="fade" className="project-detail">
                  <p className="body-copy">{project.description}</p>
                  <ul className="project-tools" aria-label="Technologies">{project.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
                  <div className="project-links">
                    {project.links?.filter((link) => link.url === "#").map((link) => <span key={link.label} className="project-unavailable meta" title="Repository URL not provided">{link.label} <span aria-hidden="true">—</span></span>)}
                    {project.links?.filter((link) => link.url !== "#").map((link) => <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="text-link">{link.label}<ArrowUpRight size={17} aria-hidden="true" /></a>)}
                    {!project.links?.some((link) => link.url !== "#") && <a className="text-link" href="#contact">Discuss this project <ArrowUpRight size={17} aria-hidden="true" /></a>}
                  </div>
                </StaggerItem>
                </StaggerGroup>
              </article>
            </Reveal>
            </ScrollHandoff>
          ))}
        </div>
      </ScrollHandoff>
    </section>
  );
}
