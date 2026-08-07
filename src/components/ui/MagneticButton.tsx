"use client";

import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function MagneticButton({
  children,
  className,
  href,
  onClick,
  as,
  target,
  rel,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  as?: "a" | "button";
  target?: string;
  rel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    setPos({ x: relX * 0.3, y: relY * 0.3 });
  }

  function handleLeave() {
    setPos({ x: 0, y: 0 });
  }

  const Tag = as === "a" ? "a" : as === "button" ? "button" : href ? "a" : "button";

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 12, mass: 0.3 }}
      className="inline-block"
      data-cursor-hover
    >
      <Tag
        href={href}
        onClick={onClick}
        target={target}
        rel={rel}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors",
          className
        )}
      >
        {children}
      </Tag>
    </motion.div>
  );
}
