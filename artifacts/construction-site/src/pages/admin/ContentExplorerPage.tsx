import { useEffect, useMemo, useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore, hydrateInventory } from "@/lib/admin-store";
import { getInventory } from "@/repositories/inventory.repository";
import { useT } from "@/lib/admin-i18n";
import { useLanguage } from "@/contexts/LanguageContext";
import { versionedEntries } from "@/lib/admin-manifest";

/**
 * Content Explorer (Pattern 7 — read-only tooling). Two-column master-detail:
 * LEFT lists every content file (entity icon + localized dashboard name + raw
 * filename subtitle), RIGHT renders the selected file's live store slice as a
 * recursive collapsible JSON tree with type-colored leaves. No dirty/Save.
 */

function Leaf({ value }: { value: unknown }) {
  if (value === null) return <span className="text-muted-foreground italic">null</span>;
  if (typeof value === "string") return <span className="text-emerald-600 dark:text-emerald-400 break-words">"{value}"</span>;
  if (typeof value === "number") return <span className="text-sky-600 dark:text-sky-400">{value}</span>;
  if (typeof value === "boolean") return <span className="text-amber-600 dark:text-amber-400">{String(value)}</span>;
  return <span className="text-foreground">{String(value)}</span>;
}

function JsonNode({ name, value, depth }: { name: string; value: unknown; depth: number }) {
  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);
  const [open, setOpen] = useState(depth < 1);

  if (!isObject) {
    return (
      <div className="flex items-start gap-2 py-0.5 text-sm" style={{ paddingLeft: depth * 14 }}>
        <span className="text-muted-foreground font-mono shrink-0">{name}:</span>
        <span className="font-mono"><Leaf value={value} /></span>
      </div>
    );
  }

  const entries = isArray
    ? (value as unknown[]).map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, unknown>);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 py-0.5 text-sm hover:text-primary transition-colors w-full text-left"
        style={{ paddingLeft: depth * 14 }}
      >
        {open ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
        <span className="text-muted-foreground font-mono">{name}</span>
        <span className="text-muted-foreground/60 font-mono text-xs">
          {isArray ? `[${entries.length}]` : `{${entries.length}}`}
        </span>
      </button>
      {open && (
        <div>
          {entries.map(([k, v]) => (
            <JsonNode key={k} name={k} value={v} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ContentExplorerPage() {
  const { t } = useT();
  const { language } = useLanguage();
  // Hydrate the admin-only inventory graph from the (admin-only) repository so
  // its heavy node/edge data never lands in the public bundle.
  useEffect(() => {
    hydrateInventory(getInventory());
  }, []);
  const store = useAdminStore();

  const sliceFor: Record<string, unknown> = {
    "home.json": store.home,
    "catalog.json": store.catalog,
    "lots.json": store.lots,
    "providers.json": store.providers,
    "contactContent.json": store.contactContent,
    "financiamiento.json": store.financiamiento,
    "notFound.json": store.notFound,
    "branding.json": store.branding,
    "contact.json": store.contact,
    "media.json": store.media,
    "seo.json": store.seo,
    "navigation.json": store.navigation,
    "inventory.json": store.inventory,
  };

  const entries = useMemo(
    () => versionedEntries().filter((e) => e.file && e.file in sliceFor),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [selected, setSelected] = useState<string>(entries[0]?.file ?? "");

  const selectedEntry = entries.find((e) => e.file === selected);
  const selectedData = selected ? sliceFor[selected] : undefined;

  return (
    <div data-testid="admin-content-explorer-page">
      <PageHeader title={t("admin.contentExplorer")} description={t("admin.explorer_subtitle")} />

      <div className="grid md:grid-cols-[18rem_1fr] gap-6">
        {/* LEFT — file list */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden h-fit">
          <ul>
            {entries.map((e) => {
              const Icon = e.icon;
              const active = e.file === selected;
              return (
                <li key={e.file}>
                  <button
                    type="button"
                    onClick={() => setSelected(e.file!)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border last:border-0 ${
                      active ? "bg-accent text-[#0f172a]" : "hover:bg-muted text-foreground"
                    }`}
                    data-testid={`explorer-file-${e.file}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium truncate">{e.label[language]}</span>
                      <code className={`block text-[11px] font-mono truncate ${active ? "text-[#0f172a]/70" : "text-muted-foreground"}`}>
                        {e.file}
                      </code>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* RIGHT — JSON tree */}
        <div className="bg-card rounded-2xl border border-border p-5 overflow-x-auto">
          {selectedEntry && (
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {selectedEntry.label[language]} · <code className="font-mono">{selectedEntry.file}</code>
            </h2>
          )}
          {selectedData !== undefined ? (
            <JsonNode name="root" value={selectedData} depth={0} />
          ) : (
            <p className="text-sm text-muted-foreground">{t("admin.explorer_selectPrompt")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
