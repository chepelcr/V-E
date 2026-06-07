import homeData from "../content/home.json";

/** Home page content (hero, about, services, values, CTA). Singleton. */
export type HomeContent = typeof homeData;

export function getHome(): HomeContent {
  return homeData;
}
