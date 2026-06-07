import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCard, BilingualField, BilingualTextArea, TextField } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { useT } from "@/lib/admin-i18n";

/**
 * Company / Contact Info editor (Pattern 1). Edits `contact.json`: phones,
 * email, country code, social handles, and the contact-page intro copy. This is
 * the shared source consumed by Footer / Home / Financiamiento (kills the
 * hardcoded phone/email drift).
 */
export function ContactInfoPage() {
  const { t } = useT();
  const contact = useAdminStore((s) => s.contact);
  const setContact = useAdminStore((s) => s.setContact);
  const [draft, setDraft] = useState(() => structuredClone(contact));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  type Draft = typeof draft;
  const update = (fn: (d: Draft) => void) =>
    setDraft((p) => { const n = structuredClone(p); fn(n); return n; });

  const save = async () => {
    setSaving(true);
    setContact(draft);
    await downloadJson("contact.json", draft);
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-testid="admin-contact-info-page">
      <PageHeader title={t("admin.contact-info", "Contact Info")} entity="contact.json" value={draft} onSave={save} saving={saving} saved={saved} />

      <div className="space-y-6">
        <AdminCard title={t("chrome.footer.contactHeading")}>
          {draft.phones.map((phone, i) => (
            <div key={i} className="flex items-end gap-2">
              <TextField className="flex-1" label={`${t("chrome.form.phone")} ${i + 1}`} value={phone} onChange={(v) => update((d) => { d.phones[i] = v; })} />
              <button
                type="button"
                onClick={() => update((d) => { d.phones.splice(i, 1); })}
                className="h-10 px-3 rounded-lg border border-border text-muted-foreground hover:text-destructive transition-colors"
                aria-label={t("admin.discard")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => update((d) => { d.phones.push(""); })}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Plus className="w-4 h-4" />
            {t("chrome.form.phone")}
          </button>
          <TextField label={t("chrome.form.email")} type="email" value={draft.email} onChange={(v) => update((d) => { d.email = v; })} />
          <TextField label="Country code" value={draft.countryCode} onChange={(v) => update((d) => { d.countryCode = v; })} />
        </AdminCard>

        <AdminCard title={t("chrome.footer.socialHeading")}>
          <TextField label={t("chrome.social.facebook")} value={draft.social.facebook} onChange={(v) => update((d) => { d.social.facebook = v; })} />
          <TextField label={t("chrome.social.instagram")} value={draft.social.instagram} onChange={(v) => update((d) => { d.social.instagram = v; })} />
        </AdminCard>

        <AdminCard title={t("chrome.nav.contact")}>
          <BilingualField label="Intro title" es={draft.intro.title.es} en={draft.intro.title.en} onChange={(l, v) => update((d) => { d.intro.title[l] = v; })} />
          <BilingualTextArea label="Intro subtitle" es={draft.intro.subtitle.es} en={draft.intro.subtitle.en} onChange={(l, v) => update((d) => { d.intro.subtitle[l] = v; })} />
        </AdminCard>
      </div>
    </div>
  );
}
