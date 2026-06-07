import { create } from "zustand";
import { saveContentFile } from "./local-cms";
import homeData from "../content/home.json";
import catalogData from "../content/catalog.json";
import lotsData from "../content/lots.json";
import providersData from "../content/providers.json";
import contactContentData from "../content/contactContent.json";
import financiamientoData from "../content/financiamiento.json";
import notFoundData from "../content/notFound.json";
import brandingData from "../content/branding.json";
import themesData from "../content/themes.json";
import contactData from "../content/contact.json";
import mediaData from "../content/media.json";
import seoData from "../content/seo.json";
import navigationData from "../content/navigation.json";
import type { Inventory } from "../repositories/inventory.repository";
import type { MediaLibrary } from "./media";

/**
 * The dependency-graph inventory (`inventory.json`) is ADMIN-ONLY data, but its
 * node/edge labels include the names of admin modules (e.g. "AdminLayout"). If
 * this public-bundled store statically imported the JSON, those strings would
 * leak into the public bundle and trip the §7 tree-shake grep. So the slice is
 * seeded EMPTY here; the admin Inventory/Content-Explorer pages hydrate it on
 * mount via `getInventory()` (admin-only, tree-shaken from prod).
 */
const EMPTY_INVENTORY: Inventory = {
  generatedAt: "",
  counts: { nodes: 0, edges: 0 },
  nodes: [],
  edges: [],
} as unknown as Inventory;

/**
 * Zustand CONTENT store. Imports every bundled content JSON, exposes each as a
 * slice + setter, and tracks "dirty" via JSON-string snapshots of the last-saved
 * value. This module is also pulled into the PUBLIC bundle (e.g. by the contact
 * form), so it must NOT import the admin-ui store or any admin-only chrome.
 *
 * Single save entry: `downloadJson(filename, data)` → write-back to the repo
 * via local-cms (falls back to a browser download) → `markSaved` → dispatch a
 * `ve:content-saved` DOM event so the admin shell can refresh publish state
 * without this module importing admin-ui.
 *
 * As content entities are added in later phases (catalog/lots/providers/…),
 * add a slice + setter + snapshot + ENTITY_BY_FILE row here.
 */

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  /** Optional id of the referenced model/lot (when subject targets one). */
  referenceId?: string;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
}

interface AdminStore {
  home: typeof homeData;
  catalog: typeof catalogData;
  lots: typeof lotsData;
  providers: typeof providersData;
  contactContent: typeof contactContentData;
  financiamiento: typeof financiamientoData;
  notFound: typeof notFoundData;
  branding: typeof brandingData;
  themes: typeof themesData;
  contact: typeof contactData;
  media: MediaLibrary;
  seo: typeof seoData;
  navigation: typeof navigationData;
  inventory: Inventory;
  contactMessages: ContactMessage[];

  setHome: (data: typeof homeData) => void;
  setCatalog: (data: typeof catalogData) => void;
  setLots: (data: typeof lotsData) => void;
  setProviders: (data: typeof providersData) => void;
  setContactContent: (data: typeof contactContentData) => void;
  setFinanciamiento: (data: typeof financiamientoData) => void;
  setNotFound: (data: typeof notFoundData) => void;
  setBranding: (data: typeof brandingData) => void;
  setThemes: (data: typeof themesData) => void;
  setContact: (data: typeof contactData) => void;
  setMedia: (data: MediaLibrary) => void;
  setSeo: (data: typeof seoData) => void;
  setNavigation: (data: typeof navigationData) => void;
  setInventory: (data: Inventory) => void;
  addContactMessage: (msg: Omit<ContactMessage, "id" | "createdAt" | "status">) => void;
  updateContactMessage: (id: string, updates: Partial<ContactMessage>) => void;
  deleteContactMessage: (id: string) => void;

  /** Serialized last-saved value per content file — the baseline for "dirty". */
  savedSnapshots: Record<string, string>;
  /** Record a file as just saved (its current value is now the baseline). */
  markSaved: (filename: string, data: unknown) => void;
  /** Revert a content entity to its last-saved snapshot (discard edits). */
  discardEntity: (filename: string) => void;
}

/** content filename → the store slice it maps to (for snapshots & discard). */
const ENTITY_BY_FILE: Record<string, keyof AdminStore> = {
  "home.json": "home",
  "catalog.json": "catalog",
  "lots.json": "lots",
  "providers.json": "providers",
  "contactContent.json": "contactContent",
  "financiamiento.json": "financiamiento",
  "notFound.json": "notFound",
  "branding.json": "branding",
  "themes.json": "themes",
  "contact.json": "contact",
  "media.json": "media",
  "seo.json": "seo",
  "navigation.json": "navigation",
  "inventory.json": "inventory",
};

