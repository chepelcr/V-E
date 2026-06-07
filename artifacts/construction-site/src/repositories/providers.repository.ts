import providersData from "../content/providers.json";

/**
 * Providers content (an intro singleton + a list of partner providers). The
 * `intro.title`/`intro.subtitle` are editorial singleton copy; `items[]` is a
 * list of providers edited via the Pattern-2 list-editor. A provider `name` is
 * a brand proper noun (plain string); `description` is localized `{es,en}`;
 * `materials[]` is a list of per-item localized `{es,en}` chips. `website` and
 * `contact` are plain optional strings (URL / email).
 */
export type ProvidersContent = typeof providersData;
export type ProviderItem = ProvidersContent["items"][number];
export type ProviderMaterial = ProviderItem["materials"][number];

export function getProviders(): ProvidersContent {
  return providersData;
}

export function getProviderItems(): ProviderItem[] {
  return providersData.items;
}
