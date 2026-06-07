import { Route, Switch, Redirect } from "wouter";
import { ADMIN_ENABLED } from "@/lib/admin-enabled";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DashboardPage } from "./DashboardPage";
import { HomePage } from "./HomePage";
import { CatalogPage } from "./CatalogPage";
import { LotsPage } from "./LotsPage";
import { ProvidersPage } from "./ProvidersPage";
import { ContactContentPage } from "./ContactContentPage";
import { FinanciamientoPage } from "./FinanciamientoPage";
import { NotFoundPage } from "./NotFoundPage";
import { MessagesPage } from "./MessagesPage";
import { BrandingPage } from "./BrandingPage";
import { ContactInfoPage } from "./ContactInfoPage";
import { MediaPage } from "./MediaPage";
import { SeoPage } from "./SeoPage";
import { NavigationPage } from "./NavigationPage";
import { ContentVersionsPage } from "./ContentVersionsPage";
import { TranslationsPage } from "./TranslationsPage";
import { ContentExplorerPage } from "./ContentExplorerPage";
import { InventoryPage } from "./InventoryPage";
import { DiagnosticsPage } from "./DiagnosticsPage";

/**
 * Gated admin router. Folds to a `<Redirect>` when ADMIN_ENABLED is false
 * (defense in depth — App.tsx already only registers this route under the
 * gate). Every manifest entry now has a real page (Phase 8 swapped the last
 * tooling stubs — Translations, Content Explorer, Inventory, Diagnostics — for
 * their real implementations). `/admin` → dashboard; renamed paths
 * (`/admin/branding`, `/admin/themes`) redirect to `/admin/identity`.
 */
export function AdminRouter() {
  if (!ADMIN_ENABLED) {
    return <Redirect to="/" />;
  }
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={() => <Redirect to="/admin/dashboard" />} />
        <Route path="/admin/dashboard" component={DashboardPage} />

        {/* Content */}
        <Route path="/admin/home" component={HomePage} />
        <Route path="/admin/catalog" component={CatalogPage} />
        <Route path="/admin/lots" component={LotsPage} />
        <Route path="/admin/providers" component={ProvidersPage} />
        <Route path="/admin/financiamiento" component={FinanciamientoPage} />
        <Route path="/admin/contact-content" component={ContactContentPage} />
        <Route path="/admin/not-found" component={NotFoundPage} />
        <Route path="/admin/messages" component={MessagesPage} />

        {/* CMS */}
        <Route path="/admin/identity" component={BrandingPage} />
        <Route path="/admin/branding" component={() => <Redirect to="/admin/identity" />} />
        <Route path="/admin/themes" component={() => <Redirect to="/admin/identity" />} />
        <Route path="/admin/contact-info" component={ContactInfoPage} />
        <Route path="/admin/media" component={MediaPage} />
        <Route path="/admin/seo" component={SeoPage} />
        <Route path="/admin/navigation" component={NavigationPage} />
        <Route path="/admin/translations" component={TranslationsPage} />
        <Route path="/admin/content-versions" component={ContentVersionsPage} />

        {/* Platform */}
        <Route path="/admin/content-explorer" component={ContentExplorerPage} />
        <Route path="/admin/inventory" component={InventoryPage} />
        <Route path="/admin/diagnostics" component={DiagnosticsPage} />

        {/* Unknown admin path → dashboard */}
        <Route component={() => <Redirect to="/admin/dashboard" />} />
      </Switch>
    </AdminLayout>
  );
}
