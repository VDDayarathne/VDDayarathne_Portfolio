"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { createRevealVariants, motionTokens } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "span";
  once?: boolean;
};

export default function Reveal({
  children,
  className,
  delay = 0,
  y = motionTokens.distance,
  as = "div",
  once = true,
}: RevealProps) {
  const reduced = useReducedMotion() === true;
  const Component = as === "span" ? motion.span : motion.div;

  return (
    <Component
      initial={false}
      whileInView="show"
      viewport={{ once, amount: 0.15 }}
      variants={createRevealVariants({ reduced, delay, distance: y })}
      className={cn("reveal", className)}
    >
      {children}
    </Component>
  );
}

export function StaggerGroup({
  children,
  className,
  stagger = motionTokens.stagger,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduced = useReducedMotion() === true;

  return (
    <motion.div
      initial={false}
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        show: { transition: { staggerChildren: reduced ? 0 : stagger } },
      }}
      className={cn("stagger-group", className)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = motionTokens.distance,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const reduced = useReducedMotion() === true;

  return (
    <motion.div
      variants={createRevealVariants({ reduced, distance: y })}
      className={cn("stagger-item", className)}
    >
      {children}
    </motion.div>
  );
}

export const baseVariants: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: [0, 1], transition: { duration: motionTokens.duration.reveal } },
};
