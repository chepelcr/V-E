import React from 'react';
import { Link } from 'wouter';
import { useSiteData } from '@/contexts/SiteDataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, Mail } from 'lucide-react';
import { ADMIN_ENABLED } from '@/lib/admin-enabled';

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-label="Facebook">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Instagram">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-label="WhatsApp">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

export const Footer = () => {
  const { siteData } = useSiteData();
  const { language } = useLanguage();
  const es = language === 'es';

  return (
    <footer className="border-t border-border/30 mt-16">
      <div className="container mx-auto px-6 py-14 grid md:grid-cols-3 gap-12">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.jpg" alt="V&E Logo" className="h-12 w-12 object-cover" />
            <div>
              <p className="font-serif text-lg text-foreground tracking-widest uppercase font-semibold">
                V<span className="text-primary">&</span>E
              </p>
              <p className="text-[10px] tracking-[0.2em] text-primary uppercase font-light">
                Asesores en Construcción
              </p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-xs">
            {es
              ? 'Tu aliado estratégico para obtener tu casa de bono de manera segura, clara y eficiente.'
              : 'Your strategic partner to get your housing bond home safely, clearly and efficiently.'}
          </p>
        </div>

        {/* Contact */}
        <div>
          <p className="text-xs tracking-widest uppercase text-primary mb-5 font-light">
            {es ? 'Contacto' : 'Contact'}
          </p>
          <div className="space-y-4">
            {siteData.contact.phones.map((phone, i) => (
              <a
                key={i}
                href={`https://wa.me/506${phone.replace(/-/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors font-light text-sm"
                data-testid={`link-footer-phone-${i}`}
              >
                {i === 0 ? <WhatsAppIcon /> : <Phone size={15} />}
                <span>{phone}</span>
              </a>
            ))}
            <a
              href={`mailto:${siteData.contact.email}`}
              className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors font-light text-sm"
              data-testid="link-footer-email"
            >
              <Mail size={15} />
              <span>{siteData.contact.email}</span>
            </a>
          </div>
        </div>

        {/* Social & Links */}
        <div>
          <p className="text-xs tracking-widest uppercase text-primary mb-5 font-light">
            {es ? 'Redes Sociales' : 'Social Media'}
          </p>
          <div className="space-y-3 mb-8">
            <a
              href={`https://facebook.com/${encodeURIComponent(siteData.contact.social.facebook)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors font-light text-sm"
              data-testid="link-footer-facebook"
            >
              <FacebookIcon />
              <span>{siteData.contact.social.facebook}</span>
            </a>
            <a
              href={`https://instagram.com/${encodeURIComponent(siteData.contact.social.instagram)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors font-light text-sm"
              data-testid="link-footer-instagram"
            >
              <InstagramIcon />
              <span>{siteData.contact.social.instagram}</span>
            </a>
          </div>
          {ADMIN_ENABLED && (
            <Link
              href="/admin/dashboard"
              className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors tracking-widest uppercase"
              data-testid="link-admin"
            >
              {es ? 'Panel Admin' : 'Admin Panel'}
            </Link>
          )}
        </div>
      </div>

      <div className="border-t border-border/20 py-5 text-center">
        <p className="text-xs text-muted-foreground/40 font-light tracking-wider">
          &copy; {new Date().getFullYear()} V&amp;E Asesores en Construcción.{' '}
          {es ? 'Todos los derechos reservados.' : 'All rights reserved.'}
        </p>
      </div>
    </footer>
  );
};
