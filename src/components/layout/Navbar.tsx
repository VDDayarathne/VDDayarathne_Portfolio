"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X, Mail, ArrowRight } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";
import { motionTokens } from "@/lib/motion";
import Button from "@/components/ui/Button";

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
  const [hidden, setHidden] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const scrolledRef = useRef(false);
  const hiddenRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const directionStartRef = useRef(0);
  const directionRef = useRef<"up" | "down">("up");
  const toggleRef = useRef<HTMLButtonElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const next = y > 24;
      if (next !== scrolledRef.current) {
        scrolledRef.current = next;
        setScrolled(next);
      }

      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollable > 0 ? Math.min(1, y / scrollable) : 0);

      const delta = y - lastScrollYRef.current;
      const direction = delta > 1 ? "down" : delta < -1 ? "up" : directionRef.current;
      if (direction !== directionRef.current) {
        directionRef.current = direction;
        directionStartRef.current = y;
      }

      let nextHidden = hiddenRef.current;
      if (y < 120) {
        nextHidden = false;
      } else if (direction === "up" && directionStartRef.current - y > 10) {
        nextHidden = false;
      } else if (direction === "down" && y > 240 && y - directionStartRef.current > 54) {
        nextHidden = true;
      }

      if (nextHidden !== hiddenRef.current) {
        hiddenRef.current = nextHidden;
        setHidden(nextHidden);
      }
      lastScrollYRef.current = y;

    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const intersecting = new Map<string, HTMLElement>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          if (entry.isIntersecting) intersecting.set(element.id, element);
          else intersecting.delete(element.id);
        }
        const nearest = [...intersecting.values()].sort(
          (a, b) => Math.abs(a.getBoundingClientRect().top) - Math.abs(b.getBoundingClientRect().top),
        )[0];
        if (nearest) setActiveSection(nearest.id === "top" ? "" : nearest.id);
      },
      { rootMargin: "-15% 0px -65% 0px", threshold: 0 },
    );
    for (const id of ["top", ...links.map((link) => link.href.slice(1))]) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    const trigger = toggleRef.current;
    const logo = logoRef.current;
    const root = document.documentElement;
    restoreFocusRef.current = true;
    const previouslyLocked = root.classList.contains("noscroll");
    root.classList.add("noscroll");
    const desktop = window.matchMedia("(min-width: 1280px)");

    const focusFrame = window.requestAnimationFrame(() => {
      menu?.querySelector<HTMLAnchorElement>("nav a")?.focus({ preventScroll: true });
    });
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !menu) return;
      const focusable = menu.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex="0"]',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !menu.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !menu.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", closeOnDesktop);
      if (!previouslyLocked) root.classList.remove("noscroll");
      const focusTarget = desktop.matches ? logo : trigger;
      if (restoreFocusRef.current && focusTarget && document.contains(focusTarget)) {
        focusTarget.focus({ preventScroll: true });
      }
    };
  }, [open]);

  const revealNavbar = () => {
    hiddenRef.current = false;
    setHidden(false);
  };

  return (
    <>
      <div
        className="nav-reveal-zone"
        aria-hidden="true"
        onPointerEnter={revealNavbar}
      />
      <motion.header
      className="fixed inset-x-0 top-0 z-40 text-foreground"
      animate={{ y: hidden && !open ? "calc(-100% - 8px)" : "0%" }}
      transition={{
        duration: reducedMotion ? 0 : hidden ? 0.26 : 0.4,
        ease: hidden ? motionTokens.ease.standard : motionTokens.ease.reveal,
      }}
      onFocusCapture={revealNavbar}
    >
      <div className="site-container py-3 sm:py-4">
        <div
          data-intro=""
          style={{ "--intro-delay": "0.08s" } as CSSProperties}
          className={cn(
            "nav-shell relative flex min-h-14 items-center justify-between gap-5 transition-[background-color,border-color,box-shadow,padding]",
            scrolled
              ? "nav-shell--scrolled"
              : "nav-shell--top",
          )}
        >
          <a
            ref={logoRef}
            href="#top"
            data-cursor="nav"
            aria-label={`${profile.name}, back to top`}
            className="inline-flex min-h-11 items-center text-xl font-semibold tracking-tight"
          >
            VD<span className="text-accent">.</span><span className="nav-wordmark">Vishwa<br />Dayarathne</span>
          </a>

          <nav aria-label="Main navigation" className="hidden items-center gap-3 xl:flex 2xl:gap-5">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-cursor="nav"
                aria-current={activeSection === link.href.slice(1) ? "location" : undefined}
                className="nav-link flex min-h-11 items-center"
              >
                {activeSection === link.href.slice(1) && (
                  <motion.span
                    layoutId="desktop-nav-active"
                    className="nav-link-active"
                    transition={{ duration: reducedMotion ? 0 : 0.32, ease: motionTokens.ease.reveal }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            ))}
          </nav>

          <div className="nav-actions hidden items-center gap-1 xl:flex">
            <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="icon-button" data-cursor="button">
              <FaGithub size={17} aria-hidden="true" />
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="icon-button" data-cursor="button">
              <FaLinkedin size={17} aria-hidden="true" />
            </a>
            <Button href="#contact" variant="primary" className="ml-2 min-h-10 px-4 text-xs">
              Let&apos;s Talk <ArrowRight size={15} aria-hidden="true" />
            </Button>
          </div>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => {
              revealNavbar();
              setOpen((value) => !value);
            }}
            className="icon-button mobile-menu-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-haspopup="dialog"
            data-cursor="button"
          >
            {open ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>

          <span className="nav-progress-track" aria-hidden="true">
            <motion.span
              className="nav-progress-value"
              style={{ scaleX: scrollProgress }}
            />
          </span>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-navigation-title"
            data-lenis-prevent
            initial={reducedMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
            transition={{ duration: reducedMotion ? 0 : motionTokens.duration.normal, ease: motionTokens.ease.standard }}
            className="mobile-panel fixed inset-0 z-50 overflow-y-auto bg-background xl:hidden"
          >
            <div className="site-container pt-4 pb-8">
              <div className="surface rounded-lg border border-border p-5">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <p id="mobile-navigation-title" className="eyebrow text-muted">Navigation</p>
                  <button type="button" onClick={() => setOpen(false)} className="icon-button" aria-label="Close menu">
                    <X size={21} aria-hidden="true" />
                  </button>
                </div>
                <motion.nav
                  aria-label="Mobile navigation"
                  className="mt-3 flex flex-col"
                  initial={reducedMotion ? false : "closed"}
                  animate="open"
                  variants={{ open: { transition: { staggerChildren: reducedMotion ? 0 : 0.045, delayChildren: reducedMotion ? 0 : 0.06 } } }}
                >
                  {links.map((link) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      onClick={() => {
                        restoreFocusRef.current = false;
                        setOpen(false);
                      }}
                      aria-current={activeSection === link.href.slice(1) ? "location" : undefined}
                      className={cn(
                        "flex min-h-14 items-center justify-between rounded-md px-2 text-lg font-medium transition-colors hover:bg-background-elevated",
                        activeSection === link.href.slice(1) ? "text-accent" : "text-foreground",
                      )}
                      variants={reducedMotion ? undefined : {
                        closed: { opacity: 0, y: 10 },
                        open: { opacity: 1, y: 0, transition: { duration: motionTokens.duration.support, ease: motionTokens.ease.reveal } },
                      }}
                    >
                      {link.label}
                      <ArrowRight size={15} aria-hidden="true" />
                    </motion.a>
                  ))}
                </motion.nav>
                <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                  <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="icon-button">
                    <FaGithub size={20} aria-hidden="true" />
                  </a>
                  <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="icon-button">
                    <FaLinkedin size={20} aria-hidden="true" />
                  </a>
                  <a href={`mailto:${profile.email}`} aria-label="Email" className="icon-button">
                    <Mail size={20} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.header>
    </>
  );
}
