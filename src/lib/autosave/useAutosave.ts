import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function stableStringify(obj: any): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

export function useAutosave<T>(projectId: string | null, scenarioId: string | null, payload: T, delayMs = 800) {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const prevHashRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const canSave = !!(projectId && scenarioId);
  const storageKey = canSave ? `inputs:${projectId}:${scenarioId}` : null;
  
  const draft = useMemo(() => {
    return { v: 1, savedAt: Date.now(), data: payload };
  }, [payload]);

  const draftHash = useMemo(() => stableStringify(draft), [draft]);

  const forceSave = useCallback(() => {
    if (!canSave || !storageKey) return;
    try {
      setStatus('saving');
      localStorage.setItem(storageKey, JSON.stringify(payload));
      prevHashRef.current = draftHash;
      setSavedAt(Date.now());
      setStatus('saved');
    } catch (e) {
      console.error('[Autosave] error', e);
      // Track autosave errors
      console.log('[Analytics] autosave_error', { error: e });
      setStatus('error');
    }
  }, [canSave, storageKey, payload, draftHash]);

  useEffect(() => {
    if (!canSave) return;
    // skip if unchanged
    if (prevHashRef.current === draftHash) return;

    // debounce
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      forceSave();
    }, delayMs) as unknown as number;

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [canSave, draftHash, delayMs, forceSave]);

  // load last saved (just for status on mount)
  useEffect(() => {
    if (!canSave || !storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        prevHashRef.current = stableStringify({ v: 1, savedAt: Date.now(), data: JSON.parse(raw) });
        setSavedAt(Date.now());
        setStatus('saved');
      }
    } catch {
      // ignore
    }
  }, [canSave, storageKey]);

  return { status, savedAt, forceSave };
}
