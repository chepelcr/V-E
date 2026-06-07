import React from 'react';
import { Link } from 'wouter';
import { useSiteData } from '@/contexts/SiteDataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, HardHat, ShieldCheck, Handshake, Star, Phone, Mail, ArrowRight } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: 'easeOut' as const } },
});

const financialServices = {
  es: [
    'Análisis financiero personalizado',
    'Evaluación de capacidad de crédito',
    'Orientación en trámites bancarios',
    'Asesoría en subsidios y bonos habitacionales',
    'Planificación financiera para tu inversión',
  ],
  en: [
    'Personalised financial analysis',
    'Credit capacity assessment',
    'Banking procedures guidance',
    'Housing subsidy and bond advisory',
    'Financial planning for your investment',
  ],
};

const constructionServices = {
  es: [
    'Evaluación y revisión de planos',
    'Asesoría en costos y presupuestos',
    'Supervisión y seguimiento de obra',
    'Recomendaciones técnicas para construcciones seguras y de calidad',
    'Acompañamiento en cada etapa del proceso constructivo',
  ],
  en: [
    'Blueprint evaluation and review',
    'Cost and budget advisory',
    'Construction site supervision and tracking',
    'Technical recommendations for safe, quality builds',
    'Guidance at every stage of the construction process',
  ],
};

const values = [
  { icon: ShieldCheck, es: 'Confianza', en: 'Trust' },
  { icon: Handshake,   es: 'Compromiso', en: 'Commitment' },
  { icon: Star,        es: 'Experiencia', en: 'Experience' },
];

export default function Home() {
  const { siteData } = useSiteData();
  const { language } = useLanguage();
  const es = language === 'es';

  return (
    <div className="flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="min-h-[85vh] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-background/50" />
        <motion.div
          className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.2 } } }}
        >
          <motion.h1
            className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-widest text-primary uppercase mb-4"
            variants={fadeUp(0)}
          >
            {siteData.config.companyName}
          </motion.h1>
          <motion.p
            className="text-base md:text-lg text-muted-foreground font-light tracking-[0.25em] uppercase max-w-xl mb-6"
            variants={fadeUp(0.1)}
          >
            {es
              ? 'Tu aliado estratégico en cada etapa del proceso para obtener tu casa de bono.'
              : 'Your strategic partner at every step of the process to get your housing bond home.'}
          </motion.p>
          <motion.div variants={fadeUp(0.2)} className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link
              href="/financiamiento"
              data-testid="button-hero-financing"
              className="px-8 py-3 bg-primary text-primary-foreground text-xs tracking-widest uppercase font-light hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {es ? 'Ver Financiamiento' : 'View Financing'} <ArrowRight size={14} />
            </Link>
            <Link
              href="/contact"
              data-testid="button-hero-contact"
              className="px-8 py-3 border border-primary/40 text-primary text-xs tracking-widest uppercase font-light hover:border-primary transition-colors"
            >
              {es ? 'Contactar Ahora' : 'Contact Now'}
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
                {es ? '¿Quiénes Somos?' : 'Who We Are'}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6">
                {es ? 'Especialistas en tu hogar propio' : 'Specialists in home ownership'}
              </h2>
              <p className="text-muted-foreground leading-relaxed font-light text-lg mb-8">
                {siteData.corporate.about}
              </p>
              <div className="flex flex-col gap-3">
                {siteData.contact.phones.map((p, i) => (
                  <a key={i} href={`tel:+506${p.replace(/-/g,'')}`}
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors font-light"
                    data-testid={`link-phone-home-${i}`}>
                    <Phone size={15} className="text-primary shrink-0" />
                    <span className="tracking-wider">{p}</span>
                  </a>
                ))}
                <a href={`mailto:${siteData.contact.email}`}
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors font-light"
                  data-testid="link-email-home">
                  <Mail size={15} className="text-primary shrink-0" />
                  <span>{siteData.contact.email}</span>
                </a>
              </div>
            </motion.div>

            <div className="space-y-8">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.1)}>
                <p className="text-xs text-primary/70 tracking-widest uppercase mb-2 font-light">
                  {es ? 'Misión' : 'Mission'}
                </p>
                <p className="text-foreground leading-relaxed font-light">{siteData.corporate.mission}</p>
              </motion.div>
              <div className="h-px bg-border/30" />
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(0.2)}>
                <p className="text-xs text-primary/70 tracking-widest uppercase mb-2 font-light">
                  {es ? 'Visión' : 'Vision'}
                </p>
                <p className="text-foreground leading-relaxed font-light">{siteData.corporate.vision}</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Nuestros Servicios ────────────────────────────────────────── */}
      <section className="py-24 bg-card/30 backdrop-blur-sm border-y border-border/30">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp(0)}
            className="text-center mb-14"
          >
            <p className="text-xs text-primary tracking-[0.3em] uppercase mb-3 font-light">
              {es ? 'Nuestros Servicios' : 'Our Services'}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground">
              {es ? 'Asesoramiento integral para tu proyecto' : 'Comprehensive advisory for your project'}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Asesoramiento Financiero */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp(0.1)}
              className="bg-background/60 border border-border/40 p-8 hover:border-primary/30 transition-colors"
              data-testid="card-service-financial"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 border border-primary/30 text-primary">
                  <TrendingUp size={20} />
                </div>
                <h3 className="font-serif text-xl">
                  {es ? 'Asesoramiento Financiero' : 'Financial Advisory'}
                </h3>
              </div>
              <ul className="space-y-3">
                {(es ? financialServices.es : financialServices.en).map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={15} className="text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-light text-muted-foreground leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Asesoramiento Constructivo */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp(0.2)}
              className="bg-background/60 border border-border/40 p-8 hover:border-primary/30 transition-colors"
              data-testid="card-service-construction"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 border border-primary/30 text-primary">
                  <HardHat size={20} />
                </div>
                <h3 className="font-serif text-xl">
                  {es ? 'Asesoramiento Constructivo' : 'Construction Advisory'}
                </h3>
              </div>
              <ul className="space-y-3">
                {(es ? constructionServices.es : constructionServices.en).map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={15} className="text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-light text-muted-foreground leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Valores ───────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="grid grid-cols-3 gap-6 text-center">
            {values.map((v, i) => {
              const Icon = v.icon;
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
                    {es ? v.es : v.en}
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
              {es ? 'Hacemos posible tu sueño' : 'We make your dream possible'}
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-foreground mb-4">
              {es ? 'Tener Casa Propia' : 'Home Ownership'}
            </h2>
            <p className="text-muted-foreground font-light mb-10 text-lg">
              {es
                ? 'Permítenos acompañarte en el camino hacia tu nuevo hogar. Contactanos hoy mismo y recibí asesoría gratuita.'
                : 'Let us accompany you on the path to your new home. Contact us today and receive free advice.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/506${siteData.contact.phones[0].replace(/-/g,'')}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="button-cta-whatsapp"
                className="px-10 py-4 bg-primary text-primary-foreground text-xs tracking-widest uppercase font-light hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Phone size={14} /> WhatsApp: {siteData.contact.phones[0]}
              </a>
              <Link
                href="/financiamiento"
                data-testid="button-cta-financing"
                className="px-10 py-4 border border-border/50 text-muted-foreground text-xs tracking-widest uppercase font-light hover:border-primary hover:text-primary transition-colors"
              >
                {es ? 'Ver Financiamiento' : 'View Financing'}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
