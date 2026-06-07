import { useRef, useState } from "react";
import { Upload, Library, X, Loader2, Image as ImageIcon, Film, Music } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";
import { uploadToLibrary } from "@/lib/media-upload";
import { resolveAssetUrl, resolveMediaUrl, mediaRef, type MediaKind, type MediaItem } from "@/lib/media";
import { useT } from "@/lib/admin-i18n";

interface Props {
  /** The stored reference (root-relative path for local, absolute URL for external). */
  value: string;
  onChange: (ref: string) => void;
  label?: string;
  hint?: string;
  /** Which media kinds can be picked/uploaded. Defaults to images only. */
  kinds?: MediaKind[];
}

const ACCEPT: Record<MediaKind, string> = {
  image: "image/*",
  video: "video/*",
  audio: "audio/*",
};

function KindIcon({ kind, className }: { kind: MediaKind; className?: string }) {
  if (kind === "video") return <Film className={className} />;
  if (kind === "audio") return <Music className={className} />;
  return <ImageIcon className={className} />;
}

/** Small media preview for a stored ref (renders <img> only for image kinds). */
function Preview({ value, kind }: { value: string; kind: MediaKind }) {
  const url = resolveAssetUrl(value);
  if (value && kind === "image") {
    return <img src={url} alt="" className="w-full h-full object-contain p-1" />;
  }
  if (value && kind === "video") {
    return <video src={url} className="w-full h-full object-contain" muted />;
  }
  return <KindIcon kind={kind} className="w-6 h-6 text-muted-foreground" />;
}

/**
 * Reusable asset field: pick from the media library, upload from disk (into
 * `public/media/`), or paste a custom external URL. Stores a relative path for
 * local assets and the raw URL for external ones — resolved for display via
 * `media.ts`. Library browser is a hand-rolled modal (backdrop click closes).
 */
export function MediaPicker({ value, onChange, label, hint, kinds = ["image"] }: Props) {
  const { t } = useT();
  const media = useAdminStore((s) => s.media);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const primaryKind = kinds[0] ?? "image";
  const accept = kinds.map((k) => ACCEPT[k]).join(",");
  const items = media.items.filter((i) => kinds.includes(i.kind));

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);
    try {
      const item = await uploadToLibrary(file);
      if (item) onChange(mediaRef(item));
      else setError(t("admin.media_uploadUnavailable"));
    } finally {
      setBusy(false);
    }
  }

  function pick(item: MediaItem) {
    onChange(mediaRef(item));
    setBrowsing(false);
  }

  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="flex items-start gap-3">
        {/* Preview */}
        <div className="w-16 h-16 flex-shrink-0 rounded-xl border-2 border-border bg-background flex items-center justify-center overflow-hidden">
          {busy ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <Preview value={value} kind={primaryKind} />}
        </div>

        <div className="flex-1 space-y-2 min-w-0">
          {/* Custom URL / current value (editable) */}
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t("admin.media_urlPlaceholder")}
            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm font-mono text-foreground focus:outline-none focus:border-primary"
            data-testid="media-picker-url"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
              data-testid="media-picker-upload"
            >
              <Upload className="w-3.5 h-3.5" />
              {t("admin.media_upload")}
            </button>
            <button
              type="button"
              onClick={() => setBrowsing(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-muted-foreground text-xs font-semibold hover:text-foreground hover:border-input transition-colors"
              data-testid="media-picker-library"
            >
              <Library className="w-3.5 h-3.5" />
              {t("admin.media_library")}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border text-muted-foreground text-xs hover:text-destructive transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                {t("admin.media_clear")}
              </button>
            )}
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {/* Library browser */}
      {browsing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setBrowsing(false)}>
          <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">{t("admin.media_library")}</h2>
              <button onClick={() => setBrowsing(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t("admin.media_emptyKinds")}</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => pick(item)}
                    className="group rounded-xl border border-border overflow-hidden hover:border-primary transition-colors text-left"
                    data-testid={`media-pick-${item.id}`}
                  >
                    <div className="aspect-square bg-background flex items-center justify-center overflow-hidden">
                      {item.kind === "image" ? (
                        <img src={resolveMediaUrl(item)} alt={item.alt?.es ?? item.filename} className="w-full h-full object-cover" />
                      ) : (
                        <KindIcon kind={item.kind} className="w-7 h-7 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate px-1.5 py-1">{item.filename}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
