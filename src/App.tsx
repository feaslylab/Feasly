import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import Header from "@/layout/Header";

const Index = lazy(() => import("./pages/Index"));
const NewProject = lazy(() => import("./pages/NewProject"));
const Projects = lazy(() => import("./pages/Projects"));
const DemoPage = lazy(() => import("./pages/DemoPage"));
const DemoProject = lazy(() => import("./pages/DemoProject"));
const Auth = lazy(() => import("./pages/Auth"));
const FeaslyModel = lazy(() => import("./components/FeaslyModel/FeaslyModel"));

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrganizationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <Header />
                <main>
                  <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/projects" replace />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/projects/new" element={<NewProject />} />
                      <Route path="/feasly-model/:projectId/:scenarioId" element={<FeaslyModel />} />
                      <Route path="/demo" element={<DemoPage />} />
                      <Route path="/demo-project" element={<DemoProject />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/welcome" element={<Index />} />
                    </Routes>
                  </Suspense>
                </main>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </OrganizationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
