import brandingData from "@/content/branding.json";
import themesData from "@/content/themes.json";
import { resolveAssetUrl } from "@/lib/media";

/**
 * Brand palette → live CSS. Distinct from the `ThemeContext` (which owns the
 * dark/light `.dark`/`.light` class). The active theme in `themes.json` drives
 * the site's brand colours at runtime:
 *
 * - The semantic light-mode tokens (`--primary`, `--accent`, `--background`,
 *   `--ring`) are overridden via a `:root:not(.dark)` rule so the `.dark`
 *   palette (more specific class selector) keeps winning in dark mode — the
 *   site ships dark by default.
 *
 * Applied as the text of a single managed `<style id="brand-theme">` element so
 * it never fights inline styles and stays easy to update. Optional glass-veil
 * scalars (`panelAlpha`/`sectionAlpha`) are applied too when present, preserving
 * the marble veil tuning.
 */

type Theme = (typeof themesData)[number];
type ThemeColors = Theme["colors"];

const STYLE_ID = "brand-theme";

/** "#C9A84C" → "45 55% 54%" (the `H S% L%` triplet our HSL vars expect). */
export function hexToHsl(hex: string): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return "0 0% 0%";
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function buildCss(theme: Theme): string {
  const c: ThemeColors = theme.colors;
  const primary = hexToHsl(c.primary);
  const accent = hexToHsl(c.accent);
  const background = hexToHsl(c.background);
  const lines = [
    // Scoped to light mode so the `.dark` class selector keeps precedence.
    ":root:not(.dark){",
    `--primary:${primary};`,
    `--ring:${primary};`,
    `--accent:${accent};`,
    `--background:${background};`,
  ];
  if (typeof theme.panelAlpha === "number") lines.push(`--panel-alpha:${theme.panelAlpha};`);
  if (typeof theme.sectionAlpha === "number") lines.push(`--section-alpha:${theme.sectionAlpha};`);
  lines.push("}");
  return lines.join("");
}

/** Write the palette into the managed <style> element (creating it if needed). */
export function applyBrandTheme(theme: Theme | undefined): void {
  if (typeof document === "undefined" || !theme?.colors) return;
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = buildCss(theme);
}

/** Point the document favicon at a (possibly relative) asset reference. */
export function applyFavicon(ref: string | null | undefined): void {
  if (typeof document === "undefined" || !ref) return;
  const href = resolveAssetUrl(ref);
  let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = href;
}

/** The active theme from `themes.json` (first `isActive`, else the first one). */
export function activeTheme(): Theme {
  return themesData.find((t) => t.isActive) ?? themesData[0];
}

/**
 * Boot-time runtime branding: apply the active theme's palette and the favicon
 * from `branding.json`. Called once from `main.tsx`.
 */
export function initBrand(): void {
  applyBrandTheme(activeTheme());
  applyFavicon(brandingData.faviconUrl);
}
