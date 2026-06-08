import { getContactContent } from "@/repositories/contact-content.repository";
import { getCatalogModels } from "@/repositories/catalog.repository";
import { getLotItems } from "@/repositories/lots.repository";
import { resolveLocalized } from "@/lib/resolveLocalized";
import type { Language } from "@/i18n/translations";

/**
 * Contact page view-model service. Resolves the intro copy from
 * `contactContent.json`, and derives the model/lot dropdown options from the
 * shared catalog + lots content so the contact form's reference selectors stay
 * in sync with what's actually published. The public `Contact.tsx` consumes this
 * read-only view-model — it never reads the raw content JSON shapes directly.
 */

export interface ReferenceOption {
  /** Stored value (model/lot id) submitted with the message. */
  value: string;
  /** Human-readable label (proper-noun name, with district for lots). */
  label: string;
}

export interface ContactViewModel {
  intro: {
    title: string;
    subtitle: string;
  };
  modelOptions: ReferenceOption[];
  lotOptions: ReferenceOption[];
}

export function getContactView(lang: Language): ContactViewModel {
  const content = getContactContent();
  const rl = (v: unknown) => resolveLocalized(v as never, lang);

  // Model/lot names are proper nouns (plain strings); resolveLocalized passes
  // plain strings through unchanged, so this is correct either way.
  const modelOptions: ReferenceOption[] = getCatalogModels().map((m) => ({
    value: m.id,
    label: rl(m.name),
  }));

  const lotOptions: ReferenceOption[] = getLotItems().map((l) => ({
    value: l.id,
    label: `${rl(l.name)} — ${l.location.district}`,
  }));

  return {
    intro: {
      title: rl(content.intro.title),
      subtitle: rl(content.intro.subtitle),
    },
    modelOptions,
    lotOptions,
  };
}
