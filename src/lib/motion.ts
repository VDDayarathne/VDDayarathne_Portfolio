import type { Transition, Variants } from "framer-motion";

export type MotionPreset =
  | "fade"
  | "support"
  | "major"
  | "heading"
  | "card"
  | "project"
  | "intro";

export type HandoffPreset = "hero" | "section" | "row" | "project" | "closing" | "footer";

/** One foreground motion language, intentionally quieter than the canvas sequence. */
export const motionTokens = {
  duration: {
    fast: 0.16,
    normal: 0.28,
    fade: 0.42,
    support: 0.54,
    reveal: 0.62,
    major: 0.82,
    intro: 0.82,
  },
  distance: { subtle: 8, support: 16, major: 24, heading: 30 },
  stagger: { tight: 0.045, normal: 0.065, intro: 0.075 },
  ease: {
    standard: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    reveal: [0.22, 1, 0.36, 1] as [number, number, number, number],
    exit: [0.4, 0, 1, 1] as [number, number, number, number],
  },
  viewport: { amount: 0.12, margin: "0px 0px -8% 0px" as const },
  spring: { stiffness: 300, damping: 30, mass: 0.45 },
} as const;

/** Scroll-linked emphasis values stay intentionally shallow beside the animated canvas. */
export const handoffTokens: Record<HandoffPreset, {
  input: number[];
  opacity: number[];
  y: number[];
  scale: number[];
  x: number[];
}> = {
  hero: {
    input: [0, 0.18, 0.76, 1],
    opacity: [1, 1, 0.86, 0.68],
    y: [0, 0, -7, -16],
    scale: [1, 1, 0.997, 0.992],
    x: [0, 0, 0, 0],
  },
  section: {
    input: [0, 0.16, 0.78, 1],
    opacity: [0.84, 1, 1, 0.82],
    y: [16, 0, 0, -12],
    scale: [0.997, 1, 1, 0.997],
    x: [0, 0, 0, 0],
  },
  row: {
    input: [0, 0.2, 0.76, 1],
    opacity: [0.76, 1, 1, 0.78],
    y: [12, 0, 0, -8],
    scale: [0.998, 1, 1, 0.998],
    x: [0, 0, 0, 0],
  },
  project: {
    input: [0, 0.22, 0.74, 1],
    opacity: [0.7, 1, 1, 0.72],
    y: [16, 0, 0, -10],
    scale: [0.994, 1, 1, 0.996],
    x: [8, 0, 0, -5],
  },
  closing: {
    input: [0, 0.14, 0.84, 1],
    opacity: [0.8, 1, 1, 0.9],
    y: [20, 0, 0, -6],
    scale: [0.996, 1, 1, 0.999],
    x: [0, 0, 0, 0],
  },
  footer: {
    input: [0, 0.24, 1],
    opacity: [0.78, 1, 1],
    y: [14, 0, 0],
    scale: [0.998, 1, 1],
    x: [0, 0, 0],
  },
};

export const interactionTransition: Transition = {
  duration: motionTokens.duration.normal,
  ease: motionTokens.ease.standard,
};

const presetConfig: Record<MotionPreset, {
  distance: number;
  duration: number;
  scale?: number;
  clip?: boolean;
}> = {
  fade: { distance: 0, duration: motionTokens.duration.fade },
  support: { distance: motionTokens.distance.support, duration: motionTokens.duration.support },
  major: { distance: motionTokens.distance.major, duration: motionTokens.duration.major },
  heading: { distance: motionTokens.distance.heading, duration: motionTokens.duration.major, clip: true },
  card: { distance: motionTokens.distance.support, duration: motionTokens.duration.reveal, scale: 0.992 },
  project: { distance: motionTokens.distance.major, duration: motionTokens.duration.major, scale: 0.994 },
  intro: { distance: motionTokens.distance.major, duration: motionTokens.duration.intro },
};

/**
 * Keyframed show values keep content visible in server HTML while still
 * animating after hydration. Intro elements use `prepared` while fonts settle.
 */
export function createRevealVariants({
  reduced = false,
  delay = 0,
  preset = "support",
  distance,
}: {
  reduced?: boolean;
  delay?: number;
  preset?: MotionPreset;
  distance?: number;
} = {}): Variants {
  const config = presetConfig[preset];
  const travel = distance ?? config.distance;
  return {
    prepared: {
      opacity: reduced ? 1 : 0,
      y: reduced ? 0 : travel,
      scale: reduced ? 1 : (config.scale ?? 1),
      clipPath: config.clip && !reduced ? "inset(0 0 100% 0)" : "inset(0 0 0% 0)",
    },
    show: reduced
      ? { opacity: 1, y: 0, scale: 1, clipPath: "inset(0 0 0% 0)", transition: { duration: 0 } }
      : {
          opacity: [0, 1],
          y: [travel, 0],
          scale: config.scale ? [config.scale, 1] : 1,
          clipPath: config.clip
            ? ["inset(0 0 100% 0)", "inset(0 0 0% 0)"]
            : "inset(0 0 0% 0)",
          transition: {
            duration: config.duration,
            delay,
            ease: motionTokens.ease.reveal,
          },
        },
  };
}
