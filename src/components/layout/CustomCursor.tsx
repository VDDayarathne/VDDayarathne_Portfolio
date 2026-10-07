"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/** Original white difference-blend cursor, with demand-driven spring motion. */
export default function CustomCursor() {
  const cursor = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });

  useEffect(() => {
    const element = cursor.current;
    if (!element) return;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let listening = false;
    let visible = false;
    const hide = () => {
      visible = false;
      element.dataset.visible = "false";
      document.documentElement.classList.remove("cursor-active");
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") { hide(); return; }
      x.set(event.clientX - 16);
      y.set(event.clientY - 16);
      if (!visible) {
        springX.jump(event.clientX - 16);
        springY.jump(event.clientY - 16);
        element.dataset.visible = "true";
        document.documentElement.classList.add("cursor-active");
        visible = true;
      }
    };
    const over = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      element.dataset.hover = String(Boolean(target.closest('a[href], button:not(:disabled), [data-cursor-hover]')));
      element.dataset.text = String(Boolean(target.closest('input, textarea, [contenteditable="true"]')));
    };
    const key = (event: KeyboardEvent) => { if (event.key === "Tab") hide(); };
    const visibility = () => { if (document.hidden) hide(); };
    const detach = () => {
      hide();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      window.removeEventListener("keydown", key);
      document.removeEventListener("visibilitychange", visibility);
      listening = false;
    };
    const configure = () => {
      if (listening) detach();
      if (!fine.matches || reduced.matches) { hide(); return; }
      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("pointerover", over, { passive: true });
      document.documentElement.addEventListener("pointerleave", hide);
      window.addEventListener("blur", hide);
      window.addEventListener("keydown", key);
      document.addEventListener("visibilitychange", visibility);
      listening = true;
    };
    configure();
    fine.addEventListener("change", configure);
    reduced.addEventListener("change", configure);
    return () => {
      detach();
      fine.removeEventListener("change", configure);
      reduced.removeEventListener("change", configure);
    };
  }, [x, y, springX, springY]);

  return <motion.div ref={cursor} aria-hidden="true" data-custom-cursor="" className="custom-cursor" style={{ x: springX, y: springY }}><span /></motion.div>;
}