const INITIAL_SNAPSHOTS: Record<string, string> = {
  "home.json": JSON.stringify(homeData),
  "catalog.json": JSON.stringify(catalogData),
  "lots.json": JSON.stringify(lotsData),
  "providers.json": JSON.stringify(providersData),
  "contactContent.json": JSON.stringify(contactContentData),
  "financiamiento.json": JSON.stringify(financiamientoData),
  "notFound.json": JSON.stringify(notFoundData),
  "branding.json": JSON.stringify(brandingData),
  "themes.json": JSON.stringify(themesData),
  "contact.json": JSON.stringify(contactData),
  "media.json": JSON.stringify(mediaData),
  "seo.json": JSON.stringify(seoData),
  "navigation.json": JSON.stringify(navigationData),
  "inventory.json": JSON.stringify(EMPTY_INVENTORY),
};

const MESSAGES_KEY = "ve-contact-messages";

function loadMessages(): ContactMessage[] {
  try {
    return JSON.parse(localStorage.getItem(MESSAGES_KEY) || "[]");
  } catch {
    return [];
  }
}

export const useAdminStore = create<AdminStore>((set) => ({
  home: homeData,
  catalog: catalogData,
  lots: lotsData,
  providers: providersData,
  contactContent: contactContentData,
  financiamiento: financiamientoData,
  notFound: notFoundData,
  branding: brandingData,
  themes: themesData,
  contact: contactData,
  media: mediaData as MediaLibrary,
  seo: seoData,
  navigation: navigationData,
  inventory: EMPTY_INVENTORY,
  contactMessages: loadMessages(),

  setHome: (data) => set({ home: data }),
  setCatalog: (data) => set({ catalog: data }),
  setLots: (data) => set({ lots: data }),
  setProviders: (data) => set({ providers: data }),
  setContactContent: (data) => set({ contactContent: data }),
  setFinanciamiento: (data) => set({ financiamiento: data }),
  setNotFound: (data) => set({ notFound: data }),
  setBranding: (data) => set({ branding: data }),
  setThemes: (data) => set({ themes: data }),
  setContact: (data) => set({ contact: data }),
  setMedia: (data) => set({ media: data }),
  setSeo: (data) => set({ seo: data }),
  setNavigation: (data) => set({ navigation: data }),
  setInventory: (data) => set({ inventory: data }),
  addContactMessage: (msg) =>
    set((state) => {
      const newMsg: ContactMessage = {
        ...msg,
        id: `msg-${Date.now()}`,
        status: "new",
        createdAt: new Date().toISOString(),
      };
      const updated = [newMsg, ...state.contactMessages];
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
      return { contactMessages: updated };
    }),
  updateContactMessage: (id, updates) =>
    set((state) => {
      const updated = state.contactMessages.map((m) =>
        m.id === id ? { ...m, ...updates } : m,
      );
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
      return { contactMessages: updated };
    }),
  deleteContactMessage: (id) =>
    set((state) => {
      const updated = state.contactMessages.filter((m) => m.id !== id);
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
      return { contactMessages: updated };
    }),

  savedSnapshots: INITIAL_SNAPSHOTS,
  markSaved: (filename, data) =>
    set((state) => ({
      savedSnapshots: { ...state.savedSnapshots, [filename]: JSON.stringify(data) },
    })),
  discardEntity: (filename) => {
    const snap = useAdminStore.getState().savedSnapshots[filename];
    const key = ENTITY_BY_FILE[filename];
    if (snap === undefined || !key) return;
    set({ [key]: JSON.parse(snap) } as Partial<AdminStore>);
  },
}));

/**
 * Whether `value` differs from the last-saved snapshot for `filename`. Works for
 * both editing models: draft pages pass their local draft; pages that mutate the
 * store directly pass the store slice. Re-renders when the snapshot changes
 * (i.e. after a save), so the floating Save button hides itself.
 */
/**
 * Hydrate the admin-only inventory slice from the (admin-only) repository,
 * keeping the dirty snapshot in sync so the graph never shows as "unsaved".
 * Called from the Inventory / Content-Explorer pages on mount. Because the only
 * callers live in tree-shaken admin code, the heavy `inventory.json` never
 * reaches the public bundle.
 */
export function hydrateInventory(data: Inventory) {
  useAdminStore.setState((state) => ({
    inventory: data,
    savedSnapshots: {
      ...state.savedSnapshots,
      "inventory.json": JSON.stringify(data),
    },
  }));
}

export function useEntityDirty(filename: string, value: unknown): boolean {
  const snap = useAdminStore((s) => s.savedSnapshots[filename]);
  return JSON.stringify(value) !== snap;
}

export async function downloadJson(filename: string, data: unknown) {
  // In local dev, write straight into the repo file (ready to commit). Falls
  // back to a browser download when the write-back endpoint isn't available.
  const wrote = await saveContentFile(filename, data);
  if (wrote) {
    console.info(`[local-cms] saved ${filename} to the repo`);
  } else {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  // The entity is now clean (matches what's on disk); the working tree has
  // pending changes to publish. Mark the entity clean, and notify the admin
  // shell to re-check publish state — via a DOM event so this module stays free
  // of admin-only imports (admin-store is also pulled into the public bundle by
  // the contact form, and we don't want the admin-ui store leaking there).
  useAdminStore.getState().markSaved(filename, data);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ve:content-saved"));
  }
}
