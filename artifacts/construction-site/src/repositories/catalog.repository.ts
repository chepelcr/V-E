import catalogData from "../content/catalog.json";

/**
 * Catalog content (house models + page title/subtitle). The `title`/`subtitle`
 * are editorial singleton copy; `models[]` is a list of house models edited via
 * the Pattern-2 list-editor. Model `name` is a proper noun (plain string);
 * `description` and each gallery `caption` are localized `{es,en}`. Gallery
 * `category`/`room`/`currency` are enum tokens; `ref` is a media reference.
 */
export type CatalogContent = typeof catalogData;
export type CatalogModel = CatalogContent["models"][number];
export type CatalogGalleryImage = CatalogModel["gallery"][number];

export function getCatalog(): CatalogContent {
  return catalogData;
}

export function getCatalogModels(): CatalogModel[] {
  return catalogData.models;
}
