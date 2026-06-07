import { useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCard, BilingualField, BilingualTextArea, SelectField, TextField } from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { useT } from "@/lib/admin-i18n";
import { ICON_NAMES } from "@/lib/icons";

/**
 * Home page content editor (Pattern 1 — singleton draft). Edits the full
 * `home.json` draft and saves it through the single `downloadJson` entry. All
 * copy fields are edited bilingually (ES | EN) side by side.
 */
export function HomePage() {
  const { t } = useT();
  const home = useAdminStore((s) => s.home);
  const setHome = useAdminStore((s) => s.setHome);
  const [draft, setDraft] = useState(() => structuredClone(home));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  type Draft = typeof draft;
  const update = (fn: (d: Draft) => void) => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setHome(draft);
    await downloadJson("home.json", draft);
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const iconOptions = ICON_NAMES.map((n) => ({ value: n, label: n }));

  return (
    <div data-testid="admin-home-page">
      <PageHeader
        title={t("admin.home")}
        entity="home.json"
        value={draft}
        onSave={save}
        saving={saving}
        saved={saved}
      />

      <div className="space-y-6">
        {/* Hero */}
        <AdminCard title="Hero">
          <BilingualTextArea
            label="Subtitle"
            es={draft.hero.subtitle.es}
            en={draft.hero.subtitle.en}
            onChange={(l, v) => update((d) => { d.hero.subtitle[l] = v; })}
          />
          <div className="grid sm:grid-cols-3 gap-3">
            <SelectField
              label="Primary CTA icon"
              value={draft.hero.primaryCtaIconName}
              onChange={(v) => update((d) => { d.hero.primaryCtaIconName = v; })}
              options={iconOptions}
            />
            <TextField
              label="Primary CTA href"
              type="url"
              value={draft.hero.primaryCtaHref}
              onChange={(v) => update((d) => { d.hero.primaryCtaHref = v; })}
            />
            <TextField
              label="Secondary CTA href"
              type="url"
              value={draft.hero.secondaryCtaHref}
              onChange={(v) => update((d) => { d.hero.secondaryCtaHref = v; })}
            />
          </div>
        </AdminCard>

        {/* About */}
        <AdminCard title="About">
          <BilingualField
            label="Eyebrow"
            es={draft.about.eyebrow.es}
            en={draft.about.eyebrow.en}
            onChange={(l, v) => update((d) => { d.about.eyebrow[l] = v; })}
          />
          <BilingualField
            label="Heading"
            es={draft.about.heading.es}
            en={draft.about.heading.en}
            onChange={(l, v) => update((d) => { d.about.heading[l] = v; })}
          />
          <BilingualTextArea
            label="Body"
            es={draft.about.body.es}
            en={draft.about.body.en}
            onChange={(l, v) => update((d) => { d.about.body[l] = v; })}
          />
          <BilingualTextArea
            label={t("chrome.corporate.mission")}
            es={draft.about.mission.es}
            en={draft.about.mission.en}
            onChange={(l, v) => update((d) => { d.about.mission[l] = v; })}
          />
          <BilingualTextArea
            label={t("chrome.corporate.vision")}
            es={draft.about.vision.es}
            en={draft.about.vision.en}
            onChange={(l, v) => update((d) => { d.about.vision[l] = v; })}
          />
        </AdminCard>

        {/* Services */}
        <AdminCard title="Services">
          <BilingualField
            label="Eyebrow"
            es={draft.services.eyebrow.es}
            en={draft.services.eyebrow.en}
            onChange={(l, v) => update((d) => { d.services.eyebrow[l] = v; })}
          />
          <BilingualField
            label="Heading"
            es={draft.services.heading.es}
            en={draft.services.heading.en}
            onChange={(l, v) => update((d) => { d.services.heading[l] = v; })}
          />
          {(["financial", "construction"] as const).map((key) => (
            <div key={key} className="rounded-xl border border-border p-4 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <SelectField
                  label={`${key} icon`}
                  value={draft.services[key].iconName}
                  onChange={(v) => update((d) => { d.services[key].iconName = v; })}
                  options={iconOptions}
                />
                <BilingualField
                  label={`${key} title`}
                  es={draft.services[key].title.es}
                  en={draft.services[key].title.en}
                  onChange={(l, v) => update((d) => { d.services[key].title[l] = v; })}
                />
              </div>
              {draft.services[key].items.map((item, i) => (
                <BilingualField
                  key={i}
                  label={`Item ${i + 1}`}
                  es={item.es}
                  en={item.en}
                  onChange={(l, v) => update((d) => { d.services[key].items[i][l] = v; })}
                />
              ))}
            </div>
          ))}
        </AdminCard>

        {/* Values */}
        <AdminCard title="Values">
          {draft.values.map((val, i) => (
            <div key={i} className="grid sm:grid-cols-3 gap-3 items-start">
              <SelectField
                label={`Value ${i + 1} icon`}
                value={val.iconName}
                onChange={(v) => update((d) => { d.values[i].iconName = v; })}
                options={iconOptions}
              />
              <BilingualField
                className="sm:col-span-2"
                label="Label"
                es={val.label.es}
                en={val.label.en}
                onChange={(l, v) => update((d) => { d.values[i].label[l] = v; })}
              />
            </div>
          ))}
        </AdminCard>

        {/* CTA */}
        <AdminCard title="CTA">
          <BilingualField
            label="Eyebrow"
            es={draft.cta.eyebrow.es}
            en={draft.cta.eyebrow.en}
            onChange={(l, v) => update((d) => { d.cta.eyebrow[l] = v; })}
          />
          <BilingualField
            label="Heading"
            es={draft.cta.heading.es}
            en={draft.cta.heading.en}
            onChange={(l, v) => update((d) => { d.cta.heading[l] = v; })}
          />
          <BilingualTextArea
            label="Body"
            es={draft.cta.body.es}
            en={draft.cta.body.en}
            onChange={(l, v) => update((d) => { d.cta.body[l] = v; })}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <SelectField
              label="WhatsApp icon"
              value={draft.cta.whatsappIconName}
              onChange={(v) => update((d) => { d.cta.whatsappIconName = v; })}
              options={iconOptions}
            />
            <TextField
              label="Financing CTA href"
              type="url"
              value={draft.cta.financingCtaHref}
              onChange={(v) => update((d) => { d.cta.financingCtaHref = v; })}
            />
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
