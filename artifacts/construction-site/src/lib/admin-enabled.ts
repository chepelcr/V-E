/**
 * Whether the admin CMS panel (`/admin/*`) is available in this build.
 *
 * The admin panel is a local-authoring tool with no authentication — it edits
 * content in-memory and writes JSON back via the dev-only local-CMS middleware.
 * It must therefore NEVER ship in a public production build (e.g. GitHub Pages).
 *
 * - In `vite` dev (`pnpm --filter @workspace/construction-site dev`),
 *   `import.meta.env.DEV` is `true`, so admin is enabled.
 * - In a production build, `import.meta.env.DEV` is `false`, so admin is gated
 *   off: its routes are not registered, the navbar/footer entry is hidden, and
 *   Rollup tree-shakes the whole panel out of the bundle.
 * - To intentionally ship an admin-enabled build (e.g. an internal preview),
 *   build with `VITE_ENABLE_ADMIN=true`.
 *
 * Because the gate folds to a literal `false` at build time, there is exactly
 * one source of truth and no auth to weaken.
 */
export const ADMIN_ENABLED: boolean =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_ADMIN === "true";
