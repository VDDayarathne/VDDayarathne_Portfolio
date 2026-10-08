"use client";

import { motion, scroll, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { handoffTokens, type HandoffPreset } from "@/lib/motion";

export default function ScrollHandoff({
  children,
  className,
  preset = "section",
  direction = 1,
}: {
  children: ReactNode;
  className?: string;
  preset?: HandoffPreset;
  direction?: 1 | -1;
}) {
  const target = useRef<HTMLDivElement>(null);
  const values = handoffTokens[preset];
  const scrollYProgress = useMotionValue(values.input[1]);
  useEffect(() => {
    const element = target.current;
    if (!element) return;
    const enabled = window.matchMedia("(min-width: 640px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let stop: (() => void) | undefined;
    const configure = () => {
      stop?.();
      stop = undefined;
      if (!enabled.matches) {
        scrollYProgress.set(values.input[1]);
        return;
      }
      stop = scroll((progress: number) => scrollYProgress.set(progress), {
        target: element,
        offset: preset === "hero" ? ["start start", "end start"] : ["start 92%", "end 8%"],
      });
    };
    enabled.addEventListener("change", configure);
    configure();
    return () => { stop?.(); enabled.removeEventListener("change", configure); };
  }, [preset, scrollYProgress, values]);
  const opacity = useTransform(scrollYProgress, values.input, values.opacity);
  const y = useTransform(scrollYProgress, values.input, values.y);
  const x = useTransform(scrollYProgress, values.input, values.x.map((value) => value * direction));

  return (
    <motion.div
      ref={target}
      data-scroll-handoff={preset}
      className={cn("scroll-handoff", `scroll-handoff--${preset}`, className)}
      style={{ opacity, x, y }}
    >
      {children}
    </motion.div>
  );
}
