import { Construction } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useT } from "@/lib/admin-i18n";

/**
 * Placeholder for admin pages scheduled in a later phase (Diagnostics, Content
 * Explorer, Inventory graph, Translations key-table, …). Keeps the route + page
 * shape in place so the sidebar/router never dangle; the real editor lands in
 * its phase.
 */
export function StubPage({ titleKey }: { titleKey: string }) {
  const { t } = useT();
  return (
    <div data-testid="admin-stub-page">
      <PageHeader title={t(titleKey)} description={t("admin.comingSoon")} />
      <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Construction className="w-10 h-10 opacity-40" />
        <p className="text-sm">{t("admin.comingSoon")}</p>
      </div>
    </div>
  );
}
