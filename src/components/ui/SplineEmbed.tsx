"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function SplineEmbed({
  src,
  title,
  className,
}: {
  src: string;
  title: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border bg-background-elevated",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 animate-pulse bg-gradient-to-br from-accent/10 via-transparent to-accent-2/10 transition-opacity duration-700",
          loaded ? "opacity-0" : "opacity-100"
        )}
      />
      {inView && (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={cn(
            "h-full w-full transition-opacity duration-700",
            loaded ? "opacity-100" : "opacity-0"
          )}
          style={{ border: "none" }}
          allow="autoplay; fullscreen"
        />
      )}
    </div>
  );
}
