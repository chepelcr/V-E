import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  AdminCard,
  BilingualField,
  BilingualTextArea,
  SelectField,
  TextField,
  Toggle,
} from "@/components/admin/AdminUI";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { useT } from "@/lib/admin-i18n";
import type { LotsContent, LotItem } from "@/repositories/lots.repository";

/**
 * Lots content editor (Pattern 2 — list-editor cards + bilingual modal, plus a
 * singleton title/subtitle block). The page title/subtitle are edited inline;
 * each lot is a card that opens a modal for full editing: proper-noun name and
 * province/canton/district (plain strings), localized description, numeric
 * size/price, enum currency (USD/CRC SelectField), and an `available` Toggle.
 * Saves the full `lots.json` draft through the single `downloadJson` entry.
 */

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "CRC", label: "CRC" },
];

function emptyLot(): LotItem {
  return {
    id: `l-${Date.now()}`,
    name: "",
    location: { province: "", canton: "", district: "" },
    size: 0,
    price: 0,
    currency: "USD",
    description: { es: "", en: "" },
    available: true,
    modelCompatible: [],
  };
}

export function LotsPage() {
  const { t } = useT();
  const lots = useAdminStore((s) => s.lots);
  const setLots = useAdminStore((s) => s.setLots);
  const [draft, setDraft] = useState<LotsContent>(() => structuredClone(lots));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  type Draft = LotsContent;
  const update = (fn: (d: Draft) => void) => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setLots(draft);
    await downloadJson("lots.json", draft);
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const addLot = () => {
    update((d) => { d.items.push(emptyLot()); });
    setEditingIndex(draft.items.length);
  };

  const removeLot = (i: number) => {
    update((d) => { d.items.splice(i, 1); });
  };

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);

  const editing = editingIndex != null ? draft.items[editingIndex] : null;

  return (
    <div data-testid="admin-lots-page">
      <PageHeader
        title={t("admin.lots")}
        description={t("admin.lots_subtitle")}
        entity="lots.json"
        value={draft}
        onSave={save}
        saving={saving}
        saved={saved}
      />

      <div className="space-y-6">
        {/* Singleton page copy */}
        <AdminCard title={t("admin.lots_pageCopy")}>
          <BilingualField
            label={t("admin.lots_titleField")}
            es={draft.title.es}
            en={draft.title.en}
            onChange={(l, v) => update((d) => { d.title[l] = v; })}
          />
          <BilingualTextArea
            label={t("admin.lots_subtitleField")}
            es={draft.subtitle.es}
            en={draft.subtitle.en}
            onChange={(l, v) => update((d) => { d.subtitle[l] = v; })}
          />
        </AdminCard>

        {/* Lots list */}
        <AdminCard
          title={t("admin.lots_items")}
          action={
            <button
              type="button"
              onClick={addLot}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
              data-testid="lots-add-lot"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("admin.lots_addLot")}
            </button>
          }
        >
          {draft.items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{t("admin.lots_noLots")}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {draft.items.map((l, i) => (
                <div
                  key={l.id}
                  className="rounded-xl border border-border bg-background overflow-hidden"
                  data-testid={`lots-lot-card-${l.id}`}
                >
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground text-sm truncate">{l.name || "—"}</span>
                      <span
                        className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${
                          l.available
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {l.available ? t("chrome.status.available") : t("chrome.status.unavailable")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {[l.location.district, l.location.canton, l.location.province].filter(Boolean).join(", ") || "—"}
                    </p>
                    <p className="text-xs text-primary">{formatPrice(l.price, l.currency)}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingIndex(i)}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-muted-foreground text-xs font-semibold hover:text-foreground hover:border-input transition-colors"
                        data-testid={`lots-edit-${l.id}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        {t("admin.lots_editLot")}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLot(i)}
                        className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border text-muted-foreground text-xs hover:text-destructive transition-colors"
                        data-testid={`lots-remove-${l.id}`}
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
            data-testid="lots-lot-modal"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{t("admin.lots_editLot")}</h2>
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={t("admin.lots_done")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <TextField
              label={t("admin.lots_name")}
              value={editing.name}
              onChange={(v) => update((d) => { d.items[editingIndex].name = v; })}
              placeholder={t("admin.lots_namePlaceholder")}
            />

            <div className="grid sm:grid-cols-3 gap-3">
              <TextField
                label={t("admin.lots_province")}
                value={editing.location.province}
                onChange={(v) => update((d) => { d.items[editingIndex].location.province = v; })}
              />
              <TextField
                label={t("admin.lots_canton")}
                value={editing.location.canton}
                onChange={(v) => update((d) => { d.items[editingIndex].location.canton = v; })}
              />
              <TextField
                label={t("admin.lots_district")}
                value={editing.location.district}
                onChange={(v) => update((d) => { d.items[editingIndex].location.district = v; })}
              />
            </div>

            <BilingualTextArea
              label={t("admin.lots_description")}
              es={editing.description.es}
              en={editing.description.en}
              onChange={(l, v) => update((d) => { d.items[editingIndex].description[l] = v; })}
            />

            <div className="grid sm:grid-cols-3 gap-3">
              <TextField
                label={t("admin.lots_size")}
                value={String(editing.size)}
                onChange={(v) => update((d) => { d.items[editingIndex].size = Number(v) || 0; })}
              />
              <TextField
                label={t("admin.lots_price")}
                value={String(editing.price)}
                onChange={(v) => update((d) => { d.items[editingIndex].price = Number(v) || 0; })}
              />
              <SelectField
                label={t("admin.lots_currency")}
                value={editing.currency}
                onChange={(v) => update((d) => { d.items[editingIndex].currency = v; })}
                options={CURRENCY_OPTIONS}
              />
            </div>

            <div className="rounded-xl border border-border p-4">
              <Toggle
                label={t("admin.lots_available")}
                checked={editing.available}
                onChange={(v) => update((d) => { d.items[editingIndex].available = v; })}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                data-testid="lots-modal-done"
              >
                {t("admin.lots_done")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
