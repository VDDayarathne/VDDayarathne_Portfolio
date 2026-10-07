import { ArrowDown, ArrowUpRight, Download } from "lucide-react";
import { profile } from "@/data/profile";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";

export default function Hero() {
  const [firstName, ...lastName] = profile.name.split(" ");
  return (
    <section id="top" aria-label="Introduction" className="hero">
      <div className="site-container hero-inner">
        <div className="hero-meta eyebrow">
          <span>Software Engineer / Full-Stack Developer</span>
          <span className="hero-location">{profile.location}</span>
        </div>
        <Reveal className="hero-heading" y={18}>
          <p className="hero-intro">Thoughtful code. Lasting impact.</p>
          <h1 className="hero-title"><span>{firstName}</span><span>{lastName.join(" ")}<span className="name-period">.</span></span></h1>
        </Reveal>
        <Reveal delay={0.08} className="hero-copy">
          <p className="body-copy">{profile.tagline}</p>
          <div className="hero-actions">
            <Button href="#projects">Explore my work <ArrowUpRight size={18} aria-hidden="true" /></Button>
            <Button href={profile.resumeUrl} target="_blank" rel="noreferrer" variant="ghost">Download CV <Download size={16} aria-hidden="true" /></Button>
          </div>
        </Reveal>
        <div className="hero-bottom">
          <div><p className="availability"><span aria-hidden="true" />Available for opportunities</p><p className="meta">{profile.roles[1]} · ZData Innovations</p></div>
          <a href="#about" className="scroll-cue" aria-label="Scroll to about section"><span>Scroll to discover</span><ArrowDown size={18} aria-hidden="true" /></a>
          <span className="hero-edition eyebrow">Personal portfolio / 2026</span>
        </div>
      </div>
    </section>
  );
}
