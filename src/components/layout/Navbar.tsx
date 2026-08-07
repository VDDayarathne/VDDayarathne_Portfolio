"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Mail } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";

const links = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#education", label: "Education" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("noscroll", open);
    return () => document.documentElement.classList.remove("noscroll");
  }, [open]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-40 transition-all duration-300",
        scrolled ? "py-3" : "py-6"
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className={cn(
            "flex items-center justify-between rounded-full px-4 sm:px-6 py-3 transition-all duration-300",
            scrolled ? "glass-panel shadow-lg shadow-black/20" : "bg-transparent"
          )}
        >
          <a
            href="#top"
            data-cursor-hover
            className="font-display text-lg font-semibold tracking-tight"
          >
            VD<span className="text-accent-2">.</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-cursor-hover
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              data-cursor-hover
              aria-label="GitHub"
              className="text-muted hover:text-foreground transition-colors"
            >
              <FaGithub size={18} />
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              data-cursor-hover
              aria-label="LinkedIn"
              className="text-muted hover:text-foreground transition-colors"
            >
              <FaLinkedin size={18} />
            </a>
            <a
              href="#contact"
              data-cursor-hover
              className="rounded-full bg-foreground text-background px-5 py-2 text-sm font-medium hover:bg-accent-2 transition-colors"
            >
              Let&apos;s Talk
            </a>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden text-foreground"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="md:hidden mx-4 mt-2 glass-panel rounded-3xl p-6"
          >
            <nav className="flex flex-col gap-5">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-lg text-foreground/90"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-6 flex items-center gap-5 border-t border-border pt-5">
              <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                <FaGithub size={20} />
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <FaLinkedin size={20} />
              </a>
              <a href={`mailto:${profile.email}`} aria-label="Email">
                <Mail size={20} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
