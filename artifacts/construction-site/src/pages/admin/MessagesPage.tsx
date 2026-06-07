import { useMemo, useState } from "react";
import { Mail, MailOpen, Archive, Inbox, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCard, SelectField } from "@/components/admin/AdminUI";
import { useAdminStore } from "@/lib/admin-store";
import type { ContactMessage } from "@/lib/admin-store";
import { useT } from "@/lib/admin-i18n";

/**
 * Contact triage inbox (Pattern 6). Reads the `localStorage`-backed
 * `contactMessages` slice (populated by the public contact form via
 * `addContactMessage`) and lets the operator triage them: mark read, archive,
 * restore to new, or delete. It is NOT a content file — there is no JSON to
 * save/publish, so PageHeader carries no entity/save wiring.
 */

type StatusFilter = "all" | ContactMessage["status"];

export function MessagesPage() {
  const { t } = useT();
  const messages = useAdminStore((s) => s.contactMessages);
  const updateContactMessage = useAdminStore((s) => s.updateContactMessage);
  const deleteContactMessage = useAdminStore((s) => s.deleteContactMessage);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? messages : messages.filter((m) => m.status === filter)),
    [messages, filter],
  );

  const selected = messages.find((m) => m.id === selectedId) ?? null;

  const open = (m: ContactMessage) => {
    setSelectedId(m.id);
    if (m.status === "new") updateContactMessage(m.id, { status: "read" });
  };

  const statusLabel = (s: ContactMessage["status"]) => t(`admin.messages_status_${s}`);

  const subjectLabel = (subject?: string) => {
    if (!subject) return t("admin.messages_noSubject");
    // Bridge the schema enum to the chrome subject dictionary.
    const key = subject === "house_model" ? "model" : subject;
    return t(`chrome.subjects.${key}`, subject);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const filterOptions: Array<{ value: StatusFilter; label: string }> = [
    { value: "all", label: t("admin.messages_filter_all") },
    { value: "new", label: t("admin.messages_status_new") },
    { value: "read", label: t("admin.messages_status_read") },
    { value: "archived", label: t("admin.messages_status_archived") },
  ];

  const newCount = messages.filter((m) => m.status === "new").length;

  return (
    <div data-testid="admin-messages-page">
      <PageHeader
        title={t("admin.messages")}
        description={t("admin.messages_subtitle")}
        action={
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            {newCount} {t("admin.messages_status_new")}
          </span>
        }
      />

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* List */}
        <div className="space-y-4">
          <SelectField
            label={t("admin.messages_filter_label")}
            value={filter}
            onChange={(v) => setFilter(v as StatusFilter)}
            options={filterOptions}
          />
          <AdminCard title={t("admin.messages_inbox")}>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                <Inbox className="w-8 h-8 opacity-40" />
                <p className="text-sm">{t("admin.messages_empty")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => open(m)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${
                      selectedId === m.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:border-input"
                    }`}
                    data-testid={`message-row-${m.id}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${m.status === "new" ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                        {m.name || m.email}
                      </span>
                      {m.status === "new" && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{subjectLabel(m.subject)}</div>
                    <div className="text-[11px] text-muted-foreground/70 mt-0.5">{formatDate(m.createdAt)}</div>
                  </button>
                ))}
              </div>
            )}
          </AdminCard>
        </div>

        {/* Detail */}
        <AdminCard title={t("admin.messages_detail")}>
          {!selected ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
              <Mail className="w-8 h-8 opacity-40" />
              <p className="text-sm">{t("admin.messages_selectPrompt")}</p>
            </div>
          ) : (
            <div className="space-y-4" data-testid="message-detail">
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <Field label={t("chrome.form.name")} value={selected.name || "—"} />
                <Field label={t("chrome.form.email")} value={selected.email || "—"} />
                <Field label={t("chrome.form.phone")} value={selected.phone || "—"} />
                <Field label={t("chrome.form.subject")} value={subjectLabel(selected.subject)} />
                {selected.referenceId && (
                  <Field label={t("admin.messages_reference")} value={selected.referenceId} />
                )}
                <Field label={t("admin.messages_received")} value={formatDate(selected.createdAt)} />
                <Field label={t("admin.messages_statusLabel")} value={statusLabel(selected.status)} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  {t("chrome.form.message")}
                </label>
                <p className="text-sm text-foreground whitespace-pre-wrap rounded-xl border border-border bg-background p-3 leading-relaxed">
                  {selected.message}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                {selected.status !== "read" && (
                  <ActionButton
                    icon={<MailOpen className="w-3.5 h-3.5" />}
                    label={t("admin.messages_markRead")}
                    onClick={() => updateContactMessage(selected.id, { status: "read" })}
                    testid="message-mark-read"
                  />
                )}
                {selected.status !== "new" && (
                  <ActionButton
                    icon={<Mail className="w-3.5 h-3.5" />}
                    label={t("admin.messages_markNew")}
                    onClick={() => updateContactMessage(selected.id, { status: "new" })}
                    testid="message-mark-new"
                  />
                )}
                {selected.status !== "archived" && (
                  <ActionButton
                    icon={<Archive className="w-3.5 h-3.5" />}
                    label={t("admin.messages_archive")}
                    onClick={() => updateContactMessage(selected.id, { status: "archived" })}
                    testid="message-archive"
                  />
                )}
                <ActionButton
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  label={t("admin.messages_delete")}
                  destructive
                  onClick={() => {
                    deleteContactMessage(selected.id);
                    setSelectedId(null);
                  }}
                  testid="message-delete"
                />
              </div>
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</span>
      <span className="text-sm text-foreground break-words">{value}</span>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  destructive = false,
  testid,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
  testid: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-semibold transition-colors ${
        destructive
          ? "text-muted-foreground hover:text-destructive hover:border-destructive/40"
          : "text-muted-foreground hover:text-foreground hover:border-input"
      }`}
      data-testid={testid}
    >
      {icon}
      {label}
    </button>
  );
}
