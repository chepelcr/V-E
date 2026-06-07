import seoData from "../content/seo.json";

/** SEO settings: site URL, default title/description, OG image, per-route pages. */
export type SeoContent = typeof seoData;

export function getSeo(): SeoContent {
  return seoData;
}
