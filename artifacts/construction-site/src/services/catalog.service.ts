import { getCatalog } from "@/repositories/catalog.repository";
import { resolveLocalized } from "@/lib/resolveLocalized";
import { resolveAssetUrl } from "@/lib/media";
import type { Language } from "@/i18n/translations";

/**
 * Catalog view-model service. Reads the `catalog.json` content (via its
 * repository), resolves every localized field for the requested language, turns
 * gallery `ref`s into displayable URLs, and exposes the gallery filter/sort
 * helpers (by space category + room) the public Catalog page needs. The public
 * `Catalog.tsx` consumes this read-only view-model — it never touches the raw
 * JSON shape, the resolver, or the media resolver directly.
 */

/** Space category enum — drives the All / Interior / Exterior filter + badge. */
export type GalleryCategory = "interior" | "exterior";
export type SpaceFilter = "all" | GalleryCategory;

/** Room enum (token set). The array also fixes the gallery display ordering. */
export const ROOM_ORDER = [
  "facade",
  "gate",
  "garden",
  "patio",
  "living_room",
  "kitchen",
  "bedroom",
  "bathroom",
] as const;
export type RoomType = (typeof ROOM_ORDER)[number];

export interface CatalogGalleryView {
  /** Display URL for the gallery image (resolved from the stored media ref). */
  url: string;
  category: GalleryCategory;
  room: RoomType;
  caption: string;
}

export interface CatalogModelView {
  id: string;
  /** Proper noun — not localized. */
  name: string;
  description: string;
  price: number;
  currency: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  gallery: CatalogGalleryView[];
}

export interface CatalogViewModel {
  title: string;
  subtitle: string;
  models: CatalogModelView[];
}

/** Assemble the fully-resolved Catalog view-model for the given language. */
export function getCatalogView(lang: Language): CatalogViewModel {
  const catalog = getCatalog();
  const rl = (v: unknown) => resolveLocalized(v as never, lang);

  const models: CatalogModelView[] = catalog.models.map((m) => ({
    id: m.id,
    name: m.name,
    description: rl(m.description),
    price: m.price,
    currency: m.currency,
    area: m.area,
    bedrooms: m.bedrooms,
    bathrooms: m.bathrooms,
    gallery: m.gallery.map((g) => ({
      url: resolveAssetUrl(g.ref),
      category: g.category as GalleryCategory,
      room: g.room as RoomType,
      caption: rl(g.caption),
    })),
  }));

  return {
    title: rl(catalog.title),
    subtitle: rl(catalog.subtitle),
    models,
  };
}

/** Filter a model's gallery by space category, then (optionally) by room. */
export function filterGallery(
  gallery: CatalogGalleryView[],
  space: SpaceFilter,
  room: RoomType | "all",
): CatalogGalleryView[] {
  let imgs = gallery;
  if (space !== "all") imgs = imgs.filter((img) => img.category === space);
  if (room !== "all") imgs = imgs.filter((img) => img.room === room);
  return imgs;
}

/**
 * The rooms present in a model's gallery (optionally narrowed to a space
 * category), returned in the canonical `ROOM_ORDER` so the room chips render in
 * a stable, sensible sequence.
 */
export function availableRooms(
  gallery: CatalogGalleryView[],
  space: SpaceFilter,
): RoomType[] {
  const subset = space === "all" ? gallery : gallery.filter((img) => img.category === space);
  const roomSet = new Set(subset.map((img) => img.room));
  return ROOM_ORDER.filter((r) => roomSet.has(r));
}
