import { useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { FloatingSaveButton } from "./AdminUI";
import { useEntityDirty } from "@/lib/admin-store";
import { useAdminUi } from "@/lib/admin-ui";
import { useT } from "@/lib/admin-i18n";

interface Props {
  title: string;
  description?: string;
  /** Standardized primary save — rendered as a floating button when dirty. */
  onSave?: () => void;
  saving?: boolean;
  saved?: boolean;
  saveLabel?: string;
  /**
   * Content file this page edits (e.g. "home.json") + the current editable value
   * (the draft, or the store slice for pages that mutate the store directly).
   * Together they drive the dirty state: the Save button only shows when the
   * value differs from what's saved, and leaving while dirty prompts to save.
   */
  entity?: string;
  value?: unknown;
  onExport?: () => void;
  exportLabel?: string;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  onSave,
  saving,
  saved,
  saveLabel,
  entity,
  value,
  onExport,
  exportLabel,
  action,
}: Props) {
  const { t } = useT();
  // Dirty = current value differs from the last-saved snapshot. When the page
  // doesn't opt in (no entity), fall back to always-available save.
  const tracked = !!entity && onSave !== undefined;
  const computedDirty = useEntityDirty(entity ?? " untracked", value);
  const dirty = tracked ? computedDirty : !!onSave;

  const setEditor = useAdminUi((s) => s.setEditor);
  const clearEditor = useAdminUi((s) => s.clearEditor);

  // Keep a stable save wrapper that always calls the latest onSave.
  const saveRef = useRef(onSave);
  saveRef.current = onSave;

  // Register this page with the shell so the nav guard knows whether it's dirty
  // and how to save / which entity to discard. Re-registers when dirty flips.
  useEffect(() => {
    if (!tracked) return;
    setEditor({
      dirty,
      filename: entity!,
      save: async () => {
        await saveRef.current?.();
      },
    });
    return () => clearEditor();
  }, [tracked, dirty, entity, setEditor, clearEditor]);

  // Native guard for hard leaves (refresh, tab close, external links).
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  return (
    <div className="flex items-start justify-between gap-4 mb-8" data-testid="page-header">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {action}
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-input text-sm font-medium transition-colors"
            data-testid="btn-export"
          >
            <Download className="w-4 h-4" />
            {exportLabel ?? t("admin.export")}
          </button>
        )}
      </div>
      {/* Floating, icon-only save — shown only when there's something to save
          (or briefly while saving / after saved). */}
      {onSave && (dirty || saving || saved) && (
        <FloatingSaveButton onClick={onSave} saving={saving} saved={saved} label={saveLabel} />
      )}
    </div>
  );
}
