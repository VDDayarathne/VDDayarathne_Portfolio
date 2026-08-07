"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const AnimatedBackground = dynamic(() => import("./AnimatedBackground"), {
  ssr: false,
});

type BgState = {
  ready: boolean;
  reducedMotion: boolean;
  mobile: boolean;
  visible: boolean;
};

const initialState: BgState = { ready: false, reducedMotion: false, mobile: false, visible: true };

export default function BackgroundLayer() {
  const [state, setState] = useState<BgState>(initialState);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const widthQuery = window.matchMedia("(max-width: 767px)");

    const sync = () => {
      setState({
        ready: true,
        reducedMotion: motionQuery.matches,
        mobile: widthQuery.matches,
        visible: document.visibilityState === "visible",
      });
    };

    // Deliberate mount-only client capability check (reduced-motion pref,
    // viewport width, tab visibility). Runs after hydration so SSR/client
    // markup match on first paint; the WebGL layer fades in via `ready`.
    sync();

    motionQuery.addEventListener("change", sync);
    widthQuery.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      motionQuery.removeEventListener("change", sync);
      widthQuery.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_20%_0%,rgba(139,92,246,0.09),transparent_60%),radial-gradient(45%_35%_at_85%_100%,rgba(34,211,238,0.07),transparent_60%)]" />
      {state.ready && (
        <div className="absolute inset-0">
          <AnimatedBackground mobile={state.mobile} active={state.visible && !state.reducedMotion} />
        </div>
      )}
    </div>
  );
}
