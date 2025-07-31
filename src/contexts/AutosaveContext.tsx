import { createContext, useContext } from 'react';
import { AutosaveState } from '@/hooks/useAutosaveSync';

interface AutosaveContextValue {
  state: AutosaveState;
  setDraft: (data: any) => void;
  commit: (data: any) => Promise<void>;
  clearDraft: () => Promise<void>;
  processQueue: () => void;
}

const AutosaveContext = createContext<AutosaveContextValue | null>(null);

export function useAutosaveContext() {
  const context = useContext(AutosaveContext);
  if (!context) {
    throw new Error('useAutosaveContext must be used within AutosaveProvider');
  }
  return context;
}

export { AutosaveContext };