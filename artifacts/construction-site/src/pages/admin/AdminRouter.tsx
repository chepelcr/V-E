import { Route, Switch, Redirect } from "wouter";
import { ADMIN_ENABLED } from "@/lib/admin-enabled";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DashboardPage } from "./DashboardPage";
import { HomePage } from "./HomePage";
import { BrandingPage } from "./BrandingPage";
import { ContactInfoPage } from "./ContactInfoPage";
import { MediaPage } from "./MediaPage";
import { SeoPage } from "./SeoPage";
import { NavigationPage } from "./NavigationPage";
import { ContentVersionsPage } from "./ContentVersionsPage";
import { StubPage } from "./StubPage";

/**
 * Gated admin router. Folds to a `<Redirect>` when ADMIN_ENABLED is false
 * (defense in depth — App.tsx already only registers this route under the
 * gate). Built Phase-1a pages get a real route; later-phase entries route to a
 * StubPage so the sidebar never dangles. `/admin` → dashboard; renamed paths
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
        <Route path="/admin/catalog" component={() => <StubPage titleKey="admin.catalog" />} />
        <Route path="/admin/lots" component={() => <StubPage titleKey="admin.lots" />} />
        <Route path="/admin/providers" component={() => <StubPage titleKey="admin.providers" />} />
        <Route path="/admin/financiamiento" component={() => <StubPage titleKey="admin.financiamiento" />} />
        <Route path="/admin/contact-content" component={() => <StubPage titleKey="admin.contactContent" />} />
        <Route path="/admin/not-found" component={() => <StubPage titleKey="admin.notFound" />} />
        <Route path="/admin/messages" component={() => <StubPage titleKey="admin.messages" />} />

        {/* CMS */}
        <Route path="/admin/identity" component={BrandingPage} />
        <Route path="/admin/branding" component={() => <Redirect to="/admin/identity" />} />
        <Route path="/admin/themes" component={() => <Redirect to="/admin/identity" />} />
        <Route path="/admin/contact-info" component={ContactInfoPage} />
        <Route path="/admin/media" component={MediaPage} />
        <Route path="/admin/seo" component={SeoPage} />
        <Route path="/admin/navigation" component={NavigationPage} />
        <Route path="/admin/translations" component={() => <StubPage titleKey="admin.translations" />} />
        <Route path="/admin/content-versions" component={ContentVersionsPage} />

        {/* Platform */}
        <Route path="/admin/content-explorer" component={() => <StubPage titleKey="admin.contentExplorer" />} />
        <Route path="/admin/inventory" component={() => <StubPage titleKey="admin.inventory" />} />
        <Route path="/admin/diagnostics" component={() => <StubPage titleKey="admin.diagnostics" />} />

        {/* Unknown admin path → dashboard */}
        <Route component={() => <Redirect to="/admin/dashboard" />} />
      </Switch>
    </AdminLayout>
  );
}
