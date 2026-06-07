import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { createMarbleScene, type MarbleHandle } from "./marble/marbleScene";

const MARBLE_URL = `${import.meta.env.BASE_URL}marble-bg.jpg`;

const containerStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: -1,
  pointerEvents: "none",
  overflow: "hidden",
};

/**
 * Static CSS fallback (used when WebGL is unavailable). Mirrors the original
 * photo-based marble treatment so the site still looks intentional.
 */
const CssFallback: React.FC<{ dark: boolean }> = ({ dark }) => (
  <div aria-hidden="true" style={containerStyle}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url(${MARBLE_URL})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        filter: dark
          ? "brightness(0.42) contrast(1.15) saturate(1.1)"
          : "brightness(0.95) contrast(0.9) saturate(0.75) sepia(0.12)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: dark
          ? "radial-gradient(ellipse at 50% 35%, transparent 40%, rgba(0,0,0,0.55) 100%)"
          : "radial-gradient(ellipse at 50% 35%, rgba(245,237,210,0.4) 40%, rgba(180,160,120,0.25) 100%)",
      }}
    />
  </div>
);

/**
 * PBR WebGL marble/gold background. Falls back to a CSS rendering when WebGL
 * cannot be initialised, and respects prefers-reduced-motion.
 */
export const MarbleBackground: React.FC = () => {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<MarbleHandle | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  // Initialise the scene once.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let handle: MarbleHandle;
    try {
      handle = createMarbleScene(canvas, {
        textureUrl: MARBLE_URL,
        dark,
        reducedMotion,
      });
    } catch {
      setWebglFailed(true);
      return;
    }
    handleRef.current = handle;

    const setSize = () => handle.resize(window.innerWidth, window.innerHeight);
    setSize();
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

  // React to theme changes.
  useEffect(() => {
    handleRef.current?.setTheme(dark);
  }, [dark]);

  if (webglFailed) return <CssFallback dark={dark} />;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ ...containerStyle, display: "block" }}
    />
  );
};
