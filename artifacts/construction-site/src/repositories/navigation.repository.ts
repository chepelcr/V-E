import navigationData from "../content/navigation.json";

/** Navbar structure: ordered paths + chrome label keys + dropdown grouping. */
export type Navigation = typeof navigationData;
export type NavItem = (typeof navigationData)["items"][number];

export function getNavigation(): Navigation {
  return navigationData;
}

/** Nav items sorted by `order`. */
export function getNavItems(): NavItem[] {
  return [...navigationData.items].sort((a, b) => a.order - b.order);
}
