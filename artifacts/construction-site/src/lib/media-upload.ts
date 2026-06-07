import { useAdminStore, downloadJson } from "./admin-store";
import { uploadAsset } from "./local-cms";
import type { MediaItem, MediaKind } from "./media";

/**
 * Admin-only helpers that add assets to the media library (`media.json`) and
 * persist it. Local uploads also write the binary into `public/media/` via the
 * dev write-back endpoint. Imported only by admin pages, so it's tree-shaken out
 * of the public bundle.
 */

function sanitizeFilename(name: string): string {
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const base =
    (dot >= 0 ? name.slice(0, dot) : name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "asset";
  return ext ? `${base}.${ext}` : base;
}

export function kindFromMime(mime: string): MediaKind {
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "image";
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Ensure the name doesn't collide with an existing library filename. */
function dedupe(filename: string, taken: Set<string>): string {
  if (!taken.has(filename)) return filename;
  const dot = filename.lastIndexOf(".");
  const base = dot >= 0 ? filename.slice(0, dot) : filename;
  const ext = dot >= 0 ? filename.slice(dot) : "";
  return `${base}-${Date.now()}${ext}`;
}

/**
 * Upload a file from disk into `public/media/`, register it in `media.json`, and
 * persist the library. Returns the new item, or null when the dev endpoint isn't
 * available (e.g. not running the local server).
 */
export async function uploadToLibrary(file: File): Promise<MediaItem | null> {
  const dataUrl = await readAsDataUrl(file);
  const lib = useAdminStore.getState().media;
  const taken = new Set(lib.items.map((i) => i.filename));
  const filename = dedupe(sanitizeFilename(file.name), taken);
  const res = await uploadAsset(filename, dataUrl, "media");
  if (!res.ok || !res.url) return null;
  const item: MediaItem = {
    id: `media-${Date.now()}`,
    kind: kindFromMime(file.type),
    source: "local",
    path: res.url,
    filename,
    mime: file.type,
    size: file.size,
    alt: { es: "", en: "" },
    createdAt: new Date().toISOString(),
  };
  const next = { items: [item, ...lib.items] };
  useAdminStore.getState().setMedia(next);
  await downloadJson("media.json", next);
  return item;
}

/** Register an external (off-site) URL in the library and persist it. */
export async function addExternalToLibrary(
  url: string,
  kind: MediaKind = "image",
): Promise<MediaItem> {
  const lib = useAdminStore.getState().media;
  const item: MediaItem = {
    id: `media-${Date.now()}`,
    kind,
    source: "external",
    url,
    filename: url.split("/").pop() || url,
    mime: "",
    size: 0,
    alt: { es: "", en: "" },
    createdAt: new Date().toISOString(),
  };
  const next = { items: [item, ...lib.items] };
  useAdminStore.getState().setMedia(next);
  await downloadJson("media.json", next);
  return item;
}

export async function removeFromLibrary(id: string): Promise<void> {
  const lib = useAdminStore.getState().media;
  const next = { items: lib.items.filter((i) => i.id !== id) };
  useAdminStore.getState().setMedia(next);
  await downloadJson("media.json", next);
}
