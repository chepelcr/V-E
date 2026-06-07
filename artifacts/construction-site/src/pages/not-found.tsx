import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { resolveLocalized } from "@/lib/resolveLocalized";
import { resolveIcon } from "@/lib/icons";
import { useHeadTags } from "@/lib/seo";
import { getNotFound } from "@/repositories/notfound.repository";

/**
 * Public 404. Rendered inside the marketing Layout, so the marble background
 * shows through — the card uses the shared glass-panel surface and theme
 * tokens (no opaque white background). All copy + the glyph come from
 * `notFound.json` via the repository + tolerant `resolveLocalized` + the icon
 * registry. No hardcoded user-visible text.
 */
export default function NotFound() {
  const { language } = useLanguage();
  useHeadTags("/404", language, { index: false });
  const content = getNotFound();
  const Icon = resolveIcon(content.iconName);
  const rl = (v: unknown) => resolveLocalized(v as never, language);

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center px-6">
      <div className="glass-panel border border-border/40 max-w-md w-full p-10 text-center backdrop-blur-sm">
        <Icon className="h-10 w-10 text-primary mx-auto mb-5" />
        <h1 className="font-serif text-5xl text-foreground mb-2">{content.code}</h1>
        <p className="text-primary/80 text-sm tracking-widest uppercase mb-4">
          {rl(content.title)}
        </p>
        <p className="text-muted-foreground font-light mb-8">
          {rl(content.message)}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-xs tracking-widest uppercase font-light hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft size={14} /> {rl(content.home)}
        </Link>
      </div>
    </div>
  );
}
