import { useLocation } from "wouter";
import { Home as HomeIcon, Image, Search, Navigation as NavIcon, Mail, Brush } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAdminStore } from "@/lib/admin-store";
import { useT } from "@/lib/admin-i18n";
import { guardNavigation } from "@/lib/admin-ui";

export function DashboardPage() {
  const { t } = useT();
  const store = useAdminStore();
  const [, navigate] = useLocation();

  const go = (href: string) => () => {
    if (guardNavigation(href)) return;
    navigate(href);
  };

  const stats = [
    { href: "/admin/home", label: t("admin.home"), value: 1, sub: "home.json", icon: HomeIcon },
    { href: "/admin/identity", label: t("admin.identity"), value: store.themes.length, sub: "branding.json + themes.json", icon: Brush },
    { href: "/admin/contact-info", label: t("admin.contact-info", t("admin.contactContent")), value: store.contact.phones.length, sub: "contact.json", icon: Mail },
    { href: "/admin/media", label: t("admin.media"), value: store.media.items.length, sub: "media.json", icon: Image },
    { href: "/admin/seo", label: t("admin.seo"), value: Object.keys(store.seo.pages).length, sub: "seo.json", icon: Search },
    { href: "/admin/navigation", label: t("admin.navigation"), value: store.navigation.items.length, sub: "navigation.json", icon: NavIcon },
  ];

  const newMessages = store.contactMessages.filter((m) => m.status === "new");

  return (
    <div data-testid="dashboard-page">
      <PageHeader title={t("admin.dashboard")} description={t("admin.dashboardSubtitle")} />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <button
            key={s.href}
            onClick={go(s.href)}
            className="block text-left bg-card rounded-2xl border border-border p-5 hover:shadow-md hover:border-input transition-all"
            data-testid={`stat-card-${s.href.split("/").pop()}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-3xl font-bold text-foreground">{s.value}</span>
            </div>
            <div className="text-sm font-medium text-foreground">{s.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-mono">{s.sub}</div>
          </button>
        ))}
      </div>

      {newMessages.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">{newMessages.length}</h2>
          </div>
          <div className="space-y-3">
            {newMessages.slice(0, 5).map((msg) => (
              <div key={msg.id} className="flex items-start gap-3 p-3 rounded-xl bg-background border border-border">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{msg.name}</div>
                  <div className="text-xs text-muted-foreground">{msg.email}</div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">{msg.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
