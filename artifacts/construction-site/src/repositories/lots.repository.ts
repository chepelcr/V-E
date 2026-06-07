import lotsData from "../content/lots.json";

/**
 * Lots content (lot inventory + page title/subtitle). The `title`/`subtitle`
 * are editorial singleton copy; `items[]` is a list of lots edited via the
 * Pattern-2 list-editor. A lot `name` and its `location` (province/canton/
 * district) are proper nouns (plain strings); `description` is localized
 * `{es,en}`. `currency` is an enum token; `available` is a boolean;
 * `modelCompatible` references catalog model ids.
 */
export type LotsContent = typeof lotsData;
export type LotItem = LotsContent["items"][number];
export type LotLocation = LotItem["location"];

export function getLots(): LotsContent {
  return lotsData;
}

export function getLotItems(): LotItem[] {
  return lotsData.items;
}
