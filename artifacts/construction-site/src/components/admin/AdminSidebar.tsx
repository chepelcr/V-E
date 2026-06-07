import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, ChevronDown, X, Home as HomeIcon } from "lucide-react";
import { guardNavigation } from "@/lib/admin-ui";
import { useT } from "@/lib/admin-i18n";
import { getBranding } from "@/repositories/branding.repository";
import {
  DASHBOARD_ENTRY,
  GROUP_ORDER,
  GROUP_LABELS,
  entriesForGroup,
  type AdminEntry,
  type AdminGroup,
} from "@/lib/admin-manifest";
import { Hint } from "./Hint";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

function isActive(location: string, route: string): boolean {
  return location === route || location.startsWith(route + "/");
}

function activeGroup(location: string): AdminGroup {
  for (const g of GROUP_ORDER) {
    if (entriesForGroup(g).some((e) => isActive(location, e.route))) return g;
  }
  return GROUP_ORDER[0];
}

/**
 * Grouped, collapsible (w-16 ↔ w-64) admin sidebar generated from the
 * completeness manifest. BUTTON-based nav (not wouter `<Link>`) so every jump
 * runs the unsaved-changes `guardNavigation` AND lets the collapsed-state Radix
 * `Hint` tooltips fire. Single-open accordion; the active group auto-opens.
 * Unbuilt manifest entries render as disabled stubs ("coming soon").
 */
export function AdminSidebar({ collapsed, onToggle, onClose }: Props) {
  const { t, language } = useT();
  const [location, navigate] = useLocation();
  const [openGroup, setOpenGroup] = useState<AdminGroup>(() => activeGroup(location));
  const branding = getBranding();

  // Keep the active group open as the route changes.
  useEffect(() => {
    setOpenGroup(activeGroup(location));
  }, [location]);

  const go = (entry: AdminEntry) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (!entry.available) return;
    if (guardNavigation(entry.route)) return;
    onClose?.();
    navigate(entry.route);
  };

  const goHref = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (guardNavigation(href)) return;
    onClose?.();
    navigate(href);
  };

  const selectedCls = "bg-sidebar-primary text-sidebar-primary-foreground";

  const renderItem = (entry: AdminEntry) => {
    const active = isActive(location, entry.route);
    const Icon = entry.icon;
    const label = entry.label[language];
    return (
      <Hint key={entry.key} label={label} disabled={!collapsed}>
        <button
          type="button"
          onClick={go(entry)}
          disabled={!entry.available}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
            active
              ? selectedCls
              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          } ${collapsed ? "justify-center" : ""} ${
            !entry.available ? "opacity-40 cursor-not-allowed" : ""
          }`}
          data-testid={`sidebar-link-${entry.key}`}
          title={!collapsed && !entry.available ? t("admin.comingSoon") : undefined}
        >
          <Icon className={`flex-shrink-0 ${collapsed ? "w-5 h-5" : "w-4 h-4"}`} />
          {!collapsed && <span className="truncate">{label}</span>}
        </button>
      </Hint>
    );
  };

  return (
    <aside
      className={`relative h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
      data-testid="admin-sidebar"
    >
      {/* Edge collapse/expand tab (desktop) — floats on the right border */}
      <button
        onClick={onToggle}
        className="hidden lg:flex absolute -right-3 top-16 z-20 w-6 h-6 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground shadow-md ring-2 ring-background hover:bg-sidebar-primary/90 transition-colors"
        data-testid="sidebar-edge-toggle"
        title={collapsed ? t("admin.expand") : t("admin.collapse")}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Logo row */}
      <div
        className={`flex items-center h-14 border-b border-sidebar-border px-4 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-serif text-base font-semibold text-sidebar-foreground tracking-widest">
            {branding.wordmark}
          </span>
          {!collapsed && (
            <span className="text-sidebar-foreground/70 text-sm truncate">{branding.companyName}</span>
          )}
        </div>
        {onClose && !collapsed && (
          <button
            onClick={onClose}
            className="lg:hidden text-sidebar-foreground/40 hover:text-sidebar-foreground p-1 rounded transition-colors"
            aria-label={t("chrome.a11y.closeMenu")}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {/* Dashboard — above the groups */}
        {renderItem(DASHBOARD_ENTRY)}

        {GROUP_ORDER.map((group) => {
          const entries = entriesForGroup(group);
          if (entries.length === 0) return null;
          const isOpen = collapsed || openGroup === group;
          const hasActive = entries.some((e) => isActive(location, e.route));
          return (
            <div key={group}>
              {!collapsed && (
                <button
                  onClick={() => setOpenGroup((prev) => (prev === group ? ("" as AdminGroup) : group))}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg mb-0.5 mt-2 transition-colors ${
                    hasActive && !isOpen
                      ? "text-sidebar-foreground/60"
                      : "text-sidebar-foreground/40 hover:text-sidebar-foreground/60"
                  }`}
                  data-testid={`sidebar-group-${group}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {GROUP_LABELS[group][language]}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`}
                  />
                </button>
              )}
              <div
                className={`grid transition-all duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="space-y-0.5">{entries.map(renderItem)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer: back to public site */}
      <div className={`border-t border-sidebar-border p-3 ${collapsed ? "text-center" : ""}`}>
        <button
          type="button"
          onClick={goHref("/")}
          className="w-full flex items-center gap-2 text-sidebar-foreground/50 hover:text-sidebar-foreground/80 text-xs transition-colors px-2 py-1.5 rounded-lg hover:bg-sidebar-accent"
          data-testid="sidebar-back-home"
        >
          <HomeIcon className="w-3.5 h-3.5 flex-shrink-0" />
          {!collapsed && <span>{t("admin.backHome")}</span>}
        </button>
      </div>
    </aside>
  );
}
