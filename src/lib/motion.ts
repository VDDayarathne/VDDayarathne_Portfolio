import type { Transition, Variants } from "framer-motion";

/** Shared timing keeps content motion quieter than the background sequence. */
export const motionTokens = {
  duration: { fast: 0.18, normal: 0.25, reveal: 0.45 },
  distance: 12,
  stagger: 0.06,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  spring: { stiffness: 240, damping: 28, mass: 0.5 },
} as const;

export const interactionTransition: Transition = {
  duration: motionTokens.duration.normal,
  ease: motionTokens.ease,
};

export const revealTransition: Transition = {
  duration: motionTokens.duration.reveal,
  ease: motionTokens.ease,
};

/** Keyframes reveal on entry while the server-rendered content remains visible. */
export function createRevealVariants({
  reduced = false,
  delay = 0,
  distance = motionTokens.distance,
}: {
  reduced?: boolean;
  delay?: number;
  distance?: number;
} = {}): Variants {
  return {
    hidden: { opacity: 1, y: 0 },
    show: reduced
      ? { opacity: 1, y: 0, transition: { duration: 0, delay: 0 } }
      : {
          opacity: [0, 1],
          y: [distance, 0],
          transition: { ...revealTransition, delay },
        },
  };
}

export const revealVariants = createRevealVariants();
