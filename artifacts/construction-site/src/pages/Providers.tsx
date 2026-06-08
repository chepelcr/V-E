import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useT } from '@/lib/admin-i18n';
import { getProviders } from '@/repositories/providers.repository';
import { resolveLocalized } from '@/lib/resolveLocalized';
import { motion } from 'framer-motion';
import { useHeadTags } from '@/lib/seo';

/**
 * Public Providers page. All copy comes from `providers.json` (resolved through
 * the repository + tolerant `resolveLocalized`); fixed UI chrome (the Materials/
 * Website/Contact field labels) comes from `t("chrome.fields.*")`. Provider
 * `name` is a brand proper noun (plain); `description` and per-item `materials`
 * are localized `{es,en}`. No bilingual ternaries; copy is read only through the
 * content JSON. Visual structure, classes and animations are unchanged.
 */
export default function Providers() {
  const { language } = useLanguage();
  const { t } = useT();
  useHeadTags('/providers', language);

  const providers = useMemo(() => {
    const data = getProviders();
    return {
      title: resolveLocalized(data.intro.title, language),
      subtitle: resolveLocalized(data.intro.subtitle, language),
      items: data.items.map((p) => ({
        id: p.id,
        name: p.name,
        description: resolveLocalized(p.description, language),
        materials: p.materials.map((m) => resolveLocalized(m, language)),
        website: p.website,
        contact: p.contact,
      })),
    };
  }, [language]);

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4">{providers.title}</h1>
        <p className="text-muted-foreground font-light mb-12 max-w-2xl">
          {providers.subtitle}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {providers.items.map((provider, index) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 bg-card border border-white/5 flex flex-col h-full"
            >
              <h3 className="font-serif text-2xl text-foreground mb-4">{provider.name}</h3>
              <p className="font-light text-muted-foreground mb-8 flex-grow">
                {provider.description}
              </p>

              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-widest text-primary mb-3">{t('chrome.fields.materials')}</h4>
                <div className="flex flex-wrap gap-2">
                  {provider.materials.map((mat, mi) => (
                    <span key={mi} className="text-xs border border-white/10 px-3 py-1 text-muted-foreground">
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              {(provider.contact || provider.website) && (
                <div className="text-sm font-light text-muted-foreground border-t border-white/5 pt-4 mt-auto">
                  {provider.website && <div className="mb-1">{provider.website}</div>}
                  {provider.contact && <div>{provider.contact}</div>}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
