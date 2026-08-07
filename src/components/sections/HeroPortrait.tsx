"use client";

import { useRef, type MouseEvent } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { profile } from "@/data/profile";

export default function HeroPortrait() {
  const ref = useRef<HTMLDivElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 18, mass: 0.6 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 18, mass: 0.6 });

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 16);
    rotateX.set(py * -16);
  }

  function handleLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-xs sm:max-w-sm [perspective:1200px]"
    >
      <div aria-hidden className="pointer-events-none absolute -inset-10 -z-10">
        <div className="absolute left-1/2 top-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/25 blur-[90px]" />
        <div className="absolute bottom-0 right-2 h-56 w-56 rounded-full bg-accent-2/20 blur-[80px]" />
      </div>

      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        animate={{ y: [0, -10, 0] }}
        transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
        style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: "preserve-3d" }}
        className="group relative aspect-[2/3] w-full"
      >
        <div
          className="absolute inset-0 overflow-hidden rounded-[2rem]"
          style={{
            maskImage: "radial-gradient(120% 105% at 50% 32%, black 58%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(120% 105% at 50% 32%, black 58%, transparent 100%)",
          }}
        >
          <Image
            src="/images/vishwa-portrait.png"
            alt={profile.name}
            fill
            sizes="(min-width: 1024px) 420px, 320px"
            className="object-cover object-top grayscale contrast-110"
            priority
          />
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-color bg-gradient-to-br from-accent via-accent-2/60 to-accent-2 opacity-50"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80"
          />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[2rem] border border-white/10"
          style={{ transform: "translateZ(30px)" }}
        />
      </motion.div>
    </motion.div>
  );
}
