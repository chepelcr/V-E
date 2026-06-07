import { Link } from "wouter";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useT } from "@/lib/admin-i18n";

/**
 * Public 404. Rendered inside the marketing Layout, so the marble background
 * shows through — the card uses the shared glass-panel surface and theme
 * tokens (no opaque white background). Text comes from chrome.notFound.*.
 */
export default function NotFound() {
  const { t } = useT();
  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center px-6">
      <div className="glass-panel border border-border/40 max-w-md w-full p-10 text-center backdrop-blur-sm">
        <AlertCircle className="h-10 w-10 text-primary mx-auto mb-5" />
        <h1 className="font-serif text-5xl text-foreground mb-2">404</h1>
        <p className="text-primary/80 text-sm tracking-widest uppercase mb-4">
          {t("chrome.notFound.title")}
        </p>
        <p className="text-muted-foreground font-light mb-8">
          {t("chrome.notFound.message")}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-xs tracking-widest uppercase font-light hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft size={14} /> {t("chrome.notFound.home")}
        </Link>
      </div>
    </div>
  );
}
