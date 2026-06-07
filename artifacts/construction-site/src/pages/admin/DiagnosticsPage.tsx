import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  GitCommit,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCard } from "@/components/admin/AdminUI";
import { useAdminStore } from "@/lib/admin-store";
import { useT } from "@/lib/admin-i18n";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { fetchGitLog, LOCAL_CMS_ENABLED, type GitCommit as Commit } from "@/lib/local-cms";

/**
 * Diagnostics (Pattern 7 — status/tooling). Read-only health overview: content
 * checks (each OK/Missing), system info, and a paginated list of recent commits
 * via `fetchGitLog` (degrades to "unavailable" off the dev server). No dirty/Save.
 */

interface Check {
  label: string;
  ok: boolean;
}

const PAGE_SIZE = 8;

export function DiagnosticsPage() {
  const { t } = useT();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const store = useAdminStore();

  const checks: Check[] = [
    { label: t("admin.diag_checkHome"), ok: !!store.home.hero?.subtitle },
    { label: t("admin.diag_checkCatalog"), ok: store.catalog.models.length > 0 },
    { label: t("admin.diag_checkLots"), ok: store.lots.items.length > 0 },
    { label: t("admin.diag_checkProviders"), ok: store.providers.items.length > 0 },
    { label: t("admin.diag_checkBranding"), ok: !!store.branding.companyName },
    { label: t("admin.diag_checkSeo"), ok: !!store.seo.siteUrl && !!store.seo.siteTitle?.es },
    { label: t("admin.diag_checkMedia"), ok: store.media.items.length > 0 },
    { label: t("admin.diag_checkContact"), ok: (store.contact.phones?.length ?? 0) > 0 },
  ];
  const failing = checks.filter((c) => !c.ok).length;

  const [commits, setCommits] = useState<Commit[]>([]);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [branch, setBranch] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [gitError, setGitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setGitError(null);
    void fetchGitLog(skip, PAGE_SIZE).then((r) => {
      if (cancelled) return;
      if (r.ok) {
        setCommits(r.commits ?? []);
        setTotal(r.total ?? 0);
        setBranch(r.branch ?? null);
      } else {
        setGitError(r.error ?? "unavailable");
        setCommits([]);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [skip]);

  const sysInfo: { label: string; value: string }[] = [
    { label: t("admin.diag_mode"), value: LOCAL_CMS_ENABLED ? t("admin.diag_modeDev") : t("admin.diag_modeProd") },
    { label: t("admin.diag_language"), value: language.toUpperCase() },
    { label: t("admin.diag_theme"), value: isDark ? t("admin.themeDark") : t("admin.themeLight") },
    { label: t("admin.diag_branch"), value: branch ?? "—" },
    { label: t("admin.diag_buildDate"), value: new Date().toLocaleDateString() },
  ];

  return (
    <div data-testid="admin-diagnostics-page">
      <PageHeader title={t("admin.diagnostics")} description={t("admin.diag_subtitle")} />

      {/* Health banner */}
      <div
        className={`mb-6 rounded-2xl border p-5 flex items-center gap-3 ${
          failing === 0
            ? "border-emerald-600/40 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
            : "border-destructive/40 bg-destructive/10 text-destructive"
        }`}
        data-testid="diag-health"
      >
        {failing === 0 ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
        <div>
          <p className="font-semibold">{failing === 0 ? t("admin.diag_healthy") : t("admin.diag_issues")}</p>
          <p className="text-sm opacity-80">
            {failing === 0
              ? t("admin.diag_allPass")
              : `${failing} / ${checks.length} ${t("admin.diag_failing")}`}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <AdminCard title={t("admin.diag_checks")}>
          <ul className="space-y-2">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-2 text-sm" data-testid="diag-check">
                {c.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive shrink-0" />
                )}
                <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard title={t("admin.diag_system")}>
          <dl className="space-y-2 text-sm">
            {sysInfo.map((s) => (
              <div key={s.label} className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">{s.label}</dt>
                <dd className="font-mono text-foreground">{s.value}</dd>
              </div>
            ))}
          </dl>
        </AdminCard>
      </div>

      <AdminCard title={t("admin.diag_commits")} className="mt-6">
        {gitError ? (
          <p className="text-sm text-muted-foreground py-4">{t("admin.diag_gitUnavailable")}</p>
        ) : loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-4 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("admin.common_loading", t("chrome.common.loading"))}
          </div>
        ) : commits.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">{t("admin.diag_noCommits")}</p>
        ) : (
          <>
            <ul className="divide-y divide-border">
              {commits.map((c) => (
                <li key={c.hash} className="flex items-start gap-3 py-3" data-testid={`diag-commit-${c.shortHash}`}>
                  <GitCommit className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground break-words">{c.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <code className="font-mono">{c.shortHash}</code> · {c.author} ·{" "}
                      {new Date(c.date).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                disabled={skip === 0}
                onClick={() => setSkip((s) => Math.max(0, s - PAGE_SIZE))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                {t("admin.diag_prev")}
              </button>
              <span className="text-xs text-muted-foreground">
                {skip + 1}–{Math.min(skip + commits.length, total)} / {total}
              </span>
              <button
                type="button"
                disabled={skip + PAGE_SIZE >= total}
                onClick={() => setSkip((s) => s + PAGE_SIZE)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
              >
                {t("admin.diag_next")}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </AdminCard>
    </div>
  );
}
