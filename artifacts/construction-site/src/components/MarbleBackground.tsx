import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Uses the real marble photograph (public/marble-bg.jpg) as the background.
 * In dark mode: the photo is shown with a dark overlay to deepen the blacks.
 * In light mode: the photo is shown with a warm cream tint + higher brightness.
 */
export const MarbleBackground: React.FC = () => {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Marble photo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/marble-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          filter: dark
            ? 'brightness(0.38) contrast(1.15) saturate(1.1)'
            : 'brightness(0.92) contrast(0.9) saturate(0.7) sepia(0.15)',
          transform: 'scale(1.02)',
        }}
      />

      {/* Dark mode: deep black overlay to keep the marble subtle */}
      {dark && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(160deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.60) 100%)',
          }}
        />
      )}

      {/* Light mode: warm cream wash */}
      {!dark && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(160deg, rgba(245,237,210,0.72) 0%, rgba(240,228,195,0.55) 50%, rgba(245,237,210,0.72) 100%)',
          }}
        />
      )}

      {/* Subtle vignette on both modes */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: dark
            ? 'radial-gradient(ellipse at 50% 35%, transparent 40%, rgba(0,0,0,0.5) 100%)'
            : 'radial-gradient(ellipse at 50% 35%, transparent 40%, rgba(180,160,120,0.25) 100%)',
        }}
      />
    </div>
  );
};
