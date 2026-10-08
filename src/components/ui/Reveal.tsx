"use client";

import { motion, useAnimationControls, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { createRevealVariants, motionTokens, type MotionPreset } from "@/lib/motion";

const compactQuery = "(max-width: 639px)";
const subscribeCompact = (callback: () => void) => {
  const query = window.matchMedia(compactQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const getCompactSnapshot = () => window.matchMedia(compactQuery).matches;
const compactDistance = (preset: MotionPreset) =>
  preset === "fade" ? 0 : ["major", "heading", "project", "intro"].includes(preset) ? 16 : 10;

function useRevealPlayback(reduced: boolean, amount: number, once = false) {
  const ref = useRef<HTMLDivElement & HTMLSpanElement>(null);
  const controls = useAnimationControls();
  const hasEntered = useRef(false);
  // Keep observing after the first entrance so content can prepare offscreen
  // and replay when a visitor scrolls through a section again.
  const visible = useInView(ref, { once: false, amount, margin: motionTokens.viewport.margin });
  useLayoutEffect(() => {
    // Never hide content already visible at a restored scroll position.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && ref.current && ref.current.getBoundingClientRect().top > innerHeight) {
      controls.set("prepared");
    }
  }, [controls]);
  useEffect(() => {
    if (reduced) {
      controls.set("show");
      return;
    }
    if (visible) {
      hasEntered.current = true;
      void controls.start("show");
    } else if (!once && hasEntered.current) {
      controls.set("prepared");
    }
  }, [controls, visible, reduced, once]);
  return [ref, controls] as const;
}

function useCompactMotion() {
  return useSyncExternalStore(subscribeCompact, getCompactSnapshot, () => true);
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "span";
  once?: boolean;
  preset?: MotionPreset;
  amount?: number;
};

export default function Reveal({
  children,
  className,
  delay = 0,
  y,
  as = "div",
  once = false,
  preset = "support",
  amount = motionTokens.viewport.amount,
}: RevealProps) {
  const reduced = useReducedMotion() === true;
  const compact = useCompactMotion();
  const [ref, controls] = useRevealPlayback(reduced, amount, once);
  const Component = as === "span" ? motion.span : motion.div;
  return (
    <Component
      initial={false}
      ref={ref}
      animate={controls}
      variants={createRevealVariants({ reduced, delay, preset, distance: y ?? (compact ? compactDistance(preset) : undefined) })}
      className={cn("reveal", `reveal--${preset}`, className)}
    >
      {children}
    </Component>
  );
}

export function IntroReveal({
  children,
  className,
  delay = 0,
  preset = "intro",
  as = "div",
}: Pick<RevealProps, "children" | "className" | "delay" | "preset" | "as">) {
  const Component = as === "span" ? "span" : "div";
  const style = { "--intro-delay": `${delay}s` } as CSSProperties;
  return (
    <Component
      data-intro=""
      style={style}
      className={cn("intro-reveal", `reveal--${preset}`, className)}
    >
      {children}
    </Component>
  );
}

export function StaggerGroup({
  children,
  className,
  stagger = motionTokens.stagger.normal,
  delay = 0,
  amount = motionTokens.viewport.amount,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  amount?: number;
}) {
  const reduced = useReducedMotion() === true;
  const compact = useCompactMotion();
  const [ref, controls] = useRevealPlayback(reduced, amount);
  return (
    <motion.div
      initial={false}
      ref={ref}
      animate={controls}
      variants={{ prepared: {}, show: { transition: {
        delayChildren: reduced ? 0 : delay,
        staggerChildren: reduced ? 0 : (compact ? Math.min(stagger, 0.045) : stagger),
      } } }}
      className={cn("stagger-group", className)}
    >
      {children}
    </motion.div>
  );
}

export function IntroStagger({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const style = { "--intro-delay": `${delay}s` } as CSSProperties;
  return (
    <div
      data-intro-stagger=""
      style={style}
      className={cn("intro-stagger", className)}
    >
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className,
  preset = "support",
}: {
  children: ReactNode;
  className?: string;
  preset?: MotionPreset;
}) {
  const reduced = useReducedMotion() === true;
  const compact = useCompactMotion();
  return (
    <motion.div
      variants={createRevealVariants({ reduced, preset, distance: compact ? compactDistance(preset) : undefined })}
      className={cn("stagger-item", `reveal--${preset}`, className)}
    >
      {children}
    </motion.div>
  );
}
