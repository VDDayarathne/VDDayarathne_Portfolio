"use client";

import { motion, useReducedMotion, useScroll, useTransform, type UseScrollOptions } from "framer-motion";
import { useRef, type ReactNode } from "react";
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
  const reduced = useReducedMotion() === true;
  const offsets: UseScrollOptions["offset"] = preset === "hero"
    ? ["start start", "end start"]
    : ["start 92%", "end 8%"];
  const { scrollYProgress } = useScroll({ target, offset: offsets });
  const values = handoffTokens[preset];
  const opacity = useTransform(scrollYProgress, values.input, values.opacity);
  const y = useTransform(scrollYProgress, values.input, values.y);
  const scale = useTransform(scrollYProgress, values.input, values.scale);
  const x = useTransform(scrollYProgress, values.input, values.x.map((value) => value * direction));

  return (
    <motion.div
      ref={target}
      data-scroll-handoff={preset}
      className={cn("scroll-handoff", `scroll-handoff--${preset}`, className)}
      style={reduced ? undefined : { opacity, x, y, scale }}
    >
      {children}
    </motion.div>
  );
}
