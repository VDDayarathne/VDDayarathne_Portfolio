import { ArrowDown, ArrowUpRight, Download } from "lucide-react";
import { profile } from "@/data/profile";
import Button from "@/components/ui/Button";
import { IntroReveal, IntroStagger, StaggerItem } from "@/components/ui/Reveal";
import ScrollHandoff from "@/components/ui/ScrollHandoff";

export default function Hero() {
  const [firstName, ...lastName] = profile.name.split(" ");
  return (
    <section id="top" aria-label="Introduction" className="hero">
      <ScrollHandoff preset="hero" className="site-container hero-inner">
        <IntroReveal preset="fade" delay={0.18} className="hero-meta eyebrow">
          <span>Software Engineer / Full-Stack Developer</span>
          <span className="hero-location">{profile.location}</span>
        </IntroReveal>
        <div className="hero-heading">
          <IntroReveal preset="support" delay={0.28} className="hero-intro">
            Thoughtful code. Lasting impact.
          </IntroReveal>
          <h1 className="hero-title">
            <span className="hero-title-mask">
              <IntroReveal as="span" preset="intro" delay={0.34}>{firstName}</IntroReveal>
            </span>
            <span className="hero-title-mask">
              <IntroReveal as="span" preset="intro" delay={0.42}>{lastName.join(" ")}<span className="name-period">.</span></IntroReveal>
            </span>
          </h1>
        </div>
        <div className="hero-copy">
          <IntroReveal preset="support" delay={0.56}>
            <p className="body-copy">{profile.tagline}</p>
          </IntroReveal>
          <IntroReveal preset="support" delay={0.66} className="hero-actions">
            <Button href="#projects">Explore my work <ArrowUpRight size={18} aria-hidden="true" /></Button>
            <Button href={profile.resumeUrl} target="_blank" rel="noreferrer" variant="ghost">Download CV <Download size={16} aria-hidden="true" /></Button>
          </IntroReveal>
        </div>
        <IntroStagger delay={0.76} className="hero-bottom">
          <StaggerItem preset="fade"><div><p className="availability"><span aria-hidden="true" />Available for opportunities</p><p className="meta">{profile.roles[1]} · ZData Innovations</p></div></StaggerItem>
          <StaggerItem preset="fade"><a href="#about" data-cursor="nav" className="scroll-cue" aria-label="Scroll to about section"><span>Scroll to discover</span><ArrowDown size={18} aria-hidden="true" /></a></StaggerItem>
          <StaggerItem preset="fade"><span className="hero-edition eyebrow">Personal portfolio / 2026</span></StaggerItem>
        </IntroStagger>
      </ScrollHandoff>
    </section>
  );
}
