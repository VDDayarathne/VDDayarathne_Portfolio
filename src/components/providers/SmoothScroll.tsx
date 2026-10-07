"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    let lenis: Lenis | undefined;
    let rafId = 0;
    let pendingAnchor: HTMLElement | undefined;
    let anchorNeedsScroll = false;
    let unsubscribe: (() => void) | undefined;

    const cancelFrame = () => {
      cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const frame = (time: number) => {
      rafId = 0;
      if (!lenis || document.hidden || lenis.isStopped) return;
      lenis.raf(time);
      if (lenis.isScrolling === "smooth") rafId = requestAnimationFrame(frame);
    };

    const schedule = () => {
      if (!lenis || document.hidden || lenis.isStopped || rafId) return;
      // Exclude idle time from the next animation's elapsed time.
      lenis.time = performance.now();
      rafId = requestAnimationFrame(frame);
    };

    const focusAnchor = () => {
      const target = pendingAnchor;
      pendingAnchor = undefined;
      anchorNeedsScroll = false;
      if (!target) return;
      const hadTabIndex = target.hasAttribute("tabindex");
      if (!hadTabIndex) {
        target.setAttribute("tabindex", "-1");
        target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
      }
      target.focus({ preventScroll: true });
    };

    const syncActivity = () => {
      if (!lenis) return;
      if (document.hidden || document.documentElement.classList.contains("noscroll")) {
        cancelFrame();
        if (pendingAnchor) anchorNeedsScroll = true;
        lenis.stop();
      } else {
        lenis.start();
        if (pendingAnchor && anchorNeedsScroll) {
          anchorNeedsScroll = false;
          lenis.scrollTo(pendingAnchor, { onStart: schedule, onComplete: focusAnchor });
        }
      }
    };

    const destroy = () => {
      cancelFrame();
      unsubscribe?.();
      unsubscribe = undefined;
      lenis?.destroy();
      lenis = undefined;
      pendingAnchor = undefined;
      anchorNeedsScroll = false;
    };

    const configure = () => {
      destroy();
      // Native touch and reduced-motion scrolling remain browser-controlled.
      if (reducedQuery.matches || !pointerQuery.matches) return;
      lenis = new Lenis({
        duration: 0.65,
        smoothWheel: true,
        syncTouch: false,
        // One guarded handler below also preserves URL history and native modifiers.
        anchors: false,
        stopInertiaOnNavigate: true,
      });
      unsubscribe = lenis.on("virtual-scroll", schedule);
      syncActivity();
    };

    const onAnchorClick = (event: MouseEvent) => {
      if (!lenis || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.composedPath().find((node) => node instanceof HTMLAnchorElement);
      if (!(anchor instanceof HTMLAnchorElement) || !anchor.href ||
        anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      const url = new URL(anchor.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname ||
        url.search !== location.search || !url.hash) return;
      let target: HTMLElement | null;
      try {
        target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      } catch {
        return;
      }
      if (!target) return;

      // Use the same scroll owner for anchors and wheel input.
      event.preventDefault();
      pendingAnchor = target;
      anchorNeedsScroll = true;
      if (location.hash !== url.hash) history.pushState(null, "", url.hash);
      // A menu link can remove its lock after the click handler has run.
      queueMicrotask(() => {
        syncActivity();
      });
    };

    // Capture runs before a mobile menu removes its scroll lock.
    window.addEventListener("click", onAnchorClick, true);
    document.addEventListener("visibilitychange", syncActivity);
    reducedQuery.addEventListener("change", configure);
    pointerQuery.addEventListener("change", configure);
    const lockObserver = new MutationObserver(syncActivity);
    lockObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    configure();

    return () => {
      window.removeEventListener("click", onAnchorClick, true);
      document.removeEventListener("visibilitychange", syncActivity);
      reducedQuery.removeEventListener("change", configure);
      pointerQuery.removeEventListener("change", configure);
      lockObserver.disconnect();
      destroy();
    };
  }, []);

  return <>{children}</>;
}
