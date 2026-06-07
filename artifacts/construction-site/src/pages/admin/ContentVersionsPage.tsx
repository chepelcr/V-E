import { Download } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { useT } from "@/lib/admin-i18n";
import { versionedEntries } from "@/lib/admin-manifest";

/**
 * The ④ "content-versions download" piece for every content entity. Rows are
 * generated from the completeness manifest (`versionedEntries`), so adding a new
 * content file's manifest row gives it a download row here for free. Each row's
 * `downloadJson` writes the file back via local-cms (or browser-downloads it).
 */
export function ContentVersionsPage() {
  const { t, language } = useT();
  const store = useAdminStore();

  // Map a manifest content file to the live store slice that backs it.
  const sliceFor: Record<string, unknown> = {
    "home.json": store.home,
    "branding.json": store.branding,
    "contact.json": store.contact,
    "media.json": store.media,
    "seo.json": store.seo,
    "navigation.json": store.navigation,
    "inventory.json": store.inventory,
  };

  // themes.json lives alongside branding under Site Identity.
  const files = versionedEntries()
    .filter((e) => e.file && e.file in sliceFor)
    .map((e) => ({
      name: e.file!,
      data: sliceFor[e.file!],
      description: e.versions ? e.versions[language] : "",
    }));
  // Site Identity edits a second file (themes.json) on the same page.
  files.push({ name: "themes.json", data: store.themes, description: language === "es" ? "Temas de marca" : "Brand themes" });

  const exportAll = () => {
    files.forEach(({ name, data }, i) => {
      setTimeout(() => downloadJson(name, data), i * 100);
    });
  };

  return (
    <div data-testid="content-versions-page">
      <PageHeader
        title={t("admin.contentVersions")}
        description={t("admin.contentVersionsSubtitle")}
        action={
          <button
            onClick={exportAll}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            data-testid="btn-export-all"
          >
            <Download className="w-4 h-4" />
            {t("admin.exportAll")}
          </button>
        }
      />

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="text-left px-6 py-3 font-semibold text-muted-foreground">{t("admin.file")}</th>
              <th className="text-left px-6 py-3 font-semibold text-muted-foreground hidden md:table-cell">{t("admin.description")}</th>
              <th className="text-right px-6 py-3 font-semibold text-muted-foreground">{t("admin.download")}</th>
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <tr key={f.name} className="border-b border-border last:border-0 hover:bg-muted" data-testid={`content-file-${f.name}`}>
                <td className="px-6 py-4">
                  <code className="text-primary font-mono text-xs bg-primary/10 px-2 py-1 rounded">{f.name}</code>
                </td>
                <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">{f.description}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => downloadJson(f.name, f.data)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-input text-xs font-medium transition-colors ml-auto"
                    data-testid={`download-${f.name}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t("admin.download")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
