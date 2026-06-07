import themesData from "../content/themes.json";

/** Brand themes (palette + glass-veil scalars). One is `isActive`. */
export type Theme = (typeof themesData)[number];

export function getThemes(): Theme[] {
  return themesData;
}

export function getActiveTheme(): Theme {
  return themesData.find((t) => t.isActive) ?? themesData[0];
}
