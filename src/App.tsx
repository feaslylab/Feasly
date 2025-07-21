import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthPage } from "@/pages/Auth";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import ProjectDetails from "./pages/ProjectDetails";
import ProjectView from "./pages/ProjectView";
import ProjectPublic from "./pages/ProjectPublic";
import DemoProject from "./pages/DemoProject";
import FeaslyModel from "./pages/FeaslyModel";
import FeaslyFlow from "./pages/FeaslyFlow";
import FeaslyFinance from "./pages/FeaslyFinance";
import FeaslyConsolidate from "./pages/FeaslyConsolidate";
import FeaslyInsights from "./pages/FeaslyInsights";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onSuccess={() => window.location.reload()} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
      </Route>
      <Route path="/projects" element={<AppLayout />}>
        <Route index element={<div className="p-6">Projects page coming soon...</div>} />
        <Route path="new" element={<NewProject />} />
        <Route path=":id" element={<ProjectDetails />} />
        <Route path=":id/view" element={<ProjectView />} />
      </Route>
      <Route path="/model" element={<AppLayout />}>
        <Route index element={<FeaslyModel />} />
      </Route>
      <Route path="/flow" element={<AppLayout />}>
        <Route index element={<FeaslyFlow />} />
      </Route>
      <Route path="/finance" element={<AppLayout />}>
        <Route index element={<FeaslyFinance />} />
      </Route>
      <Route path="/consolidate" element={<AppLayout />}>
        <Route index element={<FeaslyConsolidate />} />
      </Route>
      <Route path="/insights" element={<AppLayout />}>
        <Route index element={<FeaslyInsights />} />
      </Route>
      <Route path="/demo" element={<DemoProject />} />
      <Route path="/projects/:id/public" element={<ProjectPublic />} />
      <Route path="/settings" element={<AppLayout />}>
        <Route index element={<div className="p-6">Settings page coming soon...</div>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
