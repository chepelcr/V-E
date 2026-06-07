import { getSeo } from "@/repositories/seo.repository";
import { resolveLocalized } from "@/lib/resolveLocalized";
import type { Language } from "@/i18n/translations";
import { useEffect } from "react";

/**
 * Runtime SEO head-tag layer (Layer 2 of the SEO design — see
 * `scripts/prerender.mjs` for Layer 1, the static prerender for crawlers).
 *
 * Everything is driven by the editable `seo.json` entity (via its repository),
 * so titles/descriptions/OG image stay in sync between the live SPA head tags
 * and the prerendered HTML. No hardcoded user-visible strings live here.
 *
 * The public SPA keeps FLAT routes (no `/es`/`/en` URL prefix — the language is
 * toggled in place); the prerender emits per-language directories for crawlers
 * while these runtime tags reflect the live language as the user navigates.
 */

export const LANGS: readonly Language[] = ["es", "en"] as const;

/** Resolved, language-specific SEO for a given public route path. */
export interface ResolvedSeo {
  title: string;
  description: string;
  /** Canonical for the *flat* SPA URL (no lang prefix). */
  canonical: string;
  ogImage: string;
  /** hreflang alternates → the per-language prerendered URLs. */
  alternates: Array<{ lang: Language | "x-default"; href: string }>;
  /** Whether crawlers should index this route (false for 404). */
  index: boolean;
}

/** Map a flat route path (e.g. "/", "/catalog") to its prerender slug. */
export function routeSlug(route: string): string {
  const clean = route.replace(/^\/+|\/+$/g, "");
  return clean; // "" for home
}

/**
 * Resolve the SEO metadata for a route + language from `seo.json`. Falls back
 * to the site-level title/description for routes without a `pages` entry
 * (e.g. the home route "/").
 */
export function resolveSeo(
  route: string,
  lang: Language,
  opts: { index?: boolean } = {},
): ResolvedSeo {
  const seo = getSeo();
  const siteUrl = seo.siteUrl.replace(/\/$/, "");
  const pages = seo.pages as Record<
    string,
    { title: { es: string; en: string }; description: { es: string; en: string } }
  >;
  const page = pages[route];

  const title = page
    ? resolveLocalized(page.title, lang)
    : resolveLocalized(seo.siteTitle, lang);
  const description = page
    ? resolveLocalized(page.description, lang)
    : resolveLocalized(seo.siteDescription, lang);

  const slug = routeSlug(route);
  const path = slug ? `/${slug}` : "";

  const alternates: ResolvedSeo["alternates"] = [
    ...LANGS.map((l) => ({ lang: l, href: `${siteUrl}/${l}${path}` })),
    { lang: "x-default" as const, href: `${siteUrl}${path || "/"}` },
  ];

  return {
    title,
    description,
    canonical: `${siteUrl}${path || "/"}`,
    ogImage: seo.ogImageUrl ?? "",
    alternates,
    index: opts.index ?? true,
  };
}

/** Upsert a `<meta>` (by name or property) in <head>. */
function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Upsert a `<link>` matched by rel (+ optional hreflang). */
function upsertLink(rel: string, href: string, hreflang?: string) {
  const sel = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(sel);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (hreflang) el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/** Remove all managed hreflang alternate links (rebuilt on each apply). */
function clearAlternates() {
  document.head
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((el) => el.remove());
}

/**
 * Hook: apply the resolved SEO head tags for `route` in the current `lang`,
 * updating `document.title`, the meta description, canonical, OG/Twitter tags,
 * hreflang alternates, `<html lang>`, and the robots directive. Re-runs on SPA
 * navigation (route/lang change). Pass `index: false` for noindex pages (404).
 */
export function useHeadTags(
  route: string,
  lang: Language,
  opts: { index?: boolean } = {},
): void {
  const index = opts.index ?? true;
  useEffect(() => {
    const meta = resolveSeo(route, lang, { index });

    document.title = meta.title;
    document.documentElement.setAttribute("lang", lang);

    upsertMeta("name", "description", meta.description);
    upsertMeta(
      "name",
      "robots",
      index ? "index, follow" : "noindex, nofollow",
    );

    upsertMeta("property", "og:title", meta.title);
    upsertMeta("property", "og:description", meta.description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:url", meta.canonical);
    if (meta.ogImage) upsertMeta("property", "og:image", meta.ogImage);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", meta.title);
    upsertMeta("name", "twitter:description", meta.description);
    if (meta.ogImage) upsertMeta("name", "twitter:image", meta.ogImage);

    upsertLink("canonical", meta.canonical);
    clearAlternates();
    for (const alt of meta.alternates) {
      upsertLink("alternate", alt.href, alt.lang);
    }
  }, [route, lang, index]);
}
