import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  CreditCard, Home, Gift, Wrench, Layers,
  Building2, Store, BriefcaseBusiness, LayoutGrid,
  Trees, Dock, Shield, CheckCircle2, Phone, Mail
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' as const },
  }),
};

const financingOptions = [
  {
    icon: CreditCard,
    titleEs: 'Crédito',
    titleEn: 'Credit',
    descEs: 'Te asesoramos para que encuentres el crédito que mejor se adapte a tus posibilidades, ya sea personal o hipotecario.',
    descEn: 'We advise you to find the credit that best fits your situation, whether personal or mortgage.',
  },
  {
    icon: Home,
    titleEs: 'Recursos Propios',
    titleEn: 'Own Resources',
    descEs: 'Si ya contás con el capital, nosotros lo hacemos rendir al máximo con planificación eficiente y materiales de calidad.',
    descEn: 'If you already have the capital, we make it go further with efficient planning and quality materials.',
  },
  {
    icon: Gift,
    titleEs: 'Bono Ordinario',
    titleEn: 'Housing Bond',
    descEs: '¿Sos beneficiario del bono de vivienda? Te acompañamos en todo el proceso de tramitación para que puedas construir tu hogar propio.',
    descEn: 'Are you eligible for a housing bond? We guide you through the entire application process so you can build your own home.',
  },
  {
    icon: Wrench,
    titleEs: 'Bono de Remodelación',
    titleEn: 'Renovation Bond',
    descEs: '¿Tu casa necesita mejoras? Existen bonos específicos para remodelaciones y nosotros te ayudamos a gestionarlos.',
    descEn: 'Does your home need improvements? There are specific bonds for renovations and we help you manage them.',
  },
  {
    icon: Layers,
    titleEs: 'Credi Bono',
    titleEn: 'Credi Bond',
    descEs: 'Una opción que combina crédito y bono para que puedas acceder a un monto mayor y hacer realidad el proyecto que siempre soñaste.',
    descEn: 'A hybrid option combining credit and bond so you can access a higher amount and bring your dream project to life.',
  },
];

const projectTypes = [
  { icon: Home,            labelEs: 'Viviendas Personalizadas',   labelEn: 'Custom Homes' },
  { icon: Store,           labelEs: 'Locales Comerciales',         labelEn: 'Commercial Spaces' },
  { icon: BriefcaseBusiness, labelEs: 'Oficinas',                 labelEn: 'Offices' },
  { icon: Building2,       labelEs: 'Apartamentos',                labelEn: 'Apartments' },
  { icon: Trees,           labelEs: 'Áreas Abiertas',              labelEn: 'Open Areas' },
  { icon: Dock,            labelEs: 'Decks',                       labelEn: 'Decks' },
  { icon: LayoutGrid,      labelEs: 'Verjas',                      labelEn: 'Iron Gates' },
  { icon: Shield,          labelEs: 'Trabajos en Policarbonato',   labelEn: 'Polycarbonate Works' },
];

const serviceItems = [
  { es: 'Diseño, planos y tramitología', en: 'Design, blueprints and permits' },
  { es: 'Entrega Llave en Mano 100% personalizado', en: '100% personalised Turnkey delivery' },
  { es: 'Ingeniero Civil certificado', en: 'Certified Civil Engineer' },
  { es: 'Electricista Certificada', en: 'Certified Electrician' },
  { es: 'Asesoría Legal y Contable', en: 'Legal and Accounting Advisory' },
  { es: 'Asesoría gratuita sin compromiso', en: 'Free no-obligation consultation' },
];

