import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Menu, Sun, Moon, ExternalLink, UploadCloud, Loader2, Check, AlertCircle, Info } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { publishChanges } from "@/lib/local-cms";
import { useAdminUi, guardNavigation } from "@/lib/admin-ui";
import { useT } from "@/lib/admin-i18n";
import { getBranding } from "@/repositories/branding.repository";
import { Hint } from "./Hint";

interface Props {
  /** Opens the mobile sidebar drawer (only shown below lg). */
  onMenu: () => void;
}

type PublishState =
  | { kind: "idle" }
  | { kind: "publishing" }
  | { kind: "success"; hash: string }
  | { kind: "nothing" }
  | { kind: "error"; error: string };

const FlagCR = () => (
  <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
    <rect width="22" height="16" fill="#002B7F" rx="2" />
    <rect y="3.56" width="22" height="8.88" fill="#FFFFFF" />
    <rect y="5.34" width="22" height="5.32" fill="#CE1126" />
  </svg>
);

const FlagUS = () => (
  <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
    <rect width="22" height="16" fill="#B22234" rx="2" />
    <rect y="1.23" width="22" height="1.23" fill="#FFFFFF" />
    <rect y="3.69" width="22" height="1.23" fill="#FFFFFF" />
    <rect y="6.15" width="22" height="1.23" fill="#FFFFFF" />
    <rect y="8.61" width="22" height="1.23" fill="#FFFFFF" />
    <rect y="11.08" width="22" height="1.23" fill="#FFFFFF" />
    <rect y="13.54" width="22" height="1.23" fill="#FFFFFF" />
    <rect width="9" height="8.61" fill="#3C3B6E" rx="2" />
  </svg>
);

/**
 * Admin top navbar: mobile drawer toggle, brand label, theme toggle (shared
 * ThemeContext, layered Sun/Moon), in-place flag language toggle, a guarded
 * view-site link, and the one-click Publish button (5-state machine that
 * commits the content JSON and pushes the current branch via the dev-only
 * local-cms endpoint). Dev-only chrome — tree-shaken out of production.
 */
export function AdminTopbar({ onMenu }: Props) {
  const { t, language } = useT();
  const { theme, toggleTheme } = useTheme();
  const { setLanguage } = useLanguage();
  const [, navigate] = useLocation();
  const branding = getBranding();
  const dark = theme === "dark";

  const [state, setState] = useState<PublishState>({ kind: "idle" });
  const pendingPublish = useAdminUi((s) => s.pendingPublish);
  const refreshPublish = useAdminUi((s) => s.refreshPublish);

  // Detect pending (unpublished) changes on mount, when a content page saves
  // (dispatched by downloadJson), and when the window regains focus.
  useEffect(() => {
    void refreshPublish();
    const onChange = () => void refreshPublish();
    window.addEventListener("focus", onChange);
    window.addEventListener("ve:content-saved", onChange);
    return () => {
      window.removeEventListener("focus", onChange);
      window.removeEventListener("ve:content-saved", onChange);
    };
  }, [refreshPublish]);

  const publish = async () => {
    if (state.kind === "publishing" || !pendingPublish) return;
    setState({ kind: "publishing" });
    const res = await publishChanges();
    if (res.ok && res.nothingToPublish) {
      setState({ kind: "nothing" });
    } else if (res.ok) {
      setState({ kind: "success", hash: res.hash ?? "" });
    } else {
      setState({ kind: "error", error: res.error ?? "error" });
    }
    void refreshPublish();
    window.setTimeout(() => setState({ kind: "idle" }), res.ok ? 4000 : 8000);
  };

  const disabled = state.kind === "publishing" || (state.kind === "idle" && !pendingPublish);

  const publishStyles: Record<PublishState["kind"], string> = {
    idle: pendingPublish
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "bg-muted text-muted-foreground cursor-not-allowed",
    publishing: "bg-primary/80 text-primary-foreground cursor-wait",
    success: "bg-emerald-600 text-white",
    nothing: "bg-muted text-muted-foreground",
    error: "bg-destructive text-destructive-foreground",
  };

  const publishContent = () => {
    switch (state.kind) {
      case "publishing":
        return (<><Loader2 className="w-4 h-4 animate-spin" />{t("admin.publishing")}</>);
      case "success":
        return (<><Check className="w-4 h-4" />{t("admin.published")}{state.hash && ` · ${state.hash}`}</>);
      case "nothing":
        return (<><Info className="w-4 h-4" />{t("admin.nothingToPublish")}</>);
      case "error":
        return (<><AlertCircle className="w-4 h-4" />{t("admin.publishError")}</>);
      default:
        return (<><UploadCloud className="w-4 h-4" />{t("admin.publish")}</>);
    }
  };

  const viewSite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (guardNavigation("/")) return;
    navigate("/");
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 h-14 px-4 bg-card border-b border-border"
      data-testid="admin-topbar"
    >
      {/* Mobile drawer toggle */}
      <button
        onClick={onMenu}
        className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
        data-testid="mobile-menu-btn"
        aria-label={t("chrome.a11y.openMenu")}
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2">
        <span className="font-serif text-base font-semibold tracking-widest text-foreground">
          {branding.wordmark}
        </span>
        <span className="text-foreground font-semibold text-sm">Admin</span>
      </div>

      <div className="flex-1" />

      {/* Theme toggle (layered Sun/Moon driven by the .dark class) */}
      <Hint label={dark ? t("admin.themeLight") : t("admin.themeDark")} side="bottom">
        <button
          onClick={toggleTheme}
          className="relative flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300"
          data-testid="admin-theme-toggle"
          aria-label={t("chrome.a11y.toggleTheme")}
        >
          <Sun className="absolute w-4 h-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
        </button>
      </Hint>

      {/* Language toggle (admin-safe: switches in place, no navigation) */}
      <Hint label={t("chrome.a11y.toggleLanguage")} side="bottom">
        <button
          onClick={() => setLanguage(language === "es" ? "en" : "es")}
          className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          data-testid="admin-lang-toggle"
          aria-label={t("chrome.a11y.toggleLanguage")}
        >
          {language === "es" ? <FlagCR /> : <FlagUS />}
          <span className="text-xs font-semibold uppercase hidden sm:inline">
            {t("chrome.lang." + language)}
          </span>
        </button>
      </Hint>

      {/* View public site (guarded) */}
      <button
        onClick={viewSite}
        className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-sm font-medium transition-colors"
        data-testid="admin-view-site"
        title={t("admin.viewSite")}
      >
        <ExternalLink className="w-4 h-4" />
        <span className="hidden md:inline">{t("admin.viewSite")}</span>
      </button>

      {/* Publish — enabled only when there are saved-but-unpublished changes */}
      <button
        onClick={publish}
        disabled={disabled}
        className={`flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-90 ${publishStyles[state.kind]}`}
        data-testid="admin-publish"
        title={
          state.kind === "error"
            ? state.error
            : state.kind === "idle" && !pendingPublish
            ? t("admin.nothingToPublish")
            : t("admin.publish")
        }
      >
        {publishContent()}
      </button>
    </header>
  );
}
