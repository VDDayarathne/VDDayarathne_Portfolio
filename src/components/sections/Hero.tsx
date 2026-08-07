"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Download } from "lucide-react";
import { profile } from "@/data/profile";
import MagneticButton from "@/components/ui/MagneticButton";
import HeroPortrait from "./HeroPortrait";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[100svh] flex items-center overflow-hidden pt-28 pb-16"
    >
      <div className="mx-auto max-w-6xl px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10 items-center">
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-mono text-sm uppercase tracking-[0.3em] text-accent-2"
            >
              Colombo, Sri Lanka · Available for opportunities
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-6 font-hero font-semibold tracking-tight text-[clamp(3rem,9vw,7.5rem)] leading-[0.92]"
            >
              <span className="block">{profile.name.split(" ")[0]}</span>
              <span className="block text-gradient drop-shadow-[0_0_60px_rgba(139,92,246,0.35)]">
                {profile.name.split(" ")[1]}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-6 max-w-xl text-lg sm:text-xl text-muted leading-relaxed"
            >
              {profile.tagline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <MagneticButton href="#projects" className="bg-foreground text-background hover:bg-accent-2">
                View My Work <ArrowUpRight size={16} />
              </MagneticButton>
              <MagneticButton
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="glass-panel text-foreground hover:border-accent-2/60"
              >
                Resume <Download size={16} />
              </MagneticButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="mt-16 flex flex-wrap gap-x-10 gap-y-4 text-sm text-muted"
            >
              {profile.roles.map((role) => (
                <div key={role} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-2" />
                  {role}
                </div>
              ))}
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <HeroPortrait />
          </div>
        </div>
      </div>

      <motion.a
        href="#about"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted hover:text-foreground transition-colors"
        aria-label="Scroll to about section"
      >
        <ArrowDown size={22} />
      </motion.a>
    </section>
  );
}
