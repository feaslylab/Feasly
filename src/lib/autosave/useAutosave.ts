import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function stableStringify(obj: any): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

export function useAutosave<T>(key: string | null, payload: T, delayMs = 800) {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const prevHashRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const canSave = !!key;
  const draft = useMemo(() => {
    return { v: 1, savedAt: Date.now(), data: payload };
  }, [payload]);

  const draftHash = useMemo(() => stableStringify(draft), [draft]);

  const forceSave = useCallback(() => {
    if (!canSave) return;
    try {
      setStatus('saving');
      localStorage.setItem(`draft:${key}`, draftHash);
      prevHashRef.current = draftHash;
      setSavedAt(Date.now());
      setStatus('saved');
    } catch (e) {
      console.error('[Autosave] error', e);
      setStatus('error');
    }
  }, [canSave, key, draftHash]);

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
    if (!canSave) return;
    try {
      const raw = localStorage.getItem(`draft:${key}`);
      if (raw) {
        prevHashRef.current = raw;
        const parsed = JSON.parse(raw);
        if (parsed?.savedAt) setSavedAt(parsed.savedAt);
        setStatus('saved');
      }
    } catch {
      // ignore
    }
  }, [canSave, key]);

  return { status, savedAt, forceSave };
}
