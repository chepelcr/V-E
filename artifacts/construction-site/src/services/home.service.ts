import { getHome } from "@/repositories/home.repository";
import { getCompany } from "@/repositories/company.repository";
import { resolveLocalized } from "@/lib/resolveLocalized";
import { resolveIcon, type IconComponent } from "@/lib/icons";
import type { Language } from "@/i18n/translations";

/**
 * Home view-model service. Reads the `home.json` singleton (via its repository)
 * and the shared company/contact entity, then resolves every localized field +
 * icon token for the requested language. The public `Home.tsx` consumes this
 * read-only view-model — it never touches the raw JSON shape, the resolver, or
 * the icon registry directly. This proves the JSON → repository → service →
 * component chain end-to-end (the Home entity is a content singleton, so the
 * "service" assembles a presentation model rather than filtering a list).
 */

export interface HomeServiceItem {
  Icon: IconComponent;
  title: string;
  items: string[];
}

export interface HomeValue {
  Icon: IconComponent;
  label: string;
}

export interface HomeViewModel {
  hero: {
    subtitle: string;
    PrimaryIcon: IconComponent;
    primaryCtaHref: string;
    secondaryCtaHref: string;
  };
  about: {
    eyebrow: string;
    heading: string;
    body: string;
    mission: string;
    vision: string;
  };
  services: {
    eyebrow: string;
    heading: string;
    BulletIcon: IconComponent;
    cards: HomeServiceItem[];
  };
  values: HomeValue[];
  cta: {
    eyebrow: string;
    heading: string;
    body: string;
    WhatsappIcon: IconComponent;
    financingCtaHref: string;
  };
  contact: {
    phones: string[];
    email: string;
    /** Primary phone digits-only, prefixed with the country code, for wa.me. */
    whatsappHref: string;
    whatsappLabel: string;
  };
}

/** Strip non-digit characters so a display phone becomes a tel/wa.me target. */
function digits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Assemble the fully-resolved Home view-model for the given language. */
export function getHomeView(lang: Language): HomeViewModel {
  const home = getHome();
  const company = getCompany();
  const rl = (v: unknown) => resolveLocalized(v as never, lang);

  const cards: HomeServiceItem[] = (["financial", "construction"] as const).map(
    (key) => {
      const card = home.services[key];
      return {
        Icon: resolveIcon(card.iconName),
        title: rl(card.title),
        items: card.items.map((it) => rl(it)),
      };
    },
  );

  const values: HomeValue[] = home.values.map((v) => ({
    Icon: resolveIcon(v.iconName),
    label: rl(v.label),
  }));

  const primaryPhone = company.phones[0] ?? "";
  const whatsappHref = `https://wa.me/${company.countryCode}${digits(primaryPhone)}`;

  return {
    hero: {
      subtitle: rl(home.hero.subtitle),
      PrimaryIcon: resolveIcon(home.hero.primaryCtaIconName),
      primaryCtaHref: home.hero.primaryCtaHref,
      secondaryCtaHref: home.hero.secondaryCtaHref,
    },
    about: {
      eyebrow: rl(home.about.eyebrow),
      heading: rl(home.about.heading),
      body: rl(home.about.body),
      mission: rl(home.about.mission),
      vision: rl(home.about.vision),
    },
    services: {
      eyebrow: rl(home.services.eyebrow),
      heading: rl(home.services.heading),
      BulletIcon: resolveIcon(home.services.bulletIconName),
      cards,
    },
    values,
    cta: {
      eyebrow: rl(home.cta.eyebrow),
      heading: rl(home.cta.heading),
      body: rl(home.cta.body),
      WhatsappIcon: resolveIcon(home.cta.whatsappIconName),
      financingCtaHref: home.cta.financingCtaHref,
    },
    contact: {
      phones: company.phones,
      email: company.email,
      whatsappHref,
      whatsappLabel: `WhatsApp: ${primaryPhone}`,
    },
  };
}
