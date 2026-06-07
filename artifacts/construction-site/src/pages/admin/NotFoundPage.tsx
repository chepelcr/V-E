import { useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  AdminCard,
  BilingualField,
  BilingualTextArea,
  TextField,
  SelectField,
} from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { useT } from "@/lib/admin-i18n";
import { ICON_NAMES } from "@/lib/icons";

/**
 * Not-Found (404) page editor (Pattern 1 — singleton draft). Edits the code,
 * glyph icon, bilingual title/message and the "back home" link label in
 * `notFound.json`. The public 404 keeps its glass-panel styling; only the SOURCE
 * of the copy + glyph moves here. Saves through the single `downloadJson` entry.
 */
export function NotFoundPage() {
  const { t } = useT();
  const notFound = useAdminStore((s) => s.notFound);
  const setNotFound = useAdminStore((s) => s.setNotFound);
  const [draft, setDraft] = useState(() => structuredClone(notFound));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  type Draft = typeof draft;
  const update = (fn: (d: Draft) => void) =>
    setDraft((p) => { const n = structuredClone(p); fn(n); return n; });

  const save = async () => {
    setSaving(true);
    setNotFound(draft);
    await downloadJson("notFound.json", draft);
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-testid="admin-not-found-page">
      <PageHeader
        title={t("admin.notFound")}
        description={t("admin.notFound_subtitle")}
        entity="notFound.json"
        value={draft}
        onSave={save}
        saving={saving}
        saved={saved}
      />

      <div className="space-y-6">
        <AdminCard title={t("admin.notFound_card")}>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField
              label={t("admin.notFound_code")}
              value={draft.code}
              onChange={(v) => update((d) => { d.code = v; })}
            />
            <SelectField
              label={t("admin.notFound_icon")}
              value={draft.iconName}
              onChange={(v) => update((d) => { d.iconName = v; })}
              options={ICON_NAMES.map((name) => ({ value: name, label: name }))}
            />
          </div>
          <BilingualField
            label={t("admin.notFound_title")}
            es={draft.title.es}
            en={draft.title.en}
            onChange={(l, v) => update((d) => { d.title[l] = v; })}
          />
          <BilingualTextArea
            label={t("admin.notFound_message")}
            es={draft.message.es}
            en={draft.message.en}
            onChange={(l, v) => update((d) => { d.message[l] = v; })}
          />
          <BilingualField
            label={t("admin.notFound_home")}
            es={draft.home.es}
            en={draft.home.en}
            onChange={(l, v) => update((d) => { d.home[l] = v; })}
          />
        </AdminCard>
      </div>
    </div>
  );
}
