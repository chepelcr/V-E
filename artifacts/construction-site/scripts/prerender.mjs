// Static SEO prerender — Layer 1 of the SEO design (Layer 2 is the runtime
// head tags in src/lib/seo.ts). Runs AFTER `vite build` (wired into the package
// `build` script) so it can post-process the emitted `dist/public`.
//
// For every LANGUAGE x ROUTE it writes:
//   dist/public/<lang>/<slug>/index.html   (full <head>: title, description,
//     canonical, hreflang alternates + x-default, OG/Twitter, <html lang>,
//     JSON-LD WebPage + BreadcrumbList)
// Plus:
//   dist/public/sitemap.xml   (every lang x route, with <xhtml:link> alternates)
//   dist/public/index.html    (re-stamped: canonical -> default lang, site JSON-LD)
//   dist/public/404.html      (SPA fallback, robots: noindex)
//
// All copy is read from the editable src/content/seo.json entity (the SAME
// source the runtime head tags use) so the prerendered HTML never drifts from
// the live SPA. No hardcoded user-visible strings.
//
// Crawlers/social/AI that don't run JS get correct per-language metadata; the
// SPA itself stays FLAT (no /es//en URL prefix) and updates the head at runtime.
//
// Runs in CI (linux) with no native-binary dependency, so the Windows
// rollup/esbuild blocker (see scripts/dxp/*) does not affect it.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "dist", "public");
const SEO_PATH = path.join(ROOT, "src", "content", "seo.json");

const LANGS = ["es", "en"];

// Public routes — keep in sync with App.tsx <Switch> and seo.json `pages`.
// `path` is the flat SPA path; `slug` is the prerendered directory segment.
const ROUTES = [
  { path: "/", slug: "" },
  { path: "/catalog", slug: "catalog" },
  { path: "/lots", slug: "lots" },
  { path: "/providers", slug: "providers" },
  { path: "/contact", slug: "contact" },
  { path: "/financiamiento", slug: "financiamiento" },
];

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Pick a localized value tolerantly ({es,en} or plain string). */
function pick(v, lang) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return v[lang] ?? v.es ?? "";
}

function resolveMeta(seo, route, lang) {
  const page = seo.pages?.[route.path];
  const title = page ? pick(page.title, lang) : pick(seo.siteTitle, lang);
  const description = page
    ? pick(page.description, lang)
    : pick(seo.siteDescription, lang);
  return { title, description };
}

/**
 * Read the head <link>/preconnect/<script>(SPA restore) and the body markup
 * (#root + module script) from the Vite-emitted dist/public/index.html so the
 * prerendered shells load the SAME hashed JS/CSS bundle. We only swap the SEO
 * <head> tags; the app boots and hydrates the real content client-side.
 */
