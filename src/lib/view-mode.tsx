import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ViewMode = 'lite' | 'standard' | 'giga';
type Ctx = { mode: ViewMode; setMode: (m: ViewMode) => void };

const ViewModeContext = createContext<Ctx | undefined>(undefined);
const KEY = 'feasly:view-mode';

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ViewMode>('standard');

  useEffect(() => {
    const saved = localStorage.getItem(KEY) as ViewMode | null;
    if (saved === 'lite' || saved === 'standard' || saved === 'giga') setMode(saved);
  }, []);

  const value = useMemo<Ctx>(() => ({
    mode,
    setMode: (m) => { setMode(m); localStorage.setItem(KEY, m); },
  }), [mode]);

  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
}

export function useViewMode() {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error('useViewMode must be used within ViewModeProvider');
  return ctx;
}