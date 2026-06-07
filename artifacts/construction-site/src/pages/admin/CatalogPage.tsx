import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  AdminCard,
  BilingualField,
  BilingualTextArea,
  SelectField,
  TextField,
} from "@/components/admin/AdminUI";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { useT } from "@/lib/admin-i18n";
import type { CatalogContent, CatalogModel } from "@/repositories/catalog.repository";
import { ROOM_ORDER } from "@/services/catalog.service";

/**
 * Catalog content editor (Pattern 2 — list-editor cards + bilingual modal, plus
 * a singleton title/subtitle block). The page title/subtitle are edited inline;
 * each house model is a card that opens a bilingual modal for full editing
 * (name proper-noun, localized description, numeric specs, enum currency, and a
 * media-backed gallery with category/room enums + localized captions). Saves the
 * full `catalog.json` draft through the single `downloadJson` entry.
 */

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "CRC", label: "CRC" },
];

const CATEGORY_OPTIONS = [
  { value: "interior", label: "interior" },
  { value: "exterior", label: "exterior" },
];

function emptyModel(): CatalogModel {
  return {
    id: `hm-${Date.now()}`,
    name: "",
    description: { es: "", en: "" },
    price: 0,
    currency: "USD",
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
    gallery: [],
  };
}

export function CatalogPage() {
  const { t } = useT();
  const catalog = useAdminStore((s) => s.catalog);
  const setCatalog = useAdminStore((s) => s.setCatalog);
  const [draft, setDraft] = useState<CatalogContent>(() => structuredClone(catalog));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  type Draft = CatalogContent;
  const update = (fn: (d: Draft) => void) => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setCatalog(draft);
    await downloadJson("catalog.json", draft);
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const addModel = () => {
    update((d) => { d.models.push(emptyModel()); });
    setEditingIndex(draft.models.length);
  };

  const removeModel = (i: number) => {
    update((d) => { d.models.splice(i, 1); });
  };

  const roomOptions = ROOM_ORDER.map((r) => ({ value: r, label: t(`chrome.rooms.${r}`) }));

  const editing = editingIndex != null ? draft.models[editingIndex] : null;

  return (
    <div data-testid="admin-catalog-page">
      <PageHeader
        title={t("admin.catalog")}
        description={t("admin.catalog_subtitle")}
        entity="catalog.json"
        value={draft}
        onSave={save}
        saving={saving}
        saved={saved}
      />

      <div className="space-y-6">
        {/* Singleton page copy */}
        <AdminCard title={t("admin.catalog_pageCopy")}>
          <BilingualField
            label={t("admin.catalog_titleField")}
            es={draft.title.es}
            en={draft.title.en}
            onChange={(l, v) => update((d) => { d.title[l] = v; })}
          />
          <BilingualTextArea
            label={t("admin.catalog_subtitleField")}
            es={draft.subtitle.es}
            en={draft.subtitle.en}
            onChange={(l, v) => update((d) => { d.subtitle[l] = v; })}
          />
        </AdminCard>

        {/* Models list */}
        <AdminCard
          title={t("admin.catalog_models")}
          action={
            <button
              type="button"
              onClick={addModel}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
              data-testid="catalog-add-model"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("admin.catalog_addModel")}
            </button>
          }
        >
          {draft.models.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{t("admin.catalog_noModels")}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {draft.models.map((m, i) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-border bg-background overflow-hidden"
                  data-testid={`catalog-model-card-${m.id}`}
                >
                  <div className="aspect-[4/3] bg-card flex items-center justify-center overflow-hidden border-b border-border">
                    {m.gallery[0]?.ref ? (
                      <img src={m.gallery[0].ref} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-muted-foreground">{t("admin.catalog_noImages")}</span>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground text-sm truncate">{m.name || "—"}</span>
                      <span className="text-xs text-primary shrink-0">{m.currency} {m.price.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingIndex(i)}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-muted-foreground text-xs font-semibold hover:text-foreground hover:border-input transition-colors"
                        data-testid={`catalog-edit-${m.id}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        {t("admin.catalog_editModel")}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeModel(i)}
                        className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border text-muted-foreground text-xs hover:text-destructive transition-colors"
                        data-testid={`catalog-remove-${m.id}`}
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

      {/* Bilingual edit modal */}
      {editing && editingIndex != null && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setEditingIndex(null)}
        >
          <div
            className="bg-card rounded-2xl w-full max-w-3xl max-h-[88vh] overflow-y-auto p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
            data-testid="catalog-model-modal"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{t("admin.catalog_editModel")}</h2>
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={t("admin.catalog_done")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <TextField
              label={t("admin.catalog_name")}
              value={editing.name}
              onChange={(v) => update((d) => { d.models[editingIndex].name = v; })}
              placeholder={t("admin.catalog_namePlaceholder")}
            />
            <BilingualTextArea
              label={t("admin.catalog_description")}
              es={editing.description.es}
              en={editing.description.en}
              onChange={(l, v) => update((d) => { d.models[editingIndex].description[l] = v; })}
            />

            <div className="grid sm:grid-cols-3 gap-3">
              <TextField
                label={t("admin.catalog_price")}
                value={String(editing.price)}
                onChange={(v) => update((d) => { d.models[editingIndex].price = Number(v) || 0; })}
              />
              <SelectField
                label={t("admin.catalog_currency")}
                value={editing.currency}
                onChange={(v) => update((d) => { d.models[editingIndex].currency = v; })}
                options={CURRENCY_OPTIONS}
              />
              <TextField
                label={t("admin.catalog_area")}
                value={String(editing.area)}
                onChange={(v) => update((d) => { d.models[editingIndex].area = Number(v) || 0; })}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <TextField
                label={t("admin.catalog_bedrooms")}
                value={String(editing.bedrooms)}
                onChange={(v) => update((d) => { d.models[editingIndex].bedrooms = Number(v) || 0; })}
              />
              <TextField
                label={t("admin.catalog_bathrooms")}
                value={String(editing.bathrooms)}
                onChange={(v) => update((d) => { d.models[editingIndex].bathrooms = Number(v) || 0; })}
              />
            </div>

            {/* Gallery */}
            <div className="rounded-xl border border-border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("admin.catalog_gallery")}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    update((d) => {
                      d.models[editingIndex].gallery.push({
                        ref: "",
                        category: "exterior",
                        room: "facade",
                        caption: { es: "", en: "" },
                      });
                    })
                  }
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                  data-testid="catalog-add-image"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t("admin.catalog_addImage")}
                </button>
              </div>

              {editing.gallery.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">{t("admin.catalog_noImages")}</p>
              ) : (
                editing.gallery.map((g, gi) => (
                  <div key={gi} className="rounded-lg border border-border/60 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {t("admin.catalog_image")} {gi + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => update((d) => { d.models[editingIndex].gallery.splice(gi, 1); })}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label={t("admin.catalog_remove")}
                        data-testid={`catalog-remove-image-${gi}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <MediaPicker
                      value={g.ref}
                      onChange={(ref) => update((d) => { d.models[editingIndex].gallery[gi].ref = ref; })}
                    />
                    <div className="grid sm:grid-cols-2 gap-3">
                      <SelectField
                        label={t("admin.catalog_category")}
                        value={g.category}
                        onChange={(v) => update((d) => { d.models[editingIndex].gallery[gi].category = v; })}
                        options={CATEGORY_OPTIONS}
                      />
                      <SelectField
                        label={t("admin.catalog_room")}
                        value={g.room}
                        onChange={(v) => update((d) => { d.models[editingIndex].gallery[gi].room = v; })}
                        options={roomOptions}
                      />
                    </div>
                    <BilingualField
                      label={t("admin.catalog_caption")}
                      es={g.caption.es}
                      en={g.caption.en}
                      onChange={(l, v) => update((d) => { d.models[editingIndex].gallery[gi].caption[l] = v; })}
                    />
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                data-testid="catalog-modal-done"
              >
                {t("admin.catalog_done")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
