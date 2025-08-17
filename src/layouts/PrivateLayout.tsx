import { Suspense, useMemo, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { EngineProvider } from '@/lib/engine/EngineContext';
import Header from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

function useCanonicalPath() {
  const loc = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Strip trailing slashes (except root) and lowercase path
    const path = loc.pathname;
    const normalized = (path === '/' ? '/' : path.replace(/\/+$/, '')) || '/';
    const lower = normalized.toLowerCase();
    
    if (lower !== path) {
      navigate(lower + loc.search + loc.hash, { replace: true });
    }
  }, [loc.pathname, loc.search, loc.hash, navigate]);
}

function createDefaultProjectInputs() {
  return {
    project: { 
      start_date: new Date().toISOString().slice(0, 10), 
      periods: 60,
      periodicity: 'monthly' 
    },
    unit_types: [],
    cost_items: [],
    debt: [],
    equity: { 
      enabled: true, 
      call_order: 'pro_rata_commitment', 
      distribution_frequency: 'monthly', 
      classes: [], 
      investors: [] 
    },
  };
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

export default function PrivateLayout() {
  useCanonicalPath();
  const defaultInputs = useMemo(createDefaultProjectInputs, []);

  return (
    <EngineProvider formState={defaultInputs}>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="flex flex-col min-w-0 min-h-screen sidebar-auto-space">
          <Header />
          <main className="pt-14 flex-1">
            <Suspense fallback={<LoadingFallback />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </EngineProvider>
  );
}