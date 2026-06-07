import esChrome from "@/translations/es.json";
import enChrome from "@/translations/en.json";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/i18n/translations";

/**
 * Small i18n helper for the dev-only admin shell + the public shared chrome.
 *
 * It deliberately does NOT introduce a second i18n runtime: it reads the active
 * language from the existing `LanguageContext` and resolves dotted keys against
 * the SMALL shared `src/translations/{es,en}.json` files (chrome.* for the
 * public site, admin.* for the admin panel). This keeps the admin chrome fully
 * bilingual without a parallel i18next/react-i18next stack.
 */

const BUNDLES: Record<Language, Record<string, unknown>> = {
  es: esChrome as Record<string, unknown>,
  en: enChrome as Record<string, unknown>,
};

/** Resolve a dotted key (e.g. "admin.publish") from a translation bundle. */
export function resolveKey(lang: Language, key: string, fallback?: string): string {
  const parts = key.split(".");
  let node: unknown = BUNDLES[lang];
  for (const p of parts) {
    if (node && typeof node === "object" && p in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[p];
    } else {
      node = undefined;
      break;
    }
  }
  if (typeof node === "string") return node;
  return fallback ?? key;
}

/** A plain (non-hook) translator for the given language. */
export function makeT(lang: Language) {
  return (key: string, fallback?: string) => resolveKey(lang, key, fallback);
}

/**
 * Hook: returns `{ t, language }` bound to the current `LanguageContext`
 * language. Admin chrome and public shared-chrome lookups go through this.
 */
export function useT() {
  const { language } = useLanguage();
  return { t: (key: string, fallback?: string) => resolveKey(language, key, fallback), language };
}
