import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";

import { OrganizationProvider } from "@/contexts/OrganizationContext";
import Header from "@/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

const Index = lazy(() => import("./pages/Index"));
const NewProject = lazy(() => import("./pages/NewProject"));
const Projects = lazy(() => import("./pages/Projects"));
const DemoPage = lazy(() => import("./pages/DemoPage"));
const DemoProject = lazy(() => import("./pages/DemoProject"));
const Auth = lazy(() => import("./pages/Auth").then(m => ({ default: (m as any).default ?? (m as any).AuthPage })));
const FeaslyModel = lazy(() => import("./components/FeaslyModel/FeaslyModel"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      
        <OrganizationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
              <div className="min-h-screen bg-background">
                <Sidebar />
                <div className="flex flex-col min-w-0 min-h-screen sidebar-auto-space">
                  <Header />
                  <main className="pt-14">
                    <Suspense fallback={<div>Loading...</div>}>
                      <Routes>
                        <Route path="/" element={<Navigate to="/projects" replace />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/projects/new" element={<NewProject />} />
                        <Route path="/feasly-model/:projectId/:scenarioId" element={<FeaslyModel />} />
                        <Route path="/demo" element={<DemoPage />} />
                        <Route path="/demo-project" element={<DemoProject />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/welcome" element={<Index />} />
                      </Routes>
                    </Suspense>
                  </main>
                </div>
              </div>
          </TooltipProvider>
        </OrganizationProvider>
      
    </QueryClientProvider>
  );
};

export default App;
