import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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

const queryClient = new QueryClient();

// NOTE: The admin CMS lives in a SEPARATE app/repo (chepelcr/V-E-admin) and is
// intentionally NOT part of this public site. This bundle ships zero admin code.

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <PublicRouter />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
