"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { interactionTransition } from "@/lib/motion";

export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={interactionTransition}>
      {children}
    </MotionConfig>
  );
}
