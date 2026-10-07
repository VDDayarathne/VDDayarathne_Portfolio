"use client";

import { useEffect, useRef } from "react";
import { BackgroundFrameCache } from "@/lib/background-frame-cache";

const MAX_DPR = 2;
const CANVAS_PIXEL_BUDGET = 2_500_000;
const SMOOTHING_MS = 45;

export default function ScrollSequenceBackground({ frames }: { frames: readonly string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frames.length) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let rafId = 0;
    let disposed = false;
    let needsResize = true;
    let needsMeasure = true;
    let needsDraw = true;
    let scrollRange = 0;
    let target = 0;
    let current = 0;
    let previousTarget = 0;
    let direction = 1;
    let drawnIndex = -1;
    let drawnImage: CanvasImageSource | undefined;
    let previousTime = 0;
    let initialized = false;

    function schedule() {
      if (!disposed && !document.hidden && !rafId) rafId = requestAnimationFrame(render);
    }

    const cache = new BackgroundFrameCache(frames, schedule);
    cache.setStaticMode(reducedMotion);

    const render = (time: number) => {
      rafId = 0;
      if (disposed || document.hidden) return;

      if (needsMeasure) {
        scrollRange = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        needsMeasure = false;
      }
      const progress = scrollRange > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollRange)) : 0;
      target = reducedMotion ? 0 : progress * (frames.length - 1);
      if (target !== previousTarget) direction = target > previousTarget ? 1 : -1;
      previousTarget = target;

      if (!initialized || reducedMotion) {
        current = target;
        initialized = true;
      } else {
        const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16;
        current += (target - current) * (1 - Math.exp(-elapsed / SMOOTHING_MS));
        if (Math.abs(target - current) < 0.05) current = target;
      }
      previousTime = time;

      if (needsResize) {
        const width = Math.max(1, canvas.clientWidth);
        const height = Math.max(1, canvas.clientHeight);
        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR,
          Math.sqrt(CANVAS_PIXEL_BUDGET / (width * height)));
        const pixelWidth = Math.max(1, Math.round(width * dpr));
        const pixelHeight = Math.max(1, Math.round(height * dpr));
        if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
          // A resize clears canvas pixels; redraw a cached frame in this same animation frame.
          canvas.width = pixelWidth;
          canvas.height = pixelHeight;
          needsDraw = true;
        }
        cache.setViewport(pixelWidth, pixelHeight);
        needsResize = false;
      }

      const targetIndex = Math.min(frames.length - 1, Math.max(0, Math.round(target)));
      const frameIndex = Math.min(frames.length - 1, Math.max(0, Math.round(current)));
      cache.prioritize(targetIndex, direction);
      const available = cache.nearest(frameIndex);
      canvas.dataset.targetFrameIndex = String(targetIndex);
      canvas.dataset.loadedFrameCount = String(cache.loadedCount);

      if (available && (available.index !== drawnIndex || available.frame.image !== drawnImage || needsDraw)) {
        const { width, height, image } = available.frame;
        const scale = Math.max(canvas.width / width, canvas.height / height);
        const drawWidth = width * scale;
        const drawHeight = height * scale;
        // Cover the canvas completely without clearing it between frames or distorting the image.
        context.drawImage(image, (canvas.width - drawWidth) / 2,
          (canvas.height - drawHeight) / 2, drawWidth, drawHeight);
        drawnIndex = available.index;
        drawnImage = image;
        canvas.dataset.frameIndex = String(drawnIndex);
        cache.markDisplayed(drawnIndex);
        needsDraw = false;
      }

      if (Math.abs(target - current) > 0.05) schedule();
      else previousTime = 0;
    };

    const resize = () => {
      needsResize = true;
      needsMeasure = true;
      schedule();
    };
    const measure = () => {
      needsMeasure = true;
      schedule();
    };
    const motionChange = () => {
      reducedMotion = motionQuery.matches;
      cache.setStaticMode(reducedMotion);
      previousTime = 0;
      schedule();
    };
    const visibilityChange = () => {
      cache.setPaused(document.hidden);
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = 0;
        previousTime = 0;
      } else resize();
    };

    // Raw scrolling only requests a frame. Layout is measured on resize/content changes.
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("orientationchange", resize, { passive: true });
    window.addEventListener("pageshow", resize);
    window.visualViewport?.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", visibilityChange);
    motionQuery.addEventListener("change", motionChange);
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);
    observer.observe(document.body);
    void document.fonts.ready.then(() => { if (!disposed) measure(); });
    schedule();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      window.removeEventListener("pageshow", resize);
      window.visualViewport?.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibilityChange);
      motionQuery.removeEventListener("change", motionChange);
      cache.dispose();
    };
  }, [frames]);

  if (!frames.length) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-background-sequence=""
      data-frame-count={frames.length}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{ backgroundImage: `url(${JSON.stringify(frames[0])})`, backgroundSize: "cover", backgroundPosition: "center" }}
    />
  );
}
