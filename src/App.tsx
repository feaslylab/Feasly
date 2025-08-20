import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";

import { OrganizationProvider } from "@/contexts/OrganizationContext";
import RequireAuth from "@/routes/RequireAuth";
import PrivateLayout from "@/layouts/PrivateLayout";
import AuthLayout from "@/layouts/AuthLayout";
import LandingRedirect from "@/routes/LandingRedirect";
import { PATHS } from "@/routes/paths";

const Index = lazy(() => import("./pages/Index"));
const NewProject = lazy(() => import("./pages/NewProject"));
const Projects = lazy(() => import("./pages/Projects"));
const DemoPage = lazy(() => import("./pages/DemoPage"));
const Auth = lazy(() => import("./pages/Auth").then(m => ({ default: (m as any).default ?? (m as any).AuthPage })));
const FeaslyModel = lazy(() => import("./components/FeaslyModel/FeaslyModel"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ModelPage = lazy(() => import("./pages/ModelPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const FeaslyLanding = lazy(() => import("./pages/marketing/FeaslyLanding"));

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <OrganizationProvider>
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

              {/* Marketing routes */}
              <Route path="/" element={<FeaslyLanding />} />
              <Route path={PATHS.welcome} element={<Index />} />
              
              {/* Private routes */}
              <Route element={<RequireAuth><PrivateLayout /></RequireAuth>}>
                <Route index element={<LandingRedirect />} />
                <Route path={PATHS.dashboard} element={<Dashboard />} />
                {/* Case-insensitive alias for dashboard */}
                <Route path="/Dashboard" element={<Navigate to={PATHS.dashboard} replace />} />
                <Route path={PATHS.projects} element={<Projects />} />
                <Route path={PATHS.projectsNew} element={<NewProject />} />
                <Route path={PATHS.portfolio} element={<Portfolio />} />
                <Route path={PATHS.model} element={<ModelPage />} />
                {/* Legacy route with params - redirect to new format */}
                <Route path="/feasly-model/:projectId/:scenarioId" element={<Navigate to={`${PATHS.model}?project=$1&scenario=$2`} replace />} />
                <Route path={PATHS.demo} element={<DemoPage />} />
                
                {/* 404 within private scope */}
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Global 404 fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </OrganizationProvider>
    </QueryClientProvider>
  );
};

export default App;
