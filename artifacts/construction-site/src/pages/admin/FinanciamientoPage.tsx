import { useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  AdminCard,
  BilingualField,
  BilingualTextArea,
  BilingualSection,
  SelectField,
} from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { useT } from "@/lib/admin-i18n";
import { ICON_NAMES } from "@/lib/icons";

/**
 * Financiamiento page content editor (Pattern 1 — singleton draft). Edits the
 * full `financiamiento.json` draft and saves it through the single
 * `downloadJson` entry. The repeating sections (financing options, project
 * types, turnkey checklist) are fixed-length arrays edited in place via
 * BilingualSection cards. The phones/email shown on the public page are NOT
 * edited here — they come from the shared Contact Info entity.
 */
export function FinanciamientoPage() {
  const { t } = useT();
  const financiamiento = useAdminStore((s) => s.financiamiento);
  const setFinanciamiento = useAdminStore((s) => s.setFinanciamiento);
  const [draft, setDraft] = useState(() => structuredClone(financiamiento));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  type Draft = typeof draft;
  const update = (fn: (d: Draft) => void) =>
    setDraft((p) => { const n = structuredClone(p); fn(n); return n; });

  const save = async () => {
    setSaving(true);
    setFinanciamiento(draft);
    await downloadJson("financiamiento.json", draft);
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const iconOptions = ICON_NAMES.map((n) => ({ value: n, label: n }));

  return (
    <div data-testid="admin-financiamiento-page">
      <PageHeader
        title={t("admin.financiamiento")}
        description={t("admin.fin_subtitle")}
        entity="financiamiento.json"
        value={draft}
        onSave={save}
        saving={saving}
        saved={saved}
      />

      <div className="space-y-6">
        {/* Page copy */}
        <AdminCard title={t("admin.fin_pageCopy")}>
          <BilingualField
            label={t("admin.fin_title")}
            es={draft.title.es}
            en={draft.title.en}
            onChange={(l, v) => update((d) => { d.title[l] = v; })}
          />
          <BilingualTextArea
            label={t("admin.fin_subtitle_field")}
            es={draft.subtitle.es}
            en={draft.subtitle.en}
            onChange={(l, v) => update((d) => { d.subtitle[l] = v; })}
          />
          <BilingualField
            label={t("admin.fin_optionsHeading")}
            es={draft.optionsHeading.es}
            en={draft.optionsHeading.en}
            onChange={(l, v) => update((d) => { d.optionsHeading[l] = v; })}
          />
        </AdminCard>

        {/* Financing options */}
        <BilingualSection title={t("admin.fin_options")}>
          {draft.options.map((opt, i) => (
            <div key={i} className="rounded-xl border border-border p-4 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <SelectField
                  label={t("admin.fin_icon")}
                  value={opt.iconName}
                  onChange={(v) => update((d) => { d.options[i].iconName = v; })}
                  options={iconOptions}
                />
                <BilingualField
                  label={t("admin.fin_optionTitle")}
                  es={opt.title.es}
                  en={opt.title.en}
                  onChange={(l, v) => update((d) => { d.options[i].title[l] = v; })}
                />
              </div>
              <BilingualTextArea
                label={t("admin.fin_optionDescription")}
                es={opt.description.es}
                en={opt.description.en}
                onChange={(l, v) => update((d) => { d.options[i].description[l] = v; })}
              />
            </div>
          ))}
        </BilingualSection>

        {/* Project types */}
        <BilingualSection title={t("admin.fin_projectTypes")}>
          <BilingualField
            label={t("admin.fin_projectsDivider")}
            es={draft.projectsDivider.es}
            en={draft.projectsDivider.en}
            onChange={(l, v) => update((d) => { d.projectsDivider[l] = v; })}
          />
          {draft.projectTypes.map((pt, i) => (
            <div key={i} className="grid sm:grid-cols-3 gap-3 items-start">
              <SelectField
                label={t("admin.fin_icon")}
                value={pt.iconName}
                onChange={(v) => update((d) => { d.projectTypes[i].iconName = v; })}
                options={iconOptions}
              />
              <BilingualField
                className="sm:col-span-2"
                label={t("admin.fin_projectLabel")}
                es={pt.label.es}
                en={pt.label.en}
                onChange={(l, v) => update((d) => { d.projectTypes[i].label[l] = v; })}
              />
            </div>
          ))}
        </BilingualSection>

        {/* Turnkey service */}
        <AdminCard title={t("admin.fin_turnkey")}>
          <BilingualField
            label={t("admin.fin_turnkeyHeading")}
            es={draft.turnkey.heading.es}
            en={draft.turnkey.heading.en}
            onChange={(l, v) => update((d) => { d.turnkey.heading[l] = v; })}
          />
          <BilingualTextArea
            label={t("admin.fin_turnkeyBody")}
            es={draft.turnkey.body.es}
            en={draft.turnkey.body.en}
            onChange={(l, v) => update((d) => { d.turnkey.body[l] = v; })}
          />
          <SelectField
            label={t("admin.fin_bulletIcon")}
            value={draft.turnkey.bulletIconName}
            onChange={(v) => update((d) => { d.turnkey.bulletIconName = v; })}
            options={iconOptions}
          />
          {draft.turnkey.items.map((item, i) => (
            <BilingualField
              key={i}
              label={`${t("admin.fin_turnkeyItem")} ${i + 1}`}
              es={item.es}
              en={item.en}
              onChange={(l, v) => update((d) => { d.turnkey.items[i][l] = v; })}
            />
          ))}
        </AdminCard>

        {/* CTA + tagline */}
        <AdminCard title={t("admin.fin_cta")}>
          <BilingualField
            label={t("admin.fin_ctaHeading")}
            es={draft.cta.heading.es}
            en={draft.cta.heading.en}
            onChange={(l, v) => update((d) => { d.cta.heading[l] = v; })}
          />
          <BilingualTextArea
            label={t("admin.fin_ctaBody")}
            es={draft.cta.body.es}
            en={draft.cta.body.en}
            onChange={(l, v) => update((d) => { d.cta.body[l] = v; })}
          />
          <BilingualTextArea
            label={t("admin.fin_tagline")}
            es={draft.tagline.es}
            en={draft.tagline.en}
            onChange={(l, v) => update((d) => { d.tagline[l] = v; })}
          />
        </AdminCard>
      </div>
    </div>
  );
}
