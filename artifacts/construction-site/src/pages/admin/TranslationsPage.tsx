import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCard } from "@/components/admin/AdminUI";
import { downloadJson, useAdminStore, useEntityDirty } from "@/lib/admin-store";
import { useT } from "@/lib/admin-i18n";
import esChrome from "@/translations/es.json";
import enChrome from "@/translations/en.json";

/**
 * Translations key-table editor (Pattern 5). Edits the SHARED chrome i18n files
 * `src/translations/{es,en}.json` — NOT a per-page content entity. Both language
 * bundles are flattened to dot-notation maps, grouped by their first key segment
 * (chrome / admin), search-filtered, and rendered as an editable ES | EN table
 * per group. Save writes each side back via `downloadJson` (local-cms routes
 * `es.json`/`en.json` to `src/translations/`).
 *
 * Because the bundles are imported statically by `admin-i18n`, a hard refresh is
 * needed for edited chrome strings to re-render across the panel; the editor
 * itself shows the live drafts. Both files are tracked as ONE editor so the nav
 * guard + floating Save cover the pair.
 */

type FlatMap = Record<string, string>;

/** Flatten a nested object to dot-notation string leaves. */
function flatten(obj: unknown, prefix = "", out: FlatMap = {}): FlatMap {
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object") flatten(v, key, out);
      else out[key] = v == null ? "" : String(v);
    }
  }
  return out;
}

/** Rebuild a nested object from a dot-notation map. */
function unflatten(map: FlatMap): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  for (const [path, value] of Object.entries(map)) {
    const parts = path.split(".");
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (typeof node[p] !== "object" || node[p] == null) node[p] = {};
      node = node[p] as Record<string, unknown>;
    }
    node[parts[parts.length - 1]] = value;
  }
  return root;
}

export function TranslationsPage() {
  const { t } = useT();
  const [es, setEs] = useState<FlatMap>(() => flatten(esChrome));
  const [en, setEn] = useState<FlatMap>(() => flatten(enChrome));
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const markSaved = useAdminStore((s) => s.markSaved);

  // Seed the dirty baseline once so the page starts clean (this virtual
  // "__translations" entity has no store slice, so its snapshot must be primed).
  const seeded = useRef(false);
  if (!seeded.current) {
    seeded.current = true;
    markSaved("__translations", { es: flatten(esChrome), en: flatten(enChrome) });
  }

  // Union of keys (ES drives ordering; both files share the same shape).
  const allKeys = useMemo(() => {
    const set = new Set([...Object.keys(es), ...Object.keys(en)]);
    return Array.from(set).sort();
  }, [es, en]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allKeys.filter(
      (k) =>
        !q ||
        k.toLowerCase().includes(q) ||
        (es[k] ?? "").toLowerCase().includes(q) ||
        (en[k] ?? "").toLowerCase().includes(q),
    );
  }, [allKeys, query, es, en]);

  // Group by first key segment (chrome / admin).
  const groups = useMemo(() => {
    const g: Record<string, string[]> = {};
    for (const k of filtered) {
      const top = k.split(".")[0];
      (g[top] ??= []).push(k);
    }
    return g;
  }, [filtered]);

  // Tracked as a single editor over both files (dirty when either side changed).
  const combined = useMemo(() => ({ es, en }), [es, en]);
  const dirty = useEntityDirty("__translations", combined);

  const save = async () => {
    setSaving(true);
    await downloadJson("es.json", unflatten(es));
    await downloadJson("en.json", unflatten(en));
    markSaved("__translations", combined);
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div data-testid="admin-translations-page">
      <PageHeader
        title={t("admin.translations")}
        description={t("admin.translations_subtitle")}
        entity="__translations"
        value={combined}
        onSave={save}
        saving={saving}
        saved={saved}
      />

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("admin.translations_search")}
          className="w-full h-10 rounded-xl border border-input bg-background pl-9 pr-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          data-testid="translations-search"
        />
      </div>

      <div className="space-y-6">
        {Object.keys(groups).length === 0 && (
          <p className="text-sm text-muted-foreground">{t("admin.translations_noKeys")}</p>
        )}
        {Object.entries(groups).map(([group, keys]) => (
          <AdminCard key={group} title={group} bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground w-1/3">
                      {t("admin.translations_key")}
                    </th>
                    <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">{t("admin.spanish")}</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">{t("admin.english")}</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k} className="border-b border-border last:border-0 align-top" data-testid={`tr-row-${k}`}>
                      <td className="px-4 py-2">
                        <code className="text-xs font-mono text-primary break-all">{k.slice(group.length + 1)}</code>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={es[k] ?? ""}
                          onChange={(e) => setEs((m) => ({ ...m, [k]: e.target.value }))}
                          className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                          data-testid={`tr-es-${k}`}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={en[k] ?? ""}
                          onChange={(e) => setEn((m) => ({ ...m, [k]: e.target.value }))}
                          className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                          data-testid={`tr-en-${k}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        ))}
      </div>

      {dirty && <div className="h-20" aria-hidden />}
    </div>
  );
}
