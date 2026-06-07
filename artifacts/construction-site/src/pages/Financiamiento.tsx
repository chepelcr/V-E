import { motion } from 'framer-motion';
import { Phone, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useT } from '@/lib/admin-i18n';
import { fadeUp } from '@/lib/motion';
import { getFinanciamiento } from '@/repositories/financiamiento.repository';
import { getCompany } from '@/repositories/company.repository';
import { resolveLocalized } from '@/lib/resolveLocalized';
import { resolveIcon } from '@/lib/icons';
import { useHeadTags } from '@/lib/seo';

/**
 * Public Financiamiento page. All copy comes from `financiamiento.json`
 * (resolved through the repository + tolerant `resolveLocalized` + the icon
 * registry); the phones / email shown in the contact CTA come from the shared
 * `contact.json` (company entity) so they never drift from the rest of the
 * site. No bilingual ternaries, no module-level `{es,en}` arrays, no hardcoded
 * user-visible text. The glass panels, classes and reveal animations are
 * unchanged.
 */
export default function Financiamiento() {
  const { language } = useLanguage();
  const { t } = useT();
  useHeadTags('/financiamiento', language);
  const content = getFinanciamiento();
  const company = getCompany();
  const rl = (v: unknown) => resolveLocalized(v as never, language);

  const TurnkeyBulletIcon = resolveIcon(content.turnkey.bulletIconName);

  const phones = company.phones;
  const telHref = (phone: string) => `tel:+${company.countryCode}${phone.replace(/\D/g, '')}`;

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4">
          {rl(content.title)}
        </h1>
        <p className="text-muted-foreground font-light max-w-2xl text-lg">
          {rl(content.subtitle)}
        </p>
      </motion.div>

      {/* Financing Cards */}
      <section className="mb-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-serif text-2xl text-primary/80 mb-8 uppercase tracking-widest text-sm"
        >
          {rl(content.optionsHeading)}
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.options.map((opt, i) => {
            const Icon = resolveIcon(opt.iconName);
            return (
              <motion.div
                key={i}
                variants={fadeUp(i * 0.1)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                data-testid={`card-financing-${i}`}
                className="glass-panel border border-border/40 p-6 backdrop-blur-sm flex flex-col gap-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 border border-primary/30 text-primary">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-serif text-xl text-foreground">
                    {rl(opt.title)}
                  </h3>
                </div>
                <p className="text-muted-foreground font-light text-sm leading-relaxed">
                  {rl(opt.description)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-16">
        <div className="flex-1 h-px bg-border/40" />
        <span className="text-primary/60 text-xs tracking-widest uppercase font-light">
          {rl(content.projectsDivider)}
        </span>
        <div className="flex-1 h-px bg-border/40" />
      </div>

      {/* Project Types */}
      <section className="mb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {content.projectTypes.map((pt, i) => {
            const Icon = resolveIcon(pt.iconName);
            return (
              <motion.div
                key={i}
                variants={fadeUp(i * 0.1)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                data-testid={`card-project-${i}`}
                className="glass-panel border border-border/30 p-5 flex flex-col items-center gap-3 text-center hover:border-primary/40 transition-colors"
              >
                <Icon size={28} className="text-primary" />
                <span className="text-sm font-light tracking-wide">
                  {rl(pt.label)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Services + CTA */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* Service list */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel border border-border/40 p-8"
        >
          <h3 className="font-serif text-2xl text-primary mb-6">
            {rl(content.turnkey.heading)}
          </h3>
          <p className="text-muted-foreground font-light text-sm mb-6">
            {rl(content.turnkey.body)}
          </p>
          <ul className="space-y-3">
            {content.turnkey.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <TurnkeyBulletIcon size={16} className="text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-light text-muted-foreground">
                  {rl(item)}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-primary/10 border border-primary/30 p-8 flex flex-col justify-between"
        >
          <div>
            <h3 className="font-serif text-2xl text-primary mb-3">
              {rl(content.cta.heading)}
            </h3>
            <p className="text-muted-foreground font-light text-sm mb-8">
              {rl(content.cta.body)}
            </p>
          </div>

          <div className="space-y-4">
            {phones[0] && (
              <a
                href={telHref(phones[0])}
                data-testid="link-phone-primary"
                className="flex items-center gap-3 group"
              >
                <div className="p-2.5 border border-primary/40 text-primary group-hover:bg-primary/10 transition-colors">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-light">
                    {t('chrome.social.whatsapp')}
                  </p>
                  <p className="text-foreground font-light tracking-wider">{phones[0]}</p>
                </div>
              </a>
            )}
            {phones[1] && (
              <a
                href={telHref(phones[1])}
                data-testid="link-phone-secondary"
                className="flex items-center gap-3 group"
              >
                <div className="p-2.5 border border-border/40 text-muted-foreground group-hover:border-primary/40 group-hover:text-primary transition-colors">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-light">
                    {t('chrome.form.phone')}
                  </p>
                  <p className="text-foreground font-light tracking-wider">{phones[1]}</p>
                </div>
              </a>
            )}
            <a
              href={`mailto:${company.email}`}
              data-testid="link-email"
              className="flex items-center gap-3 group"
            >
              <div className="p-2.5 border border-border/40 text-muted-foreground group-hover:border-primary/40 group-hover:text-primary transition-colors">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-light">
                  {t('chrome.form.email')}
                </p>
                <p className="text-foreground font-light tracking-wider text-sm">{company.email}</p>
              </div>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Bottom tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center py-8 border-t border-border/30"
      >
        <p className="font-serif text-xl text-primary/70 italic">
          {rl(content.tagline)}
        </p>
      </motion.div>
    </div>
  );
}