export default function Financiamiento() {
  const { language } = useLanguage();
  const es = language === 'es';

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
          {es ? 'Formas de Financiamiento' : 'Financing Options'}
        </h1>
        <p className="text-muted-foreground font-light max-w-2xl text-lg">
          {es
            ? '¿Tenés un proyecto en mente pero no sabés cómo financiarlo? En V&E Asesores en Construcción te abrimos las puertas sin importar tu situación financiera.'
            : 'Have a project in mind but unsure how to finance it? At V&E Asesores en Construcción, we open doors for you regardless of your financial situation.'}
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
          {es ? 'Trabajamos con 5 formas de financiamiento' : 'We work with 5 financing methods'}
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financingOptions.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                data-testid={`card-financing-${i}`}
                className="bg-card/60 border border-border/40 p-6 backdrop-blur-sm flex flex-col gap-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 border border-primary/30 text-primary">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-serif text-xl text-foreground">
                    {es ? opt.titleEs : opt.titleEn}
                  </h3>
                </div>
                <p className="text-muted-foreground font-light text-sm leading-relaxed">
                  {es ? opt.descEs : opt.descEn}
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
          {es ? 'Construimos todo tipo de proyectos' : 'We build all types of projects'}
        </span>
        <div className="flex-1 h-px bg-border/40" />
      </div>

      {/* Project Types */}
      <section className="mb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {projectTypes.map((pt, i) => {
            const Icon = pt.icon;
            return (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                data-testid={`card-project-${i}`}
                className="bg-card/50 border border-border/30 p-5 flex flex-col items-center gap-3 text-center hover:border-primary/40 transition-colors"
              >
                <Icon size={28} className="text-primary" />
                <span className="text-sm font-light tracking-wide">
                  {es ? pt.labelEs : pt.labelEn}
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
          className="bg-card/60 border border-border/40 p-8"
        >
          <h3 className="font-serif text-2xl text-primary mb-6">
            {es ? 'Servicio Llave en Mano' : 'Turnkey Service'}
          </h3>
          <p className="text-muted-foreground font-light text-sm mb-6">
            {es
              ? 'Desde el diseño, los planos y la tramitología, hasta la entrega final. Contamos con el equipo completo para que tu proyecto esté en las mejores manos.'
              : 'From design, blueprints and permits to final handover. We have the full team so your project is in the best hands.'}
          </p>
          <ul className="space-y-3">
            {serviceItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                <span className="text-sm font-light text-muted-foreground">
                  {es ? item.es : item.en}
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
              {es ? 'Hacemos posible tu sueño de tener casa propia' : 'We make your dream of home ownership possible'}
            </h3>
            <p className="text-muted-foreground font-light text-sm mb-8">
              {es
                ? 'Permítenos acompañarte en el camino hacia tu nuevo hogar. Contactanos hoy mismo y recibí asesoría gratuita sin compromiso.'
                : 'Let us accompany you on the path to your new home. Contact us today and receive a free, no-obligation consultation.'}
            </p>
          </div>

          <div className="space-y-4">
            <a
              href="tel:+50685372016"
              data-testid="link-phone-primary"
              className="flex items-center gap-3 group"
            >
              <div className="p-2.5 border border-primary/40 text-primary group-hover:bg-primary/10 transition-colors">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-light">WhatsApp</p>
                <p className="text-foreground font-light tracking-wider">8537-2016</p>
              </div>
            </a>
            <a
              href="tel:+50686692683"
              data-testid="link-phone-secondary"
              className="flex items-center gap-3 group"
            >
              <div className="p-2.5 border border-border/40 text-muted-foreground group-hover:border-primary/40 group-hover:text-primary transition-colors">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-light">{es ? 'Teléfono' : 'Phone'}</p>
                <p className="text-foreground font-light tracking-wider">8669-2683</p>
              </div>
            </a>
            <a
              href="mailto:empresa@constructoravye.com"
              data-testid="link-email"
              className="flex items-center gap-3 group"
            >
              <div className="p-2.5 border border-border/40 text-muted-foreground group-hover:border-primary/40 group-hover:text-primary transition-colors">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-light">{es ? 'Correo' : 'Email'}</p>
                <p className="text-foreground font-light tracking-wider text-sm">empresa@constructoravye.com</p>
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
          {es
            ? 'Tu aliado estratégico en cada etapa del proceso para obtener tu casa de bono.'
            : 'Your strategic partner at every step of the process to get your housing bond home.'}
        </p>
      </motion.div>
    </div>
  );
}
