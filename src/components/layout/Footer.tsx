import { ArrowUpRight } from "lucide-react";
import { profile } from "@/data/profile";
import Reveal from "@/components/ui/Reveal";
import ScrollHandoff from "@/components/ui/ScrollHandoff";

export default function Footer() {
  return (
    <footer id="footer" className="relative border-t border-border bg-background-elevated text-foreground">
      <ScrollHandoff preset="footer" className="site-container">
        <Reveal preset="major" className="footer-top">
          <p className="footer-signature">Vishwa Dayarathne<span className="text-accent">.</span></p>
          <a href="#top" data-cursor="nav" className="text-link shrink-0">Back to top <ArrowUpRight size={18} aria-hidden="true" /></a>
        </Reveal>
        <Reveal preset="fade" delay={0.08} className="footer-bottom">
          <p className="meta">© {new Date().getFullYear()} {profile.name} · Colombo, Sri Lanka</p>
          <nav aria-label="Footer links" className="footer-links">
            <a href={profile.github} target="_blank" rel="noreferrer" className="text-link">GitHub <ArrowUpRight size={14} aria-hidden="true" /></a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-link">LinkedIn <ArrowUpRight size={14} aria-hidden="true" /></a>
            <a href={`mailto:${profile.email}`} className="text-link">Email <ArrowUpRight size={14} aria-hidden="true" /></a>
          </nav>
        </Reveal>
      </ScrollHandoff>
    </footer>
  );
}
