"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });

  useEffect(() => {
    // Deliberate mount-only client capability check (fine pointer + no
    // reduced-motion). Runs after hydration so the SSR/client markup
    // matches on first paint; the cursor then fades in via `visible`.
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(fine && !reduced);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("cursor-none", enabled);
    return () => document.documentElement.classList.remove("cursor-none");
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const move = (e: MouseEvent) => {
      x.set(e.clientX - 16);
      y.set(e.clientY - 16);
      if (!visible) setVisible(true);
    };
    const over = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setHovering(!!target.closest("a, button, [data-cursor-hover]"));
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  if (!enabled) return null;

  return (
    <motion.div
      style={{ translateX: springX, translateY: springY }}
      animate={{ scale: hovering ? 2.2 : 1, opacity: visible ? 1 : 0 }}
      transition={{ scale: { type: "spring", stiffness: 300, damping: 20 } }}
      className="pointer-events-none fixed left-0 top-0 z-[100] h-8 w-8 rounded-full bg-white mix-blend-difference"
    />
  );
}
