import { getLots } from "@/repositories/lots.repository";
import { resolveLocalized } from "@/lib/resolveLocalized";
import type { Language } from "@/i18n/translations";

/**
 * Lots view-model service. Reads the `lots.json` content (via its repository),
 * resolves every localized field for the requested language, and exposes the
 * geographic (province → canton → district) + minimum-size filter helpers the
 * public Lots page needs. The public `Lots.tsx` consumes this read-only
 * view-model — it never touches the raw JSON shape or the resolver directly.
 *
 * Filter semantics: the size filter is a MINIMUM-size filter (lots at least
 * `minSize` are kept) — fixes the legacy "Max size" mislabel where the UI
 * filtered on a minimum but the chrome read "max".
 */

export interface LotLocationView {
  province: string;
  canton: string;
  district: string;
}

export interface LotView {
  id: string;
  /** Proper noun — not localized. */
  name: string;
  /** Geographic proper nouns — not localized. */
  location: LotLocationView;
  size: number;
  price: number;
  currency: string;
  description: string;
  available: boolean;
  modelCompatible: string[];
}

export interface LotsViewModel {
  title: string;
  subtitle: string;
  items: LotView[];
}

/** The active geographic + size filter state. */
export interface LotFilter {
  province: string; // "all" or a province name
  canton: string; // "all" or a canton name
  district: string; // "all" or a district name
  minSize: string; // raw input string; "" means no minimum
}

/** Assemble the fully-resolved Lots view-model for the given language. */
export function getLotsView(lang: Language): LotsViewModel {
  const lots = getLots();
  const rl = (v: unknown) => resolveLocalized(v as never, lang);

  const items: LotView[] = lots.items.map((l) => ({
    id: l.id,
    name: l.name,
    location: {
      province: l.location.province,
      canton: l.location.canton,
      district: l.location.district,
    },
    size: l.size,
    price: l.price,
    currency: l.currency,
    description: rl(l.description),
    available: l.available,
    modelCompatible: l.modelCompatible ?? [],
  }));

  return {
    title: rl(lots.title),
    subtitle: rl(lots.subtitle),
    items,
  };
}

/** Distinct provinces present across all lots (proper nouns, plain). */
export function provincesOf(items: LotView[]): string[] {
  return Array.from(new Set(items.map((l) => l.location.province)));
}

/** Distinct cantons within a province ("all" → none, force a province pick). */
export function cantonsOf(items: LotView[], province: string): string[] {
  if (province === "all") return [];
  return Array.from(
    new Set(items.filter((l) => l.location.province === province).map((l) => l.location.canton)),
  );
}

/** Distinct districts within a canton ("all" → none). */
export function districtsOf(items: LotView[], canton: string): string[] {
  if (canton === "all") return [];
  return Array.from(
    new Set(items.filter((l) => l.location.canton === canton).map((l) => l.location.district)),
  );
}

/** Apply the province/canton/district + minimum-size filter to the lot list. */
export function filterLots(items: LotView[], filter: LotFilter): LotView[] {
  const min = filter.minSize ? Number(filter.minSize) : null;
  return items.filter((lot) => {
    if (filter.province !== "all" && lot.location.province !== filter.province) return false;
    if (filter.canton !== "all" && lot.location.canton !== filter.canton) return false;
    if (filter.district !== "all" && lot.location.district !== filter.district) return false;
    if (min != null && !Number.isNaN(min) && lot.size < min) return false;
    return true;
  });
}
