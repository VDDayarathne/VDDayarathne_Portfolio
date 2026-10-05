"use client";

import { useEffect, useMemo, useRef } from "react";
import { animate, utils, spring, type JSAnimation } from "animejs";

const ACCENTS = ["#8b5cf6", "#22d3ee", "#f472b6"];

type Orb = {
  id: number;
  left: number;
  top: number;
  size: number;
  blur: number;
  depth: number;
  color: string;
  opacity: number;
};

type Dot = {
  id: number;
  left: number;
  top: number;
  size: number;
  depth: number;
};

function buildOrbs(count: number): Orb[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: utils.random(0, 100),
    top: utils.random(0, 100),
    size: utils.random(140, 280),
    blur: utils.random(40, 65),
    depth: utils.random(-360, 160),
    color: ACCENTS[i % ACCENTS.length],
    opacity: utils.random(0.04, 0.09, 2),
  }));
}

function buildDots(count: number): Dot[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: utils.random(0, 100),
    top: utils.random(0, 100),
    size: utils.random(2, 4),
    depth: utils.random(-220, 300),
  }));
}

export default function AnimatedBackground({
  mobile,
  active,
}: {
  mobile: boolean;
  active: boolean;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const orbRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationsRef = useRef<JSAnimation[]>([]);

  const orbs = useMemo(() => buildOrbs(mobile ? 5 : 8), [mobile]);
  const dots = useMemo(() => buildDots(mobile ? 18 : 46), [mobile]);

  useEffect(() => {
    const anims: JSAnimation[] = [];

    orbRefs.current.forEach((el) => {
      if (!el) return;
      anims.push(
        animate(el, {
          translateX: [utils.random(-24, 24), utils.random(-24, 24)],
          translateY: [utils.random(-30, -10), utils.random(10, 30)],
          scale: [1, utils.random(1.04, 1.12, 2)],
          duration: utils.random(9000, 16000),
          delay: utils.random(0, 3000),
          loop: true,
          alternate: true,
          ease: "inOutSine",
        })
      );
    });

    dotRefs.current.forEach((el) => {
      if (!el) return;
      anims.push(
        animate(el, {
          opacity: [utils.random(0.1, 0.25, 2), utils.random(0.6, 1, 2)],
          scale: [0.8, 1.3],
          duration: utils.random(1800, 4200),
          delay: utils.random(0, 4000),
          loop: true,
          alternate: true,
          ease: "inOutSine",
        })
      );
    });

    anims.push(
      animate(".bg-turbulence", {
        baseFrequency: [0.015, 0.03],
        duration: 14000,
        loop: true,
        alternate: true,
        ease: "inOutSine",
      })
    );
    anims.push(
      animate(".bg-displacement", {
        scale: [0, 10],
        duration: 14000,
        loop: true,
        alternate: true,
        ease: "inOutSine",
      })
    );

    anims.push(
      animate(".bg-polygon", {
        points:
          "64 66.144 16.888 92.8 63.529 65.328 64 11.2 64.471 65.328 111.112 92.8",
        duration: 6000,
        loop: true,
        alternate: true,
        ease: "inOutSine",
      })
    );

    animationsRef.current = anims;

    const scene = sceneRef.current;
    let latestX = 0;
    let latestY = 0;
    let ticking = false;

    function applyParallax() {
      ticking = false;
      if (!scene) return;
      const nx = latestX / window.innerWidth - 0.5;
      const ny = latestY / window.innerHeight - 0.5;
      animate(scene, {
        rotateY: nx * 12,
        rotateX: -ny * 12,
        translateX: nx * -24,
        translateY: ny * -24,
        duration: 900,
        ease: spring({ stiffness: 60, damping: 14, mass: 0.6 }),
      });
    }

    function handleMove(e: MouseEvent) {
      latestX = e.clientX;
      latestY = e.clientY;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(applyParallax);
    }

    if (!mobile) window.addEventListener("mousemove", handleMove);

    return () => {
      if (!mobile) window.removeEventListener("mousemove", handleMove);
      anims.forEach((a) => a.pause());
    };
  }, [orbs, dots, mobile]);

  useEffect(() => {
    animationsRef.current.forEach((a) => (active ? a.play() : a.pause()));
  }, [active]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ perspective: 1400 }}>
      <svg aria-hidden className="absolute h-0 w-0">
        <defs>
          <filter id="bg-liquid-filter">
            <feTurbulence
              className="bg-turbulence"
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves={2}
              result="noise"
            />
            <feDisplacementMap className="bg-displacement" in="SourceGraphic" in2="noise" scale={0} />
          </filter>
        </defs>
      </svg>

      <div ref={sceneRef} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        <div className="absolute inset-0" style={{ filter: "url(#bg-liquid-filter)" }}>
          {orbs.map((orb, i) => (
            <div
              key={orb.id}
              ref={(el) => {
                orbRefs.current[i] = el;
              }}
              className="absolute rounded-full"
              style={{
                left: `${orb.left}%`,
                top: `${orb.top}%`,
                width: orb.size,
                height: orb.size,
                marginLeft: -orb.size / 2,
                marginTop: -orb.size / 2,
                background: orb.color,
                filter: `blur(${orb.blur}px)`,
                opacity: orb.opacity,
                transform: `translateZ(${orb.depth}px)`,
              }}
            />
          ))}
        </div>

        {dots.map((dot, i) => (
          <div
            key={dot.id}
            ref={(el) => {
              dotRefs.current[i] = el;
            }}
            className="absolute rounded-full bg-white"
            style={{
              left: `${dot.left}%`,
              top: `${dot.top}%`,
              width: dot.size,
              height: dot.size,
              marginLeft: -dot.size / 2,
              marginTop: -dot.size / 2,
              transform: `translateZ(${dot.depth}px)`,
            }}
          />
        ))}

        <svg
          aria-hidden
          className="absolute"
          style={{
            left: "14%",
            top: "86%",
            width: 180,
            height: 152,
            marginLeft: -90,
            marginTop: -76,
            transform: "translateZ(60px)",
            opacity: 0.4,
          }}
          viewBox="0 0 124 104"
          fill="none"
        >
          <polygon
            className="bg-polygon"
            points="64 68.64 8.574 100 63.446 67.68 64 4 64.554 67.68 119.426 100"
            stroke="#22d3ee"
            strokeWidth={1}
          />
        </svg>
      </div>
    </div>
  );
}
