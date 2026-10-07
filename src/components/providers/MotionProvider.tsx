"use client";

import { MotionConfig } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { interactionTransition } from "@/lib/motion";

declare global {
  interface Window { __portfolioMotion?: boolean }
}

export default function MotionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.__portfolioMotion !== true) return;
    let disposed = false;
    const start = () => {
      if (disposed) return;
      document.documentElement.classList.add("motion-started");
    };
    const fallback = window.setTimeout(start, 420);
    void document.fonts.ready.then(() => {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        window.clearTimeout(fallback);
        start();
      }));
    });
    return () => {
      disposed = true;
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user" transition={interactionTransition}>
      {children}
    </MotionConfig>
  );
}