function buildShell(baseHtml, { lang, head }) {
  // Extract everything Vite injected into <head> that we must keep: the
  // hashed <script type="module"> and <link rel="stylesheet"|"modulepreload">
  // tags, plus the font preconnects and the SPA-restore inline script.
  const headInner = baseHtml.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? "";
  const bodyInner = baseHtml.match(/<body>([\s\S]*?)<\/body>/i)?.[1] ?? "";

  // Keep only the asset/preconnect/inline-script lines from the original head;
  // drop the old <title>/<meta>/<link rel=canonical|icon> SEO tags (we re-emit).
  const keptHead = headInner
    .split("\n")
    .filter((line) => {
      const l = line.trim();
      if (!l) return false;
      if (/<title\b/i.test(l)) return false;
      if (/<meta\s+name="(description|robots|twitter:)/i.test(l)) return false;
      if (/<meta\s+property="og:/i.test(l)) return false;
      if (/<meta\s+charset/i.test(l)) return false; // we re-add first
      if (/<meta\s+name="viewport"/i.test(l)) return false; // we re-add
      if (/<link\s+rel="canonical"/i.test(l)) return false;
      return true;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${esc(lang)}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
${head}
${keptHead}
  </head>
  <body>${bodyInner}</body>
</html>
`;
}

function seoHead(seo, { lang, title, description, canonical, alternates, ogImage, robots, jsonLd }) {
  const altLinks = alternates
    .map((a) => `    <link rel="alternate" hreflang="${esc(a.lang)}" href="${esc(a.href)}" />`)
    .join("\n");
  return [
    `    <title>${esc(title)}</title>`,
    `    <meta name="description" content="${esc(description)}" />`,
    `    <meta name="robots" content="${esc(robots)}" />`,
    `    <link rel="canonical" href="${esc(canonical)}" />`,
    altLinks,
    `    <meta property="og:title" content="${esc(title)}" />`,
    `    <meta property="og:description" content="${esc(description)}" />`,
    `    <meta property="og:type" content="website" />`,
    `    <meta property="og:url" content="${esc(canonical)}" />`,
    ogImage ? `    <meta property="og:image" content="${esc(ogImage)}" />` : "",
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${esc(title)}" />`,
    `    <meta name="twitter:description" content="${esc(description)}" />`,
    ogImage ? `    <meta name="twitter:image" content="${esc(ogImage)}" />` : "",
    `    <link rel="icon" type="image/jpeg" href="/logo.jpg" />`,
    `    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function main() {
  const seo = JSON.parse(await fs.readFile(SEO_PATH, "utf8"));
  const siteUrl = (seo.siteUrl || "").replace(/\/$/, "");
  const ogImage = seo.ogImageUrl || "";

  let baseHtml;
  try {
    baseHtml = await fs.readFile(path.join(OUT, "index.html"), "utf8");
  } catch {
    console.error(
      `[prerender] ${path.join(OUT, "index.html")} not found — run \`vite build\` first.`,
    );
    process.exit(1);
  }

  const sitemapEntries = [];

  for (const route of ROUTES) {
    const slugPath = route.slug ? `/${route.slug}` : "";
    const alternates = [
      ...LANGS.map((l) => ({ lang: l, href: `${siteUrl}/${l}${slugPath}` })),
      { lang: "x-default", href: `${siteUrl}${slugPath || "/"}` },
    ];

    for (const lang of LANGS) {
      const { title, description } = resolveMeta(seo, route, lang);
      const canonical = `${siteUrl}/${lang}${slugPath}`;

      const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": `${canonical}#webpage`,
            url: canonical,
            name: title,
            description,
            inLanguage: lang,
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: pick(seo.siteTitle, lang),
                item: `${siteUrl}/${lang}`,
              },
              ...(route.slug
                ? [
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: title,
                      item: canonical,
                    },
                  ]
                : []),
            ],
          },
        ],
      };

      const head = seoHead(seo, {
        lang,
        title,
        description,
        canonical,
        alternates,
        ogImage,
        robots: "index, follow",
        jsonLd,
      });

      const html = buildShell(baseHtml, { lang, head });
      const dir = path.join(OUT, lang, route.slug);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, "index.html"), html, "utf8");

      sitemapEntries.push({ loc: canonical, alternates });
    }
  }

  // sitemap.xml — one <url> per lang x route with xhtml:link alternates.
  const urls = sitemapEntries
    .map(({ loc, alternates }) => {
      const xhtml = alternates
        .map(
          (a) =>
            `    <xhtml:link rel="alternate" hreflang="${esc(a.lang)}" href="${esc(a.href)}" />`,
        )
        .join("\n");
      return `  <url>\n    <loc>${esc(loc)}</loc>\n${xhtml}\n  </url>`;
    })
    .join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
  await fs.writeFile(path.join(OUT, "sitemap.xml"), sitemap, "utf8");

  // Root index.html — re-stamp with default-language SEO + site-wide JSON-LD.
  // (The existing root index.html keeps the SPA-restore script + asset tags.)
  {
    const lang = LANGS[0];
    const { title, description } = resolveMeta(seo, ROUTES[0], lang);
    const canonical = `${siteUrl}/`;
    const alternates = [
      ...LANGS.map((l) => ({ lang: l, href: `${siteUrl}/${l}` })),
      { lang: "x-default", href: `${siteUrl}/` },
    ];
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${siteUrl}#org`,
          name: pick(seo.siteTitle, lang),
          url: siteUrl,
          ...(ogImage ? { logo: ogImage } : {}),
        },
        {
          "@type": "WebSite",
          "@id": `${siteUrl}#website`,
          url: siteUrl,
          name: pick(seo.siteTitle, lang),
          inLanguage: lang,
        },
      ],
    };
    const head = seoHead(seo, {
      lang,
      title,
      description,
      canonical,
      alternates,
      ogImage,
      robots: "index, follow",
      jsonLd,
    });
    const rootHtml = buildShell(baseHtml, { lang, head });
    await fs.writeFile(path.join(OUT, "index.html"), rootHtml, "utf8");
  }

  // 404.html — SPA deep-link fallback, explicitly NOINDEX. Built from the same
  // shell so the bundle loads and wouter resolves the client route on refresh.
  // (Do NOT later overwrite this with a copy of index.html, or the noindex is
  // lost — the deploy workflow must not clobber it.)
  {
    const lang = LANGS[0];
    const title = pick(seo.siteTitle, lang);
    const description = pick(seo.siteDescription, lang);
    const head = seoHead(seo, {
      lang,
      title,
      description,
      canonical: `${siteUrl}/`,
      alternates: [],
      ogImage,
      robots: "noindex, nofollow",
      jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: title },
    });
    const notFound = buildShell(baseHtml, { lang, head });
    await fs.writeFile(path.join(OUT, "404.html"), notFound, "utf8");
  }

  console.log(
    `[prerender] wrote ${LANGS.length * ROUTES.length} localized pages + sitemap.xml + root index.html + noindex 404.html`,
  );
}

main().catch((err) => {
  console.error("[prerender] failed:", err);
  process.exit(1);
});
