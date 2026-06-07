import { create } from "zustand";
import { saveContentFile } from "./local-cms";
import homeData from "../content/home.json";
import brandingData from "../content/branding.json";
import themesData from "../content/themes.json";
import contactData from "../content/contact.json";
import mediaData from "../content/media.json";
import seoData from "../content/seo.json";
import navigationData from "../content/navigation.json";
import inventoryData from "../content/inventory.json";
import type { MediaLibrary } from "./media";

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
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
}

interface AdminStore {
  home: typeof homeData;
  branding: typeof brandingData;
  themes: typeof themesData;
  contact: typeof contactData;
  media: MediaLibrary;
  seo: typeof seoData;
  navigation: typeof navigationData;
  inventory: typeof inventoryData;
  contactMessages: ContactMessage[];

  setHome: (data: typeof homeData) => void;
  setBranding: (data: typeof brandingData) => void;
  setThemes: (data: typeof themesData) => void;
  setContact: (data: typeof contactData) => void;
  setMedia: (data: MediaLibrary) => void;
  setSeo: (data: typeof seoData) => void;
  setNavigation: (data: typeof navigationData) => void;
  setInventory: (data: typeof inventoryData) => void;
  addContactMessage: (msg: Omit<ContactMessage, "id" | "createdAt" | "status">) => void;
  updateContactMessage: (id: string, updates: Partial<ContactMessage>) => void;

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
  "branding.json": JSON.stringify(brandingData),
  "themes.json": JSON.stringify(themesData),
  "contact.json": JSON.stringify(contactData),
  "media.json": JSON.stringify(mediaData),
  "seo.json": JSON.stringify(seoData),
  "navigation.json": JSON.stringify(navigationData),
  "inventory.json": JSON.stringify(inventoryData),
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
  branding: brandingData,
  themes: themesData,
  contact: contactData,
  media: mediaData as MediaLibrary,
  seo: seoData,
  navigation: navigationData,
  inventory: inventoryData,
  contactMessages: loadMessages(),

  setHome: (data) => set({ home: data }),
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
