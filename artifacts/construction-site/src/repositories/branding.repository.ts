import brandingData from "../content/branding.json";

/** Site identity: logos / favicon, company name, wordmark and bilingual tagline. */
export type Branding = typeof brandingData;

export function getBranding(): Branding {
  return brandingData;
}
