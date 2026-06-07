import { useEffect, lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteDataProvider } from "@/contexts/SiteDataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Layout } from "@/components/layout/Layout";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import Lots from "@/pages/Lots";
import Providers from "@/pages/Providers";
import Contact from "@/pages/Contact";
import Financiamiento from "@/pages/Financiamiento";
import { ADMIN_ENABLED } from "@/lib/admin-enabled";

const queryClient = new QueryClient();

/**
 * The admin panel is loaded via a DYNAMIC import GATED by the build-time
 * constant. In a production build `ADMIN_ENABLED` folds to the literal `false`,
 * so this ternary collapses to `null` — the `import("…/AdminRouter")` call is
 * removed entirely, the whole admin graph (shell, manifest, content store,
 * admin-ui store, media picker) is never reachable, and Rollup emits NO admin
 * chunk. In dev (`ADMIN_ENABLED === true`) it is a normal lazy-loaded route. */
const AdminRouter = ADMIN_ENABLED
  ? lazy(() =>
      import("@/pages/admin/AdminRouter").then((m) => ({
        default: m.AdminRouter,
      })),
    )
  : null;

/** Reset scroll to the top whenever the route changes. */
function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);
  return null;
}

/** Public site wrapped in the marketing Layout (navbar, marble bg, footer). */
function PublicRouter() {
  return (
    <Layout>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/catalog" component={Catalog} />
        <Route path="/lots" component={Lots} />
        <Route path="/providers" component={Providers} />
        <Route path="/contact" component={Contact} />
        <Route path="/financiamiento" component={Financiamiento} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Dev-only admin panel — its own full-screen shell, OUTSIDE the public
          Layout. Registered only under the build-time gate, so a production
          build (gate === false) does not register it and Rollup tree-shakes the
          whole panel + AdminRouter import out of the bundle. */}
      {ADMIN_ENABLED && AdminRouter && (
        <Route path="/admin/:rest*">
          <Suspense fallback={null}>
            <AdminRouter />
          </Suspense>
        </Route>
      )}
      <Route component={PublicRouter} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <SiteDataProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </SiteDataProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
