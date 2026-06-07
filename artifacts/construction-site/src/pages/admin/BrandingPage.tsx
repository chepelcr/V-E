import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCard, BilingualField, ColorField, TextField, Toggle } from "@/components/admin/AdminUI";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { useAdminStore, downloadJson } from "@/lib/admin-store";
import { useT } from "@/lib/admin-i18n";
import { applyBrandTheme, applyFavicon } from "@/lib/brand-theme";

/**
 * Site Identity (Pattern 3 — multi-file). Edits `branding.json` + `themes.json`
 * together: two drafts, one combined dirty/save that writes BOTH files. Theme
 * edits live-preview via `applyBrandTheme`; the saved active theme is re-applied
 * on unmount so a cancelled edit doesn't linger.
 */
export function BrandingPage() {
  const { t } = useT();
  const branding = useAdminStore((s) => s.branding);
  const themes = useAdminStore((s) => s.themes);
  const setBranding = useAdminStore((s) => s.setBranding);
  const setThemes = useAdminStore((s) => s.setThemes);

  const [bDraft, setBDraft] = useState(() => structuredClone(branding));
  const [tDraft, setTDraft] = useState(() => structuredClone(themes));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  type BDraft = typeof bDraft;
  const updateB = (fn: (d: BDraft) => void) =>
    setBDraft((p) => { const n = structuredClone(p); fn(n); return n; });

  type TDraft = typeof tDraft;
  const updateT = (fn: (d: TDraft) => void) =>
    setTDraft((p) => { const n = structuredClone(p); fn(n); return n; });

  // Live preview the active theme while editing colours.
  useEffect(() => {
    const active = tDraft.find((th) => th.isActive) ?? tDraft[0];
    applyBrandTheme(active);
  }, [tDraft]);

  // Re-apply the saved active theme + favicon when leaving.
  useEffect(() => {
    return () => {
      const active = useAdminStore.getState().themes.find((th) => th.isActive) ?? useAdminStore.getState().themes[0];
      applyBrandTheme(active);
      applyFavicon(useAdminStore.getState().branding.faviconUrl);
    };
  }, []);

  // Combined dirty value (drives the single registration + Save button).
  const combined = { branding: bDraft, themes: tDraft };

  const save = async () => {
    setSaving(true);
    setBranding(bDraft);
    setThemes(tDraft);
    await downloadJson("branding.json", bDraft);
    await downloadJson("themes.json", tDraft);
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const activate = (id: string) =>
    updateT((d) => { d.forEach((th) => { th.isActive = th.id === id; }); });

  return (
    <div data-testid="admin-identity-page">
      <PageHeader
        title={t("admin.identity")}
        entity="branding.json"
        value={combined}
        onSave={save}
        saving={saving}
        saved={saved}
      />

      <div className="space-y-6">
        <AdminCard title="Branding">
          <TextField
            label="Company name"
            value={bDraft.companyName}
            onChange={(v) => updateB((d) => { d.companyName = v; })}
          />
          <TextField
            label="Wordmark"
            value={bDraft.wordmark}
            onChange={(v) => updateB((d) => { d.wordmark = v; })}
          />
          <BilingualField
            label="Tagline"
            es={bDraft.tagline.es}
            en={bDraft.tagline.en}
            onChange={(l, v) => updateB((d) => { d.tagline[l] = v; })}
          />
          <MediaPicker label="Logo (light bg)" value={bDraft.logoUrl} onChange={(v) => updateB((d) => { d.logoUrl = v; })} />
          <MediaPicker label="Logo (dark bg)" value={bDraft.logoUrlDark} onChange={(v) => updateB((d) => { d.logoUrlDark = v; })} />
          <MediaPicker label="Logo mark (footer)" value={bDraft.logoMark} onChange={(v) => updateB((d) => { d.logoMark = v; })} />
          <MediaPicker label="Favicon" value={bDraft.faviconUrl} onChange={(v) => updateB((d) => { d.faviconUrl = v; })} />
        </AdminCard>

        {tDraft.map((theme, i) => (
          <AdminCard
            key={theme.id}
            title={theme.name}
            action={
              <Toggle
                checked={theme.isActive}
                onChange={() => activate(theme.id)}
                label={theme.isActive ? undefined : undefined}
              />
            }
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {theme.isActive && <Star className="w-3.5 h-3.5 text-primary fill-primary" />}
              <code className="font-mono">{theme.id}</code>
            </div>
            <TextField
              label="Name"
              value={theme.name}
              onChange={(v) => updateT((d) => { d[i].name = v; })}
            />
            <div className="grid sm:grid-cols-3 gap-3">
              <ColorField label="Primary" value={theme.colors.primary} onChange={(v) => updateT((d) => { d[i].colors.primary = v; })} />
              <ColorField label="Accent" value={theme.colors.accent} onChange={(v) => updateT((d) => { d[i].colors.accent = v; })} />
              <ColorField label="Background" value={theme.colors.background} onChange={(v) => updateT((d) => { d[i].colors.background = v; })} />
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
