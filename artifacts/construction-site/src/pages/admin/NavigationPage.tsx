import { useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCard, TextField } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { useT } from "@/lib/admin-i18n";

/**
 * Navigation editor (Pattern 1). Edits the ordered path list + chrome label
 * keys + dropdown grouping in `navigation.json`. Labels themselves resolve
 * through the chrome translations (`chrome.nav.*`), so this page edits structure.
 */
export function NavigationPage() {
  const { t } = useT();
  const navigation = useAdminStore((s) => s.navigation);
  const setNavigation = useAdminStore((s) => s.setNavigation);
  const [draft, setDraft] = useState(() => structuredClone(navigation));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  type Draft = typeof draft;
  const update = (fn: (d: Draft) => void) =>
    setDraft((p) => { const n = structuredClone(p); fn(n); return n; });

  const save = async () => {
    setSaving(true);
    setNavigation(draft);
    await downloadJson("navigation.json", draft);
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-testid="admin-navigation-page">
      <PageHeader title={t("admin.navigation")} entity="navigation.json" value={draft} onSave={save} saving={saving} saved={saved} />

      <div className="space-y-4">
        {draft.items.map((item, i) => (
          <AdminCard key={i} title={item.path}>
            <div className="grid sm:grid-cols-3 gap-3">
              <TextField label="Path" value={item.path} onChange={(v) => update((d) => { d.items[i].path = v; })} />
              <TextField label="Label key" value={item.labelKey} onChange={(v) => update((d) => { d.items[i].labelKey = v; })} hint="chrome.nav.*" />
              <TextField label="Order" value={String(item.order)} onChange={(v) => update((d) => { d.items[i].order = Number(v) || 0; })} />
            </div>
            <TextField label="Group" value={(item as { group?: string }).group ?? ""} onChange={(v) => update((d) => { (d.items[i] as { group?: string }).group = v || undefined; })} hint="dropdown grouping (optional)" />
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
