import seoData from "@/content/seo.json";

/**
 * Media library types + URL resolution.
 *
 * The admin Media library (`media.json`) stores either **local** assets —
 * uploaded into `public/media/` and referenced by a root-relative `path` like
 * `/media/<file>` (or root assets like `/logo.jpg`) — or **external** assets
 * referenced by an absolute `url` on another server. Local paths survive a
 * domain change and are turned into an absolute URL (against `seo.json`'s
 * `siteUrl`) only where one is required (OG/Twitter images, sitemap, JSON-LD).
 */

export type MediaKind = "image" | "video" | "audio";

export interface MediaItem {
  id: string;
  kind: MediaKind;
  /** "local" → served from public via `path`; "external" → absolute `url`. */
  source: "local" | "external";
  /** Root-relative path for local items, e.g. "/media/hero.png" or "/logo.jpg". */
  path?: string;
  /** Absolute URL for external items. */
  url?: string;
  filename: string;
  mime: string;
  /** Byte size for local uploads (0 for external). */
  size: number;
  alt?: { es: string; en: string };
  createdAt: string;
}

export interface MediaLibrary {
  items: MediaItem[];
}

/** The Vite `base` without a trailing slash (e.g. "" for "/", "/repo" for "/repo/"). */
function basePrefix(): string {
  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
  return base;
}

/**
 * Resolve any stored asset reference (a media `path`/`url`, or a branding field)
 * to a URL usable in `src`/`href`. Absolute URLs and data URLs pass through;
 * root-relative paths get the Vite `base` prefix so they work under a sub-path
 * deploy.
 */
export function resolveAssetUrl(ref: string | null | undefined): string {
  if (!ref) return "";
  if (/^(https?:)?\/\//i.test(ref) || ref.startsWith("data:")) return ref;
  if (ref.startsWith("/")) return basePrefix() + ref;
  return ref;
}

/** The display/`src` URL for a media item (relative for local, absolute for external). */
export function resolveMediaUrl(item: MediaItem): string {
  return item.source === "external" ? resolveAssetUrl(item.url) : resolveAssetUrl(item.path);
}

/** The value to STORE in a content field when an item is picked. */
export function mediaRef(item: MediaItem): string {
  return (item.source === "external" ? item.url : item.path) ?? "";
}

/**
 * Turn a root-relative asset reference into an absolute URL against the site URL
 * from `seo.json` — for contexts that require one (OG/Twitter, sitemap, JSON-LD).
 * Absolute URLs pass through unchanged.
 */
export function absoluteAssetUrl(ref: string | null | undefined): string {
  if (!ref) return "";
  if (/^https?:\/\//i.test(ref) || ref.startsWith("data:")) return ref;
  const site = (seoData.siteUrl ?? "").replace(/\/$/, "");
  const path = ref.startsWith("/") ? ref : `/${ref}`;
  return site + basePrefix() + path;
}
