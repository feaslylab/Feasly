import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";

import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { LanguageProvider } from '@/contexts/LanguageContext';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { DensityProvider } from '@/hooks/useDensity';
import RequireAuth from "@/routes/RequireAuth";
import PrivateRoute from "@/components/auth/PrivateRoute";
import PrivateLayout from "@/layouts/PrivateLayout";
import AuthLayout from "@/layouts/AuthLayout";
import AppShell from "@/layouts/AppShell";
import LandingRedirect from "@/routes/LandingRedirect";
import { PATHS } from "@/routes/paths";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const NewProject = lazy(() => import("./pages/NewProject"));
const Projects = lazy(() => import("./pages/Projects"));
const DemoModelPage = lazy(() => import("./pages/DemoModelPage"));
const SharePage = lazy(() => import("./pages/SharePage"));
const Auth = lazy(() => import("./pages/Auth").then(m => ({ default: (m as any).default ?? (m as any).AuthPage })));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ModelPage = lazy(() => import("./pages/ModelPage"));
const ReportPage = lazy(() => import("./pages/ReportPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  // Check feature flags for conditional route rendering
  const showMarketing = import.meta.env.VITE_FEATURE_MARKETING === 'true';

  return (
    <QueryClientProvider client={queryClient}>
      <OrganizationProvider>
        <LocaleProvider>
          <DensityProvider>
            <LanguageProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                  <Routes>
                    {/* Public routes */}
                    <Route element={<AuthLayout />}>
                      <Route path={PATHS.auth} element={<Auth />} />
                      <Route path={PATHS.resetPassword} element={<ResetPassword />} />
                    </Route>

                    {/* Public demo and share routes */}
                    <Route path={PATHS.demo} element={<DemoModelPage />} />
                    <Route path="/share/:token" element={<SharePage />} />

                    {/* Marketing routes (conditional) */}
                    {showMarketing && (
                      <Route path={PATHS.welcome} element={<Index />} />
                    )}
                    
                    {/* Private routes */}
                    <Route element={<PrivateRoute><AppShell /></PrivateRoute>}>
                      <Route index element={<LandingRedirect />} />
                      <Route path={PATHS.dashboard} element={<Dashboard />} />
                      {/* Case-insensitive alias for dashboard */}
                      <Route path="/Dashboard" element={<Navigate to={PATHS.dashboard} replace />} />
                      <Route path={PATHS.projects} element={<Projects />} />
                      <Route path={PATHS.projectsNew} element={<NewProject />} />
                      <Route path={PATHS.model} element={<ModelPage />} />
                      <Route path={PATHS.report} element={<ReportPage />} />
                      
                      {/* Legacy route redirects */}
                      <Route path="/feasly-model/:projectId/:scenarioId" element={<Navigate to={`${PATHS.model}?project=$1&scenario=$2`} replace />} />
                      
                      {/* 404 within private scope */}
                      <Route path="*" element={<NotFound />} />
                    </Route>

                    {/* Global 404 fallback */}
                    <Route path={PATHS.notFound} element={<NotFound />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </TooltipProvider>
            </LanguageProvider>
          </DensityProvider>
        </LocaleProvider>
      </OrganizationProvider>
    </QueryClientProvider>
  );
};

export default App;