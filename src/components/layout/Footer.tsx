import { Mail, ArrowUpRight } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { profile } from "@/data/profile";

export default function Footer() {
  return (
    <footer id="footer" className="relative border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <p className="font-display text-lg font-semibold">
            {profile.name}
            <span className="text-accent-2">.</span>
          </p>
          <p className="text-sm text-muted mt-1">
            {new Date().getFullYear()} · Built with Next.js, Framer Motion &amp; Spline.
          </p>
        </div>

        <div className="flex items-center gap-5">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="text-muted hover:text-foreground transition-colors"
          >
            <FaGithub size={18} />
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="text-muted hover:text-foreground transition-colors"
          >
            <FaLinkedin size={18} />
          </a>
          <a
            href={`mailto:${profile.email}`}
            aria-label="Email"
            className="text-muted hover:text-foreground transition-colors"
          >
            <Mail size={18} />
          </a>
        </div>

        <a
          href="#top"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
        >
          Back to top <ArrowUpRight size={14} />
        </a>
      </div>
    </footer>
  );
}
