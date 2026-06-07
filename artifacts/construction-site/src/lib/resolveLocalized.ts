import type { Language } from "@/i18n/translations";

/** A field that carries both Spanish and English copy. */
export interface Localized {
  es: string;
  en: string;
}

/**
 * A field that may be plain-or-localized. During the plain→`{es,en}` migration,
 * content can be in either shape; this type keeps consumers tolerant.
 */
export type MaybeLocalized = string | Localized | undefined | null;

/**
 * Tolerant resolver used everywhere a content field may be a plain string OR a
 * `{ es, en }` object. Accepts BOTH shapes so a partially-migrated content tree
 * keeps rendering at every step:
 *
 *   - plain string        → returned as-is
 *   - `{ es, en }` object  → the requested language, falling back to `es`
 *   - missing              → ""
 */
export function resolveLocalized(value: MaybeLocalized, lang: Language): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value.es ?? value.en ?? "";
}

/** Convenience for arrays of (maybe) localized strings. */
export function resolveLocalizedList(
  values: MaybeLocalized[] | undefined | null,
  lang: Language,
): string[] {
  if (!values) return [];
  return values.map((v) => resolveLocalized(v, lang));
}
