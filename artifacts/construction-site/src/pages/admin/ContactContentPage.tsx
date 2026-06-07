import { useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCard, BilingualField, BilingualTextArea } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { useT } from "@/lib/admin-i18n";

/**
 * Contact PAGE copy editor (Pattern 1 — singleton draft). Edits the intro
 * title/subtitle in `contactContent.json` — the only editorial copy the public
 * contact page carries. The form labels, validation, toasts and option labels
 * are shared chrome (edited via the Translations page), and the phones/email
 * live in the shared `contact.json` (Contact Info page). Saves through the
 * single `downloadJson` entry.
 */
export function ContactContentPage() {
  const { t } = useT();
  const contactContent = useAdminStore((s) => s.contactContent);
  const setContactContent = useAdminStore((s) => s.setContactContent);
  const [draft, setDraft] = useState(() => structuredClone(contactContent));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  type Draft = typeof draft;
  const update = (fn: (d: Draft) => void) =>
    setDraft((p) => { const n = structuredClone(p); fn(n); return n; });

  const save = async () => {
    setSaving(true);
    setContactContent(draft);
    await downloadJson("contactContent.json", draft);
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-testid="admin-contact-content-page">
      <PageHeader
        title={t("admin.contactContent")}
        description={t("admin.contactContent_subtitle")}
        entity="contactContent.json"
        value={draft}
        onSave={save}
        saving={saving}
        saved={saved}
      />

      <div className="space-y-6">
        <AdminCard title={t("admin.contactContent_intro")}>
          <BilingualField
            label={t("admin.contactContent_title")}
            es={draft.intro.title.es}
            en={draft.intro.title.en}
            onChange={(l, v) => update((d) => { d.intro.title[l] = v; })}
          />
          <BilingualTextArea
            label={t("admin.contactContent_subtitle_field")}
            es={draft.intro.subtitle.es}
            en={draft.intro.subtitle.en}
            onChange={(l, v) => update((d) => { d.intro.subtitle[l] = v; })}
          />
        </AdminCard>
      </div>
    </div>
  );
}
