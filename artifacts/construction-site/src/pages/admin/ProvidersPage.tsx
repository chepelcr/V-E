import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  AdminCard,
  BilingualField,
  BilingualTextArea,
  TextField,
} from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { useT } from "@/lib/admin-i18n";
import type {
  ProvidersContent,
  ProviderItem,
  ProviderMaterial,
} from "@/repositories/providers.repository";

/**
 * Providers content editor (Pattern 2 — list-editor cards + bilingual modal,
 * plus a singleton intro title/subtitle block). The intro is edited inline; each
 * provider is a card that opens a modal for full editing: proper-noun brand name
 * (plain string), localized description, a list of per-item localized `{es,en}`
 * materials, and plain optional website/contact fields. Saves the full
 * `providers.json` draft through the single `downloadJson` entry.
 */

function emptyMaterial(): ProviderMaterial {
  return { es: "", en: "" };
}

function emptyProvider(): ProviderItem {
  return {
    id: `p-${Date.now()}`,
    name: "",
    description: { es: "", en: "" },
    materials: [],
    website: "",
    contact: "",
  };
}

export function ProvidersPage() {
  const { t } = useT();
  const providers = useAdminStore((s) => s.providers);
  const setProviders = useAdminStore((s) => s.setProviders);
  const [draft, setDraft] = useState<ProvidersContent>(() => structuredClone(providers));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  type Draft = ProvidersContent;
  const update = (fn: (d: Draft) => void) => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setProviders(draft);
    await downloadJson("providers.json", draft);
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const addProvider = () => {
    update((d) => { d.items.push(emptyProvider()); });
    setEditingIndex(draft.items.length);
  };

  const removeProvider = (i: number) => {
    update((d) => { d.items.splice(i, 1); });
  };

  const editing = editingIndex != null ? draft.items[editingIndex] : null;

  return (
    <div data-testid="admin-providers-page">
      <PageHeader
        title={t("admin.providers")}
        description={t("admin.providers_subtitle")}
        entity="providers.json"
        value={draft}
        onSave={save}
        saving={saving}
        saved={saved}
      />

      <div className="space-y-6">
        {/* Singleton intro copy */}
        <AdminCard title={t("admin.providers_pageCopy")}>
          <BilingualField
            label={t("admin.providers_titleField")}
            es={draft.intro.title.es}
            en={draft.intro.title.en}
            onChange={(l, v) => update((d) => { d.intro.title[l] = v; })}
          />
          <BilingualTextArea
            label={t("admin.providers_subtitleField")}
            es={draft.intro.subtitle.es}
            en={draft.intro.subtitle.en}
            onChange={(l, v) => update((d) => { d.intro.subtitle[l] = v; })}
          />
        </AdminCard>

        {/* Providers list */}
        <AdminCard
          title={t("admin.providers_items")}
          action={
            <button
              type="button"
              onClick={addProvider}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
              data-testid="providers-add-provider"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("admin.providers_addProvider")}
            </button>
          }
        >
          {draft.items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{t("admin.providers_noProviders")}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {draft.items.map((p, i) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-border bg-background overflow-hidden"
                  data-testid={`providers-provider-card-${p.id}`}
                >
                  <div className="p-3 space-y-2">
                    <span className="font-semibold text-foreground text-sm truncate block">{p.name || "—"}</span>
                    <p className="text-xs text-muted-foreground line-clamp-2">{p.description.en || p.description.es || "—"}</p>
                    {p.materials.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {p.materials.map((m, mi) => (
                          <span
                            key={mi}
                            className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                          >
                            {m.en || m.es || "—"}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingIndex(i)}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-muted-foreground text-xs font-semibold hover:text-foreground hover:border-input transition-colors"
                        data-testid={`providers-edit-${p.id}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        {t("admin.providers_editProvider")}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProvider(i)}
                        className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border text-muted-foreground text-xs hover:text-destructive transition-colors"
                        data-testid={`providers-remove-${p.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminCard>
      </div>

      {/* Edit modal */}
      {editing && editingIndex != null && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setEditingIndex(null)}
        >
          <div
            className="bg-card rounded-2xl w-full max-w-3xl max-h-[88vh] overflow-y-auto p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
            data-testid="providers-provider-modal"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{t("admin.providers_editProvider")}</h2>
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={t("admin.providers_done")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <TextField
              label={t("admin.providers_name")}
              value={editing.name}
              onChange={(v) => update((d) => { d.items[editingIndex].name = v; })}
              placeholder={t("admin.providers_namePlaceholder")}
            />

            <BilingualTextArea
              label={t("admin.providers_description")}
              es={editing.description.es}
              en={editing.description.en}
              onChange={(l, v) => update((d) => { d.items[editingIndex].description[l] = v; })}
            />

            {/* Materials — list of bilingual chips */}
            <div className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("admin.providers_materials")}
                </span>
                <button
                  type="button"
                  onClick={() => update((d) => { d.items[editingIndex].materials.push(emptyMaterial()); })}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                  data-testid="providers-add-material"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t("admin.providers_addMaterial")}
                </button>
              </div>
              {editing.materials.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2 text-center">{t("admin.providers_noMaterials")}</p>
              ) : (
                <div className="space-y-3">
                  {editing.materials.map((m, mi) => (
                    <div key={mi} className="flex items-end gap-2">
                      <div className="flex-1">
                        <BilingualField
                          label={`${t("admin.providers_material")} ${mi + 1}`}
                          es={m.es}
                          en={m.en}
                          onChange={(l, v) => update((d) => { d.items[editingIndex].materials[mi][l] = v; })}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => update((d) => { d.items[editingIndex].materials.splice(mi, 1); })}
                        className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-border text-muted-foreground text-xs hover:text-destructive transition-colors"
                        data-testid={`providers-remove-material-${mi}`}
                        aria-label={t("admin.providers_removeMaterial")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <TextField
                label={t("admin.providers_website")}
                value={editing.website}
                onChange={(v) => update((d) => { d.items[editingIndex].website = v; })}
                placeholder={t("admin.providers_websitePlaceholder")}
              />
              <TextField
                label={t("admin.providers_contact")}
                value={editing.contact}
                onChange={(v) => update((d) => { d.items[editingIndex].contact = v; })}
                placeholder={t("admin.providers_contactPlaceholder")}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                data-testid="providers-modal-done"
              >
                {t("admin.providers_done")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
