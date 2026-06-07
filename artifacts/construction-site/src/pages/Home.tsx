import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Phone, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useT } from '@/lib/admin-i18n';
import { fadeUp } from '@/lib/motion';
import { getBranding } from '@/repositories/branding.repository';
import { getHomeView } from '@/services/home.service';

/**
 * Public Home page. All copy comes from `home.json` (resolved through
 * `home.service.ts` → repository + tolerant `resolveLocalized` + the icon
 * registry); fixed UI chrome (CTA verbs) comes from `t("chrome.*")`; the company
 * name comes from the branding entity. No bilingual ternaries, no module-level
 * `{es,en}` arrays, no hardcoded user-visible text. The marble background, glass
 * scrims/panels/sections, classes and reveal animations are unchanged.
 */
export default function Home() {
  const { language } = useLanguage();
  const { t } = useT();
  const home = getHomeView(language);
  const branding = getBranding();

  const HeroPrimaryIcon = home.hero.PrimaryIcon;
  const BulletIcon = home.services.BulletIcon;
  const WhatsappIcon = home.cta.WhatsappIcon;

  return (
    <div className="flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="min-h-[85vh] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 glass-scrim" />
        <motion.div
          className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.2 } } }}
        >
          <motion.h1
            className="font-serif text-3xl sm:text-5xl md:text-7xl lg:text-8xl tracking-wide sm:tracking-widest text-primary uppercase mb-4 break-words"
            variants={fadeUp(0)}
          >
            {branding.companyName}
          </motion.h1>
          <motion.p
            className="text-sm sm:text-base md:text-lg text-muted-foreground font-light tracking-[0.12em] sm:tracking-[0.25em] uppercase max-w-xl mb-6"
            variants={fadeUp(0.1)}
          >
            {home.hero.subtitle}
          </motion.p>
          <motion.div variants={fadeUp(0.2)} className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link
              href={home.hero.primaryCtaHref}
              data-testid="button-hero-financing"
              className="px-8 py-3 bg-primary text-primary-foreground text-xs tracking-widest uppercase font-light hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {t('chrome.actions.viewFinancing')} <HeroPrimaryIcon size={14} />
            </Link>
            <Link
              href={home.hero.secondaryCtaHref}
              data-testid="button-hero-contact"
              className="px-8 py-3 border border-primary/40 text-primary text-xs tracking-widest uppercase font-light hover:border-primary transition-colors"
            >
              {t('chrome.actions.contactNow')}
            </Link>
          </motion.div>
          <motion.div variants={fadeUp(0.3)} className="mt-14">
            <div className="w-px h-20 bg-gradient-to-b from-primary to-transparent mx-auto" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── ¿Quiénes Somos? ───────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp(0)}
            >
              <p className="text-xs text-primary tracking-[0.3em] uppercase mb-3 font-light">
                {home.about.eyebrow}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6">
                {home.about.heading}
              </h2>
              <p className="text-muted-foreground leading-relaxed font-light text-lg mb-8">
                {home.about.body}
              </p>
              <div className="flex flex-col gap-3">
                {home.contact.phones.map((p, i) => (
                  <a key={i} href={`tel:+506${p.replace(/-/g, '')}`}
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors font-light"
                    data-testid={`link-phone-home-${i}`}>
                    <Phone size={15} className="text-primary shrink-0" />
                    <span className="tracking-wider">{p}</span>
                  </a>
                ))}
                <a href={`mailto:${home.contact.email}`}
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors font-light"
                  data-testid="link-email-home">
                  <Mail size={15} className="text-primary shrink-0" />
                  <span>{home.contact.email}</span>
                </a>
              </div>
            </motion.div>

            <div className="space-y-8">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.1)}>
                <p className="text-xs text-primary/70 tracking-widest uppercase mb-2 font-light">
                  {t('chrome.corporate.mission')}
                </p>
                <p className="text-foreground leading-relaxed font-light">{home.about.mission}</p>
              </motion.div>
              <div className="h-px bg-border/30" />
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.2)}>
                <p className="text-xs text-primary/70 tracking-widest uppercase mb-2 font-light">
                  {t('chrome.corporate.vision')}
                </p>
                <p className="text-foreground leading-relaxed font-light">{home.about.vision}</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Nuestros Servicios ────────────────────────────────────────── */}
      <section className="py-24 glass-section backdrop-blur-sm border-y border-border/30">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp(0)}
            className="text-center mb-14"
          >
            <p className="text-xs text-primary tracking-[0.3em] uppercase mb-3 font-light">
              {home.services.eyebrow}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground">
              {home.services.heading}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {home.services.cards.map((card, idx) => {
              const CardIcon = card.Icon;
              return (
                <motion.div
                  key={idx}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp(0.1 * (idx + 1))}
                  className="glass-panel border border-border/40 p-8 hover:border-primary/30 transition-colors"
                  data-testid={idx === 0 ? 'card-service-financial' : 'card-service-construction'}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 border border-primary/30 text-primary">
                      <CardIcon size={20} />
                    </div>
                    <h3 className="font-serif text-xl">
                      {card.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {card.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <BulletIcon size={15} className="text-primary mt-0.5 shrink-0" />
                        <span className="text-sm font-light text-muted-foreground leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Valores ───────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 text-center">
            {home.values.map((v, i) => {
              const Icon = v.Icon;
              return (
                <motion.div
                  key={i}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp(i * 0.1)}
                  className="flex flex-col items-center gap-4"
                  data-testid={`card-value-${i}`}
                >
                  <div className="p-4 border border-primary/30 text-primary">
                    <Icon size={24} />
                  </div>
                  <span className="font-serif text-lg tracking-widest text-foreground uppercase">
                    {v.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Final ─────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-border/30">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp(0)}
          >
            <p className="text-xs text-primary tracking-[0.3em] uppercase mb-4 font-light">
              {home.cta.eyebrow}
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-foreground mb-4">
              {home.cta.heading}
            </h2>
            <p className="text-muted-foreground font-light mb-10 text-lg">
              {home.cta.body}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={home.contact.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="button-cta-whatsapp"
                className="px-10 py-4 bg-primary text-primary-foreground text-xs tracking-widest uppercase font-light hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <WhatsappIcon size={14} /> {home.contact.whatsappLabel}
              </a>
              <Link
                href={home.cta.financingCtaHref}
                data-testid="button-cta-financing"
                className="px-10 py-4 border border-border/50 text-muted-foreground text-xs tracking-widest uppercase font-light hover:border-primary hover:text-primary transition-colors"
              >
                {t('chrome.actions.viewFinancing')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
