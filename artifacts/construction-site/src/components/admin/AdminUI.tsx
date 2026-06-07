import { useState } from "react";
import { Save, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { useT } from "@/lib/admin-i18n";

/**
 * Shared admin form primitives — the common building blocks every content page
 * uses (TextField, TextAreaField, Toggle, ColorField, SelectField, SaveButton,
 * FloatingSaveButton) plus the bilingual editing kit
 * (BilingualField/BilingualTextArea/BilingualSection) that shows Spanish and
 * English side by side. Styled in the V&E admin palette using semantic tokens.
 *
 * (On-device auto-translation hooks are deferred to a later phase; the bilingual
 * primitives edit both sides directly for now.)
 */

const inputCls =
  "w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors";
const labelCls =
  "block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5";

/**
 * Full-width card with an Eye/EyeOff toggle to collapse its body. `action`
 * renders inline in the header (left of the eye). Used everywhere in admin so
 * sections fill the container and can be folded away.
 */
export function AdminCard({
  title,
  action,
  children,
  className = "",
  bodyClassName = "p-6 space-y-4",
  defaultOpen = true,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  defaultOpen?: boolean;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`bg-card rounded-2xl border border-border ${className}`} data-testid="admin-card">
      <div
        className={`flex items-center justify-between gap-3 px-6 py-3.5 transition-[border-color] duration-300 ${
          open ? "border-b border-border" : "border-b border-transparent"
        }`}
      >
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className="flex items-center gap-2 ml-auto">
          {action}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="text-muted-foreground hover:text-primary transition-colors"
            title={open ? t("admin.collapse") : t("admin.expand")}
            aria-expanded={open}
            data-testid="admin-card-toggle"
          >
            {open ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {/* grid-rows 1fr→0fr animates height with no JS measuring; inner clips. */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className={bodyClassName}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export function BilingualSection({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-testid="bilingual-section" className={className}>
      <AdminCard title={title}>{children}</AdminCard>
    </div>
  );
}

export function BilingualField({
  label,
  es,
  en,
  onChange,
  placeholder,
  hint,
  type = "text",
  className = "",
}: {
  label?: string;
  es: string;
  en: string;
  onChange: (lang: "es" | "en", value: string) => void;
  placeholder?: string;
  hint?: string;
  type?: "text" | "email" | "url";
  className?: string;
}) {
  const { t } = useT();
  const extra = type === "url" || type === "email" ? "font-mono" : "";
  return (
    <div className={className}>
      {label && <label className={labelCls}>{label}</label>}
      <div className="grid grid-cols-2 gap-3">
        {(["es", "en"] as const).map((l) => (
          <div key={l}>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              {t(l === "es" ? "admin.spanish" : "admin.english")}
            </span>
            <input
              type={type}
              value={l === "es" ? es : en}
              onChange={(e) => onChange(l, e.target.value)}
              placeholder={placeholder}
              className={`${inputCls} ${extra}`}
              data-testid={`bilingual-${l}`}
            />
          </div>
        ))}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function BilingualTextArea({
  label,
  es,
  en,
  onChange,
  rows = 3,
  placeholder,
  hint,
  className = "",
}: {
  label?: string;
  es: string;
  en: string;
  onChange: (lang: "es" | "en", value: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
  className?: string;
}) {
  const { t } = useT();
  return (
    <div className={className}>
      {label && <label className={labelCls}>{label}</label>}
      <div className="grid grid-cols-2 gap-3">
        {(["es", "en"] as const).map((l) => (
          <div key={l}>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              {t(l === "es" ? "admin.spanish" : "admin.english")}
            </span>
            <textarea
              value={l === "es" ? es : en}
              onChange={(e) => onChange(l, e.target.value)}
              rows={rows}
              placeholder={placeholder}
              className={`${inputCls} h-auto py-2 resize-y leading-relaxed`}
              data-testid={`bilingual-${l}`}
            />
          </div>
        ))}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
  required,
  className = "",
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: "text" | "email" | "url";
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <label className={labelCls}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} ${type === "url" || type === "email" ? "font-mono" : ""}`}
      />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
  hint,
  className = "",
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className={labelCls}>{label}</label>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`${inputCls} h-auto py-2 resize-y leading-relaxed`}
      />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Color field: native color swatch + hex text input, kept in sync. */
export function ColorField({
  label,
  value,
  onChange,
  hint,
  className = "",
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className={labelCls}>{label}</label>}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 rounded-lg border border-input bg-background p-1 cursor-pointer"
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} font-mono`}
        />
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Select field — every token/enum field renders through this. */
export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
  className = "",
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className={labelCls}>{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} cursor-pointer`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  className = "",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  className?: string;
}) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          checked ? "bg-primary" : "bg-input"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
    </label>
  );
}

/** Primary save button with saving/saved feedback. */
export function SaveButton({
  onClick,
  saving = false,
  saved = false,
  label,
}: {
  onClick: () => void;
  saving?: boolean;
  saved?: boolean;
  label?: string;
}) {
  const { t } = useT();
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-60 transition-colors"
      data-testid="btn-save"
    >
      {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
      {saving ? t("admin.saving") : saved ? t("admin.saved") : label ?? t("admin.save")}
    </button>
  );
}

/**
 * Floating save button — a fixed, icon-only round FAB anchored bottom-right so
 * it travels with the user while scrolling a long content page. Only rendered
 * (by PageHeader) when there are unsaved edits. Brand-primary → emerald on save.
 */
export function FloatingSaveButton({
  onClick,
  saving = false,
  saved = false,
  label,
}: {
  onClick: () => void;
  saving?: boolean;
  saved?: boolean;
  label?: string;
}) {
  const { t } = useT();
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all disabled:opacity-70 ${
        saved ? "bg-emerald-600" : "bg-primary hover:brightness-110 hover:shadow-xl"
      }`}
      data-testid="btn-save-floating"
      title={saved ? t("admin.saved") : label ?? t("admin.save")}
      aria-label={label ?? t("admin.save")}
    >
      {saving ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : saved ? (
        <Check className="w-6 h-6" />
      ) : (
        <Save className="w-6 h-6" />
      )}
    </button>
  );
}
