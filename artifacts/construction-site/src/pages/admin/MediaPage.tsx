import { useRef, useState } from "react";
import { Upload, Link as LinkIcon, Trash2, Image as ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCard, TextField } from "@/components/admin/AdminUI";
import { useAdminStore } from "@/lib/admin-store";
import { uploadToLibrary, addExternalToLibrary, removeFromLibrary } from "@/lib/media-upload";
import { resolveMediaUrl } from "@/lib/media";
import { useT } from "@/lib/admin-i18n";

/** Media library page (Pattern 4): upload from disk, add by URL, browse + delete. */
export function MediaPage() {
  const { t } = useT();
  const media = useAdminStore((s) => s.media);
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const onUpload = async (file: File) => {
    setBusy(true);
    try {
      await uploadToLibrary(file);
    } finally {
      setBusy(false);
    }
  };

  const onAddUrl = async () => {
    if (!url.trim()) return;
    await addExternalToLibrary(url.trim());
    setUrl("");
  };

  return (
    <div data-testid="admin-media-page">
      <PageHeader title={t("admin.media")} />

      <div className="space-y-6">
        <AdminCard title={t("admin.media_upload")}>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {t("admin.media_upload")}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onUpload(f);
                e.target.value = "";
              }}
            />
          </div>
          <div className="flex items-end gap-2">
            <TextField className="flex-1" label="URL" type="url" value={url} onChange={setUrl} placeholder={t("admin.media_urlPlaceholder")} />
            <button
              type="button"
              onClick={onAddUrl}
              className="h-10 px-4 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-input text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <LinkIcon className="w-4 h-4" />
              {t("admin.actions.confirm", t("chrome.actions.confirm"))}
            </button>
          </div>
        </AdminCard>

        <AdminCard title={t("admin.media_library")}>
          {media.items.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
              <ImageIcon className="w-8 h-8 opacity-40" />
              {t("admin.media_emptyKinds")}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {media.items.map((item) => (
                <div key={item.id} className="rounded-xl border border-border overflow-hidden" data-testid={`media-item-${item.id}`}>
                  <div className="aspect-square bg-background flex items-center justify-center overflow-hidden">
                    {item.kind === "image" ? (
                      <img src={resolveMediaUrl(item)} alt={item.alt?.es ?? item.filename} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                    <span className="text-[10px] text-muted-foreground truncate">{item.filename}</span>
                    <button
                      type="button"
                      onClick={() => void removeFromLibrary(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={t("admin.media_clear")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
