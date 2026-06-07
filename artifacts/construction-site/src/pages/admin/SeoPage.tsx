import { useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCard, BilingualField, BilingualTextArea, TextField } from "@/components/admin/AdminUI";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { useT } from "@/lib/admin-i18n";

/** SEO settings editor (Pattern 1 — singleton draft over `seo.json`). */
export function SeoPage() {
  const { t } = useT();
  const seo = useAdminStore((s) => s.seo);
  const setSeo = useAdminStore((s) => s.setSeo);
  const [draft, setDraft] = useState(() => structuredClone(seo));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  type Draft = typeof draft;
  const update = (fn: (d: Draft) => void) =>
    setDraft((p) => { const n = structuredClone(p); fn(n); return n; });

  const save = async () => {
    setSaving(true);
    setSeo(draft);
    await downloadJson("seo.json", draft);
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const routes = Object.keys(draft.pages) as Array<keyof Draft["pages"]>;

  return (
    <div data-testid="admin-seo-page">
      <PageHeader title={t("admin.seo")} entity="seo.json" value={draft} onSave={save} saving={saving} saved={saved} />

      <div className="space-y-6">
        <AdminCard title="Site">
          <TextField label="Site URL" type="url" value={draft.siteUrl} onChange={(v) => update((d) => { d.siteUrl = v; })} />
          <BilingualField label="Default title" es={draft.siteTitle.es} en={draft.siteTitle.en} onChange={(l, v) => update((d) => { d.siteTitle[l] = v; })} />
          <BilingualTextArea label="Default description" es={draft.siteDescription.es} en={draft.siteDescription.en} onChange={(l, v) => update((d) => { d.siteDescription[l] = v; })} />
          <MediaPicker label="OG image" value={draft.ogImageUrl} onChange={(v) => update((d) => { d.ogImageUrl = v; })} />
        </AdminCard>

        {routes.map((route) => (
          <AdminCard key={String(route)} title={String(route)}>
            <BilingualField
              label="Title"
              es={draft.pages[route].title.es}
              en={draft.pages[route].title.en}
              onChange={(l, v) => update((d) => { d.pages[route].title[l] = v; })}
            />
            <BilingualTextArea
              label="Description"
              es={draft.pages[route].description.es}
              en={draft.pages[route].description.en}
              onChange={(l, v) => update((d) => { d.pages[route].description[l] = v; })}
            />
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
