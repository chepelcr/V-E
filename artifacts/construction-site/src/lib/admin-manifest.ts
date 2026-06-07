import type { ComponentType } from "react";
import {
  LayoutDashboard,
  Home as HomeIcon,
  LayoutGrid,
  MapPin,
  Building2,
  Mail,
  CreditCard,
  FileQuestion,
  Brush,
  Image,
  Search,
  Navigation,
  Languages,
  Download,
  FileSearch,
  Share2,
  Activity,
  Inbox,
} from "lucide-react";

/** A bilingual label `{ es, en }` for sidebar/dashboard display. */
export interface BiLabel {
  es: string;
  en: string;
}

/** Which of the 7 admin page patterns an entry uses (for docs/tooling). */
export type AdminPattern = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Sidebar grouping. */
export type AdminGroup = "content" | "cms" | "platform";

/**
 * One completeness-manifest row. A single source the sidebar, AdminRouter and
 * ContentVersionsPage all generate from, so the four pieces (admin page, sidebar
 * entry, route, versions row) can never drift.
 *
 * - `file`     content JSON this entry edits (undefined for tooling-only pages).
 * - `available` whether the page is built yet (Phase-gated). Unbuilt rows still
 *   show in the sidebar (as a "coming soon" stub) but are NOT routed.
 */
export interface AdminEntry {
  key: string;
  label: BiLabel;
  route: string;
  icon: ComponentType<{ className?: string }>;
  group: AdminGroup;
  /** Content file edited by this entry's admin page (omit for tooling). */
  file?: string;
  /** Versions-page row description per language. */
  versions?: BiLabel;
  pattern?: AdminPattern;
  /** Built in the current phase? Unbuilt rows render as disabled stubs. */
  available: boolean;
  /** Old routes that should redirect to `route`. */
  redirectsFrom?: string[];
}

/**
 * THE manifest. Phase 1a builds Dashboard + Site Identity + Media + SEO +
 * Navigation + Contact Info + Content Versions, and the Home content page.
 * Per-page content entities (catalog/lots/providers/financiamiento/notFound)
 * and the platform tooling (diagnostics/explorer/inventory/messages/translations)
 * are stubbed here and built in later phases — adding a row is all it takes to
 * give a future entity its sidebar + route + versions pieces.
 */
