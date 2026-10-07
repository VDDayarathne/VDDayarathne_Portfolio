import { profile, stats } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal, { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import ScrollHandoff from "@/components/ui/ScrollHandoff";

export default function About() {
  return (
    <section id="about" className="section">
      <ScrollHandoff className="site-container">
        <SectionHeading index="01" eyebrow="About Me" title="Engineering software with intent." />
        <div className="section-content about-grid">
          <Reveal preset="major" className="about-aside">
            <p className="eyebrow">Behind the code</p>
            <p className="about-statement">Curious by nature.<br />Precise by practice.</p>
            <p className="meta">{profile.roles[0]}<br />{profile.roles[2]}</p>
            <dl className="about-facts">
              <div><dt>Based in</dt><dd>{profile.location}</dd></div>
              <div><dt>Currently</dt><dd>Associate Software Engineer at ZData Innovations</dd></div>
              <div><dt>Studying</dt><dd>BSc (Hons) Software Engineering, Sabaragamuwa University of Sri Lanka</dd></div>
              <div><dt>Core stack</dt><dd>Java · Spring Boot · React · Next.js · MySQL · MongoDB</dd></div>
            </dl>
          </Reveal>
          <div className="about-main">
            <Reveal preset="fade"><p className="body-copy about-summary">{profile.summary}</p></Reveal>
            <StaggerGroup className="stats-grid" stagger={0.045}>
              {stats.map((stat) => <StaggerItem key={stat.label} preset="fade"><dt className="meta">{stat.label}</dt><dd className="stat-number">{stat.value}</dd></StaggerItem>)}
            </StaggerGroup>
          </div>
        </div>
      </ScrollHandoff>
    </section>
  );
}
