import { useEffect } from "react";
import Header from "@/layout/Header";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PageTransition } from "@/components/ui/page-transition";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import { BrandedPreloader } from "@/components/ui/branded-preloader";
import { useAppReady } from "@/hooks/useAppReady";
import { analytics } from "./lib/analytics";

import { AuthPage } from "@/pages/Auth";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import NewProject from "./pages/NewProject";
import ProjectDetails from "./pages/ProjectDetails";
import ProjectView from "./pages/ProjectView";
import ProjectPublic from "./pages/ProjectPublic";
import DemoProject from "./pages/DemoProject";
import FeaslyModel from "./pages/FeaslyModel";
import CashFlowPage from "./pages/model/CashFlowPage";
import RiskPage from "./pages/model/RiskPage";
import ResultsPage from "./pages/model/ResultsPage";
import ScenarioComparison from "./pages/model/ScenarioComparison";
import FeaslyFlow from "./pages/FeaslyFlow";
import FeaslyFinance from "./pages/FeaslyFinance";
import FeaslyConsolidate from "./pages/FeaslyConsolidate";
import FeaslyInsights from "./pages/FeaslyInsights";
import FeaslyAlerts from "./pages/FeaslyAlerts";
import NotFound from "./pages/NotFound";
import MarketingWrapper from "./pages/MarketingWrapper";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import UseCasesPage from "./pages/UseCasesPage";
import DocsPage from "./pages/DocsPage";
import DemoPage from "./pages/DemoPage";
import PressPage from "./pages/PressPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import FeatureComparison from "./pages/FeatureComparison";
import CalcDemo from "./pages/CalcDemo";
import ProductPage from "./pages/ProductPage";
import NewPricingPage from "./pages/NewPricingPage";
import CompliancePage from "./pages/CompliancePage";
import ContactPage from "./pages/ContactPage";
import CareersPage from "./pages/CareersPage";
import GDPRPage from "./pages/GDPRPage";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Track page views for analytics
  useEffect(() => {
    analytics.pageView(location.pathname);
  }, [location.pathname]);
  
  if (!import.meta.env.PROD) console.log('AppRoutes render - user:', user, 'loading:', loading, 'pathname:', window.location.pathname);
  
  // Check if we're on the marketing site
  const isMarketingRoute = window.location.pathname === '/';
  
  // Check if we're on auth/welcome page - don't show Header on these pages
  const isAuthRoute = window.location.pathname === '/welcome';
  
  // If we're on the marketing site path, show marketing content
  if (isMarketingRoute || window.location.pathname.startsWith('/product') || window.location.pathname.startsWith('/pricing') || window.location.pathname.startsWith('/compliance') || window.location.pathname.startsWith('/contact') || window.location.pathname.startsWith('/features') || window.location.pathname.startsWith('/use-cases') || window.location.pathname.startsWith('/docs') || window.location.pathname.startsWith('/press') || window.location.pathname.startsWith('/privacy') || window.location.pathname.startsWith('/terms') || window.location.pathname.startsWith('/comparison') || window.location.pathname.startsWith('/careers') || window.location.pathname.startsWith('/gdpr') || window.location.pathname === '/welcome') {
    
    // If user is authenticated and on welcome page, redirect to dashboard
    if (user && window.location.pathname === '/welcome') {
      if (!import.meta.env.PROD) console.log('User authenticated on welcome page, redirecting to dashboard');
      return <Navigate to="/dashboard" replace />;
    }
    
    return (
      <PageTransition routeKey={location.pathname}>
        <Routes>
          <Route path="/" element={<MarketingWrapper />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/pricing" element={<NewPricingPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/use-cases" element={<UseCasesPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/press" element={<PressPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/comparison" element={<FeatureComparison />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/gdpr" element={<GDPRPage />} />
          <Route path="/welcome" element={<AuthPage onSuccess={() => { if (!import.meta.env.PROD) console.log('Login success, will be redirected by auth logic'); }} />} />
          {/* Development-only route for legacy calc-demo */}
          {import.meta.env.DEV && <Route path="/calc-demo" element={<CalcDemo />} />}
        </Routes>
      </PageTransition>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
      </Route>
      <Route path="/projects" element={<AppLayout />}>
        <Route index element={<Projects />} />
        <Route path="new" element={<NewProject />} />
        <Route path=":id" element={<ProjectDetails />} />
        <Route path=":id/view" element={<ProjectView />} />
      </Route>
      <Route path="/feasly-model" element={<AppLayout />}>
        <Route index element={<FeaslyModel />} />
        <Route path=":projectId/cash-flow" element={<CashFlowPage />} />
        <Route path=":projectId/:scenarioId/cash-flow" element={<CashFlowPage />} />
        <Route path=":projectId/:scenarioId/risk" element={<RiskPage />} />
        <Route path=":projectId/:scenarioId/results" element={<ResultsPage />} />
        <Route path=":projectId/:scenarioId/compare" element={<ScenarioComparison />} />
      </Route>
      <Route path="/model" element={<Navigate to="/feasly-model" replace />} />
      <Route path="/feasly-flow" element={<AppLayout />}>
        <Route index element={<FeaslyFlow />} />
      </Route>
      <Route path="/flow" element={<Navigate to="/feasly-flow" replace />} />
      <Route path="/feasly-finance" element={<AppLayout />}>
        <Route index element={<FeaslyFinance />} />
      </Route>
      <Route path="/finance" element={<Navigate to="/feasly-finance" replace />} />
      <Route path="/feasly-consolidate" element={<AppLayout />}>
        <Route index element={<FeaslyConsolidate />} />
      </Route>
      <Route path="/consolidate" element={<Navigate to="/feasly-consolidate" replace />} />
      <Route path="/feasly-insights" element={<AppLayout />}>
        <Route index element={<FeaslyInsights />} />
      </Route>
      <Route path="/insights" element={<Navigate to="/feasly-insights" replace />} />
      <Route path="/feasly-alerts" element={<AppLayout />}>
        <Route index element={<FeaslyAlerts />} />
      </Route>
      <Route path="/alerts" element={<Navigate to="/feasly-alerts" replace />} />
      <Route path="/demo" element={<DemoProject />} />
      <Route path="/projects/:id/public" element={<ProjectPublic />} />
      <Route path="/settings" element={<AppLayout />}>
        <Route index element={<div className="p-6">Settings page coming soon...</div>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  const location = useLocation();
  const isAppReady = useAppReady();
  
  // Don't show dashboard Header on marketing or auth pages
  const isMarketingRoute = location.pathname === '/' || 
    location.pathname.startsWith('/product') || 
    location.pathname.startsWith('/pricing') || 
    location.pathname.startsWith('/compliance') || 
    location.pathname.startsWith('/contact') || 
    location.pathname.startsWith('/features') || 
    location.pathname.startsWith('/use-cases') || 
    location.pathname.startsWith('/docs') || 
    location.pathname.startsWith('/press') || 
    location.pathname.startsWith('/privacy') || 
    location.pathname.startsWith('/terms') || 
    location.pathname.startsWith('/comparison') || 
    location.pathname.startsWith('/careers') || 
    location.pathname.startsWith('/gdpr') || 
    location.pathname === '/welcome';

  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <OrganizationProvider>
            <TooltipProvider>
              <AnimatePresence mode="wait">
                {!isAppReady ? (
                  <BrandedPreloader key="preloader" />
                ) : (
                  <motion.div
                    key="app"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="min-h-screen"
                  >
                    {/* Only show dashboard Header on authenticated app pages */}
                    {!isMarketingRoute && <Header />}
                    <AppRoutes />
                  </motion.div>
                )}
              </AnimatePresence>
              <Toaster />
              <Sonner />
              <PerformanceMonitor />
            </TooltipProvider>
          </OrganizationProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
