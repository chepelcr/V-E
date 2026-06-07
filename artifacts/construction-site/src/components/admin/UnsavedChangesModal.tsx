import { useState } from "react";
import { useLocation } from "wouter";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useAdminUi } from "@/lib/admin-ui";
import { useAdminStore } from "@/lib/admin-store";
import { useT } from "@/lib/admin-i18n";

/**
 * Confirm dialog shown when the user tries to leave a content page that has
 * unsaved edits (the nav guard parks the target in `navTarget`). Offers to keep
 * editing, discard the edits, or save and continue. Hand-rolled modal (fixed
 * overlay; backdrop click cancels). Rendered once by AdminLayout.
 */
export function UnsavedChangesModal() {
  const { t } = useT();
  const navTarget = useAdminUi((s) => s.navTarget);
  const save = useAdminUi((s) => s.save);
  const filename = useAdminUi((s) => s.filename);
  const closeNav = useAdminUi((s) => s.closeNav);
  const clearEditor = useAdminUi((s) => s.clearEditor);
  const discardEntity = useAdminStore((s) => s.discardEntity);
  const [, navigate] = useLocation();
  const [busy, setBusy] = useState(false);

  if (!navTarget) return null;

  const go = () => {
    const target = navTarget;
    closeNav();
    navigate(target);
  };

  const onDiscard = () => {
    if (filename) discardEntity(filename);
    clearEditor();
    go();
  };

  const onSave = async () => {
    setBusy(true);
    try {
      await save?.();
    } finally {
      setBusy(false);
    }
    go();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      data-testid="unsaved-modal"
      onClick={closeNav}
    >
      <div
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground">{t("admin.unsavedTitle")}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t("admin.unsavedBody")}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 mt-6">
          <button
            onClick={closeNav}
            disabled={busy}
            className="h-9 px-4 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-input text-sm font-medium transition-colors disabled:opacity-60"
            data-testid="unsaved-cancel"
          >
            {t("admin.keepEditing")}
          </button>
          <button
            onClick={onDiscard}
            disabled={busy}
            className="h-9 px-4 rounded-lg text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-60"
            data-testid="unsaved-discard"
          >
            {t("admin.discard")}
          </button>
          <button
            onClick={onSave}
            disabled={busy}
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
            data-testid="unsaved-save"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("admin.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
