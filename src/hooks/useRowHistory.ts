import { useCallback, useMemo } from 'react';

interface HistoryEntry {
  id: string;          // uuid()
  rowId: string;
  field: string | null; // null = system event
  before: any;
  after: any;
  user: string;        // later swap for auth user
  ts: number;          // Date.now()
  type: 'edit' | 'add' | 'delete' | 'duplicate' | 'undo' | 'redo';
}

const KEY_PREFIX = 'feasly.history';

export function useRowHistory(modelId: string, rowId: string) {
  const storageKey = `${KEY_PREFIX}.${modelId}`;

  const allHistory: HistoryEntry[] = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch {
      return [];
    }
  }, [storageKey]);

  const rowHistory = allHistory.filter(h => h.rowId === rowId).slice(-5).reverse(); // last 5

  const add = useCallback(
    (entry: Omit<HistoryEntry, 'id' | 'ts' | 'rowId'>) => {
      const withMeta: HistoryEntry = {
        ...entry,
        id: crypto.randomUUID(),
        ts: Date.now(),
        rowId,
      };
      const next = [...allHistory, withMeta].slice(-500); // cap
      localStorage.setItem(storageKey, JSON.stringify(next));
    },
    [allHistory, rowId, storageKey]
  );

  const clearRow = useCallback(() => {
    const next = allHistory.filter(h => h.rowId !== rowId);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }, [allHistory, rowId, storageKey]);

  return { history: rowHistory, add, clearRow };
}