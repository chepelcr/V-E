import type { Variants } from "framer-motion";

/**
 * Shared framer-motion variants — extracted from the per-page `fadeUp` /
 * stagger definitions that were duplicated (and had diverged) across
 * `Home.tsx` and `Financiamiento.tsx`. Public sections should reuse these so
 * the reveal motion stays consistent site-wide.
 */

/** Fade + rise on reveal. `delay` lets cards in a row cascade. */
export const fadeUp = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: "easeOut" },
  },
});

/** Parent variant that staggers its children's reveal. */
export const staggerContainer = (stagger = 0.2): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
});
