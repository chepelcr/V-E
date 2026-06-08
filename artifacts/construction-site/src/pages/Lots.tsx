import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useT } from '@/lib/admin-i18n';
import {
  getLotsView,
  provincesOf,
  cantonsOf,
  districtsOf,
  filterLots,
  type LotFilter,
} from '@/services/lots.service';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useHeadTags } from '@/lib/seo';

/**
 * Public Lots page. All copy comes from `lots.json` (resolved through
 * `lots.service.ts` → repository + tolerant `resolveLocalized`); fixed UI chrome
 * (filter labels, placeholders, sold badge, empty state) comes from
 * `t("chrome.*")`; the measurement unit comes from chrome. The
 * province/canton/district + minimum-size filter logic lives in the service.
 * No bilingual ternaries; copy is read only through the content JSON. Visual
 * structure, classes and animations are unchanged.
 */
export default function Lots() {
  const { language } = useLanguage();
  const { t } = useT();
  useHeadTags('/lots', language);
  const lots = getLotsView(language);
  const measurementUnit = t('chrome.fields.measurementUnit');

  const [province, setProvince] = useState<string>('all');
  const [canton, setCanton] = useState<string>('all');
  const [district, setDistrict] = useState<string>('all');
  const [minSize, setMinSize] = useState<string>('');

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);

  const provinces = useMemo(() => provincesOf(lots.items), [lots.items]);
  const cantons = useMemo(() => cantonsOf(lots.items, province), [lots.items, province]);
  const districts = useMemo(() => districtsOf(lots.items, canton), [lots.items, canton]);

  const filteredLots = useMemo(() => {
    const filter: LotFilter = { province, canton, district, minSize };
    return filterLots(lots.items, filter);
  }, [lots.items, province, canton, district, minSize]);

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4">{lots.title}</h1>
        <p className="text-muted-foreground font-light mb-12 max-w-2xl">
          {lots.subtitle}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12 p-6 bg-card border border-white/5">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">{t('chrome.filters.province')}</label>
            <Select value={province} onValueChange={(v) => { setProvince(v); setCanton('all'); setDistrict('all'); }}>
              <SelectTrigger className="bg-transparent border-white/10 focus:border-primary">
                <SelectValue placeholder={t('chrome.filters.allProvinces')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('chrome.filters.allProvinces')}</SelectItem>
                {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">{t('chrome.filters.canton')}</label>
            <Select value={canton} onValueChange={(v) => { setCanton(v); setDistrict('all'); }} disabled={province === 'all'}>
              <SelectTrigger className="bg-transparent border-white/10 focus:border-primary">
                <SelectValue placeholder={t('chrome.filters.allCantons')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('chrome.filters.allCantons')}</SelectItem>
                {cantons.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">{t('chrome.filters.district')}</label>
            <Select value={district} onValueChange={setDistrict} disabled={canton === 'all'}>
              <SelectTrigger className="bg-transparent border-white/10 focus:border-primary">
                <SelectValue placeholder={t('chrome.filters.allDistricts')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('chrome.filters.allDistricts')}</SelectItem>
                {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">{t('chrome.filters.minSize')} ({measurementUnit})</label>
            <Input
              type="number"
              placeholder={t('chrome.filters.sizePlaceholder')}
              value={minSize}
              onChange={(e) => setMinSize(e.target.value)}
              className="bg-transparent border-white/10 focus-visible:border-primary focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="space-y-6">
          {filteredLots.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              {t('chrome.common.noResults')}
            </div>
          ) : (
            filteredLots.map((lot, index) => (
              <motion.div
                key={lot.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col md:flex-row justify-between p-6 bg-card border border-white/5 hover:border-primary/50 transition-colors"
              >
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-serif text-2xl text-foreground">{lot.name}</h3>
                    {!lot.available && <span className="text-xs border border-destructive text-destructive px-2 py-1 uppercase tracking-widest">{t('chrome.status.unavailable')}</span>}
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    {lot.location.district}, {lot.location.canton}, {lot.location.province}
                  </p>
                  <p className="font-light text-sm max-w-2xl">{lot.description}</p>
                </div>
                <div className="text-left md:text-right flex flex-col justify-between">
                  <div className="text-2xl text-primary mb-2">
                    {formatPrice(lot.price, lot.currency)}
                  </div>
                  <div className="text-sm font-light text-muted-foreground uppercase tracking-widest">
                    {lot.size} {measurementUnit}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
