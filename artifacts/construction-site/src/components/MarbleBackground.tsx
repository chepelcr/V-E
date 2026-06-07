import React, { useId } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Realistic procedural marble background using SVG feTurbulence filters.
 *
 * Layered approach:
 *  1. Base stone — organic turbulence mapped to dark (or light) stone tones
 *  2. Gold veins  — elongated fractalNoise thresholded to thin bright streaks
 *  3. Crystal veins — finer, lighter highlights for depth
 *  4. Depth vignette — subtle radial darkening at edges (dark mode only)
 */
export const MarbleBackground: React.FC = () => {
  const { theme } = useTheme();
  const uid = useId().replace(/:/g, '');
  const dark = theme === 'dark';

  const baseId      = `mb-base-${uid}`;
  const goldId      = `mb-gold-${uid}`;
  const crystalId   = `mb-crystal-${uid}`;
  const cloudId     = `mb-cloud-${uid}`;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundColor: dark ? '#0c0c0b' : '#f2e8d0',
      }}
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        <defs>
          {/* ── 1. Base stone texture ──────────────────────────────────── */}
          <filter id={baseId} x="0%" y="0%" width="100%" height="100%"
                  colorInterpolationFilters="sRGB">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.013 0.009"
              numOctaves="7"
              seed="4"
              stitchTiles="stitch"
              result="noise"
            />
            {dark ? (
              /* Dark: near-black with subtle lighter stone patches */
              <feComponentTransfer in="noise" result="stone">
                <feFuncR type="table" tableValues="0.042 0.050 0.060 0.075 0.065 0.052 0.060 0.045 0.040"/>
                <feFuncG type="table" tableValues="0.038 0.045 0.055 0.068 0.058 0.048 0.055 0.042 0.036"/>
                <feFuncB type="table" tableValues="0.034 0.040 0.048 0.058 0.050 0.040 0.048 0.035 0.030"/>
                <feFuncA type="linear" slope="1"/>
              </feComponentTransfer>
            ) : (
              /* Light: warm ivory/cream with soft gray stone grain */
              <feComponentTransfer in="noise" result="stone">
                <feFuncR type="table" tableValues="0.93 0.95 0.97 0.98 0.96 0.94 0.92 0.95 0.97"/>
                <feFuncG type="table" tableValues="0.88 0.90 0.92 0.94 0.91 0.89 0.87 0.90 0.92"/>
                <feFuncB type="table" tableValues="0.78 0.80 0.83 0.86 0.82 0.79 0.77 0.80 0.83"/>
                <feFuncA type="linear" slope="1"/>
              </feComponentTransfer>
            )}
          </filter>

          {/* ── 2. Gold / amber veins ─────────────────────────────────── */}
          <filter id={goldId} x="0%" y="0%" width="100%" height="100%"
                  colorInterpolationFilters="sRGB">
            {/* Very low Y frequency → stretched horizontal veins */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.055 0.0025"
              numOctaves="5"
              seed="9"
              stitchTiles="stitch"
              result="vNoise"
            />
            {dark ? (
              <feColorMatrix
                type="matrix"
                in="vNoise"
                /* Only bright peaks survive (alpha threshold), coloured gold */
                values="0.80 0 0 0 0.38
                        0.65 0 0 0 0.26
                        0    0 0 0 0.05
                        0    0 0 18 -13"
              />
            ) : (
              <feColorMatrix
                type="matrix"
                in="vNoise"
                values="0.55 0 0 0 0.25
                        0.40 0 0 0 0.18
                        0    0 0 0 0.02
                        0    0 0 22 -17"
              />
            )}
          </filter>

          {/* ── 3. Fine crystal / white-light veins ───────────────────── */}
          <filter id={crystalId} x="0%" y="0%" width="100%" height="100%"
                  colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.09 0.004"
              numOctaves="3"
              seed="17"
              stitchTiles="stitch"
              result="cNoise"
            />
            {dark ? (
              <feColorMatrix
                type="matrix"
                in="cNoise"
                values="1 0 0 0 0.75
                        1 0 0 0 0.70
                        0.9 0 0 0 0.55
                        0 0 0 28 -23"
              />
            ) : (
              <feColorMatrix
                type="matrix"
                in="cNoise"
                values="0.4 0 0 0 0.15
                        0.3 0 0 0 0.10
                        0.1 0 0 0 0.02
                        0 0 0 30 -25"
              />
            )}
          </filter>

          {/* ── 4. Soft cloud variation (mid-scale movement) ──────────── */}
          <filter id={cloudId} x="0%" y="0%" width="100%" height="100%"
                  colorInterpolationFilters="sRGB">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.004 0.003"
              numOctaves="3"
              seed="31"
              stitchTiles="stitch"
              result="cloud"
            />
            {dark ? (
              <feComponentTransfer in="cloud">
                <feFuncR type="table" tableValues="0 0.025 0.015 0.030 0.010 0.020"/>
                <feFuncG type="table" tableValues="0 0.020 0.012 0.025 0.008 0.016"/>
                <feFuncB type="table" tableValues="0 0.018 0.010 0.022 0.006 0.014"/>
                <feFuncA type="linear" slope="0.6"/>
              </feComponentTransfer>
            ) : (
              <feComponentTransfer in="cloud">
                <feFuncR type="table" tableValues="0 0.03 0.02 0.04 0.01 0.03"/>
                <feFuncG type="table" tableValues="0 0.02 0.015 0.03 0.008 0.02"/>
                <feFuncB type="table" tableValues="0 0.01 0.008 0.015 0.004 0.010"/>
                <feFuncA type="linear" slope="0.5"/>
              </feComponentTransfer>
            )}
          </filter>

          {/* Vignette gradient (dark only) */}
          {dark && (
            <radialGradient id={`vig-${uid}`} cx="50%" cy="40%" r="70%">
              <stop offset="0%"   stopColor="transparent"/>
              <stop offset="100%" stopColor="rgba(0,0,0,0.45)"/>
            </radialGradient>
          )}
        </defs>

        {/* Layer 1 — base stone */}
        <rect width="100%" height="100%" filter={`url(#${baseId})`}/>

        {/* Layer 2 — large-scale cloud variation */}
        <rect width="100%" height="100%" filter={`url(#${cloudId})`}
              style={{ mixBlendMode: dark ? 'screen' : 'multiply' }}/>

        {/* Layer 3 — gold veins */}
        <rect width="100%" height="100%" filter={`url(#${goldId})`}
              opacity={dark ? 0.55 : 0.45}
              style={{ mixBlendMode: dark ? 'screen' : 'multiply' }}/>

        {/* Layer 4 — crystal/white highlight veins */}
        <rect width="100%" height="100%" filter={`url(#${crystalId})`}
              opacity={dark ? 0.30 : 0.25}
              style={{ mixBlendMode: dark ? 'screen' : 'multiply' }}/>

        {/* Layer 5 — vignette (dark mode) */}
        {dark && (
          <rect width="100%" height="100%"
                fill={`url(#vig-${uid})`}/>
        )}
      </svg>
    </div>
  );
};
