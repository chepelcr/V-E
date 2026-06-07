import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { createMarbleScene, type MarbleHandle } from "./marble/marbleScene";

const containerStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: -1,
  pointerEvents: "none",
  overflow: "hidden",
};

/**
 * Pure-CSS fallback (no image) used when WebGL is unavailable. Approximates the
 * procedural marble: deep black + gold sheen in dark, ivory + gold in light.
 */
const CssFallback: React.FC<{ dark: boolean }> = ({ dark }) => (
  <div
    aria-hidden="true"
    style={{
      ...containerStyle,
      background: dark
        ? "radial-gradient(ellipse at 30% 20%, rgba(120,90,30,0.18), transparent 55%)," +
          "radial-gradient(ellipse at 75% 80%, rgba(150,110,40,0.14), transparent 55%)," +
          "#070708"
        : "radial-gradient(ellipse at 30% 20%, rgba(200,160,70,0.22), transparent 55%)," +
          "radial-gradient(ellipse at 75% 80%, rgba(190,150,60,0.16), transparent 55%)," +
          "#f3efe6",
    }}
  />
);

/**
 * Procedural PBR WebGL marble/gold background. Falls back to CSS when WebGL is
 * unavailable, and respects prefers-reduced-motion.
 */
export const MarbleBackground: React.FC = () => {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<MarbleHandle | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let handle: MarbleHandle;
    try {
      handle = createMarbleScene(canvas, { dark, reducedMotion });
    } catch {
      setWebglFailed(true);
      return;
    }
    handleRef.current = handle;

    // Size to the viewport, but IGNORE height-only changes from the mobile
    // address bar showing/hiding on scroll (those caused the background to
    // reflow/zoom). Only re-size when the width changes (incl. orientation).
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    const setSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w === lastW && Math.abs(h - lastH) < 220) return;
      lastW = w;
      lastH = h;
      handle.resize(w, h);
    };
    handle.resize(lastW, lastH);
    handle.start();

    const onPointer = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      handle.setPointer(nx, ny);
    };
    const onVisibility = () => {
      if (document.hidden) handle.stop();
      else handle.start();
    };

    window.addEventListener("resize", setSize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("resize", setSize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      handle.dispose();
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleRef.current?.setTheme(dark);
  }, [dark]);

  if (webglFailed) return <CssFallback dark={dark} />;

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ ...containerStyle, display: "block" }}
      />
      {/* Readability scrim: sits above the marble, below content. Calms the
          background and lifts text contrast (darkens in dark mode, lightens
          in light mode), strongest toward the centre where hero text sits. */}
      <div
        aria-hidden="true"
        style={{
          ...containerStyle,
          background: dark
            ? "radial-gradient(ellipse at 50% 38%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.32) 45%, rgba(0,0,0,0.18) 100%)"
            : "radial-gradient(ellipse at 50% 38%, rgba(247,243,235,0.4) 0%, rgba(247,243,235,0.22) 45%, rgba(247,243,235,0.1) 100%)",
        }}
      />
    </>
  );
};
