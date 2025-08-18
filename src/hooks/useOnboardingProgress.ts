import { useMemo } from 'react';

export function useOnboardingProgress(projectId: string | null) {
  const key = projectId ? `onboard:${projectId}` : null;

  const load = (): Record<string, 'dismissed'> => {
    if (!key) return {};
    try {
      return JSON.parse(localStorage.getItem(key) || '{}');
    } catch {
      return {};
    }
  };

  const state = useMemo(load, [key]);

  const save = (map: Record<string, 'dismissed'>) => {
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(map));
    } catch {}
  };

  const dismiss = (taskId: string) => save({ ...state, [taskId]: 'dismissed' });
  const isDismissed = (taskId: string) => state[taskId] === 'dismissed';

  return { isDismissed, dismiss };
}