export const MANIFEST: AdminEntry[] = [
  // Dashboard sits above the groups (rendered specially by the sidebar).
  {
    key: "dashboard",
    label: { es: "Panel", en: "Dashboard" },
    route: "/admin/dashboard",
    icon: LayoutDashboard,
    group: "platform",
    available: true,
    redirectsFrom: ["/admin"],
  },

  // ── Content (per-page entities) ──────────────────────────────────────────
  {
    key: "home",
    label: { es: "Inicio", en: "Home" },
    route: "/admin/home",
    icon: HomeIcon,
    group: "content",
    file: "home.json",
    versions: { es: "Contenido de la página de inicio", en: "Home page content" },
    pattern: 1,
    available: true,
  },
  {
    key: "catalog",
    label: { es: "Catálogo", en: "Catalog" },
    route: "/admin/catalog",
    icon: LayoutGrid,
    group: "content",
    file: "catalog.json",
    versions: { es: "Modelos de casas", en: "House models" },
    pattern: 2,
    available: true,
  },
  {
    key: "lots",
    label: { es: "Lotes", en: "Lots" },
    route: "/admin/lots",
    icon: MapPin,
    group: "content",
    file: "lots.json",
    versions: { es: "Inventario de lotes", en: "Lot inventory" },
    pattern: 2,
    available: true,
  },
  {
    key: "providers",
    label: { es: "Proveedores", en: "Providers" },
    route: "/admin/providers",
    icon: Building2,
    group: "content",
    file: "providers.json",
    versions: { es: "Directorio de proveedores", en: "Providers directory" },
    pattern: 2,
    available: true,
  },
  {
    key: "financiamiento",
    label: { es: "Financiamiento", en: "Financing" },
    route: "/admin/financiamiento",
    icon: CreditCard,
    group: "content",
    file: "financiamiento.json",
    versions: { es: "Página de financiamiento", en: "Financing page" },
    pattern: 1,
    available: true,
  },
  {
    key: "contact-content",
    label: { es: "Contacto (copia)", en: "Contact (copy)" },
    route: "/admin/contact-content",
    icon: Mail,
    group: "content",
    file: "contactContent.json",
    versions: { es: "Intro de la página de contacto", en: "Contact page intro" },
    pattern: 1,
    available: true,
  },
  {
    key: "not-found",
    label: { es: "404", en: "404" },
    route: "/admin/not-found",
    icon: FileQuestion,
    group: "content",
    file: "notFound.json",
    versions: { es: "Página 404", en: "404 page" },
    pattern: 1,
    available: true,
  },
  {
    key: "messages",
    label: { es: "Mensajes", en: "Messages" },
    route: "/admin/messages",
    icon: Inbox,
    group: "content",
    pattern: 6,
    available: true,
  },

  // ── CMS (shared entities) ────────────────────────────────────────────────
  {
    key: "identity",
    label: { es: "Identidad del Sitio", en: "Site Identity" },
    route: "/admin/identity",
    icon: Brush,
    group: "cms",
    file: "branding.json",
    versions: { es: "Logo, favicon, nombre y eslogan", en: "Logo, favicon, name & tagline" },
    pattern: 3,
    available: true,
    redirectsFrom: ["/admin/branding", "/admin/themes"],
  },
  {
    key: "contact-info",
    label: { es: "Datos de Contacto", en: "Contact Info" },
    route: "/admin/contact-info",
    icon: Mail,
    group: "cms",
    file: "contact.json",
    versions: { es: "Teléfonos, correo y redes", en: "Phones, email & social" },
    pattern: 1,
    available: true,
  },
  {
    key: "media",
    label: { es: "Medios", en: "Media" },
    route: "/admin/media",
    icon: Image,
    group: "cms",
    file: "media.json",
    versions: { es: "Biblioteca de medios", en: "Media library" },
    pattern: 4,
    available: true,
  },
  {
    key: "seo",
    label: { es: "SEO", en: "SEO" },
    route: "/admin/seo",
    icon: Search,
    group: "cms",
    file: "seo.json",
    versions: { es: "Configuración SEO", en: "SEO settings" },
    pattern: 1,
    available: true,
  },
  {
    key: "navigation",
    label: { es: "Navegación", en: "Navigation" },
    route: "/admin/navigation",
    icon: Navigation,
    group: "cms",
    file: "navigation.json",
    versions: { es: "Enlaces de navegación", en: "Navigation links" },
    pattern: 1,
    available: true,
  },
  {
    key: "translations",
    label: { es: "Traducciones", en: "Translations" },
    route: "/admin/translations",
    icon: Languages,
    group: "cms",
    pattern: 5,
    available: true,
  },
  {
    key: "content-versions",
    label: { es: "Versiones de Contenido", en: "Content Versions" },
    route: "/admin/content-versions",
    icon: Download,
    group: "cms",
    pattern: 7,
    available: true,
  },

  // ── Platform (tooling) ───────────────────────────────────────────────────
  {
    key: "content-explorer",
    label: { es: "Explorador de Contenido", en: "Content Explorer" },
    route: "/admin/content-explorer",
    icon: FileSearch,
    group: "platform",
    pattern: 7,
    available: true,
  },
  {
    key: "inventory",
    label: { es: "Inventario", en: "Inventory" },
    route: "/admin/inventory",
    icon: Share2,
    group: "platform",
    file: "inventory.json",
    versions: { es: "Mapa de módulos", en: "Module map" },
    pattern: 7,
    available: true,
  },
  {
    key: "diagnostics",
    label: { es: "Diagnóstico", en: "Diagnostics" },
    route: "/admin/diagnostics",
    icon: Activity,
    group: "platform",
    pattern: 7,
    available: true,
  },
];

/** Group display labels (also mirrored in admin.groups.* chrome). */
export const GROUP_LABELS: Record<AdminGroup, BiLabel> = {
  content: { es: "Contenido", en: "Content" },
  cms: { es: "CMS", en: "CMS" },
  platform: { es: "Plataforma", en: "Platform" },
};

/** Sidebar group order. */
export const GROUP_ORDER: AdminGroup[] = ["content", "cms", "platform"];

/** The Dashboard entry, rendered above the groups. */
export const DASHBOARD_ENTRY = MANIFEST.find((e) => e.key === "dashboard")!;

/** Entries (excluding Dashboard) for a given group. */
export function entriesForGroup(group: AdminGroup): AdminEntry[] {
  return MANIFEST.filter((e) => e.key !== "dashboard" && e.group === group);
}

/** Manifest rows that have a content file + versions row (for ContentVersionsPage). */
export function versionedEntries(): AdminEntry[] {
  return MANIFEST.filter((e) => e.file && e.versions);
}
