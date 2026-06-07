import financiamientoData from "../content/financiamiento.json";

/**
 * Financiamiento page content (singleton). Page title/subtitle, the financing
 * options grid, the project-types grid, the turnkey-service card and the CTA
 * copy + bottom tagline. Every copy field is localized `{es,en}`; `iconName`
 * fields are icon-registry tokens. Phones/email shown on the page come from the
 * shared `contact.json` (company entity), NOT from here — so they never drift.
 */
export type FinanciamientoContent = typeof financiamientoData;
export type FinancingOption = FinanciamientoContent["options"][number];
export type FinancingProjectType = FinanciamientoContent["projectTypes"][number];
export type TurnkeyItem = FinanciamientoContent["turnkey"]["items"][number];

export function getFinanciamiento(): FinanciamientoContent {
  return financiamientoData;
}
