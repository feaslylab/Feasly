import { useMemo } from 'react';

type Issue = { level: 'error' | 'warn'; message: string };
type Validations = { issues: Issue[]; hasBlocking: boolean };

export function useModelValidations(inputs: any): Validations {
  // Gentle heuristics; no engine mutation.
  const issues = useMemo<Issue[]>(() => {
    const list: Issue[] = [];

    const start = inputs?.project?.start_date;
    const periods = Number(inputs?.project?.periods ?? 0);
    if (!start) list.push({ level: 'error', message: 'Project start date is missing.' });
    if (!Number.isFinite(periods) || periods <= 0)
      list.push({ level: 'error', message: 'Project periods must be a positive number.' });

    const unitTypes = inputs?.unit_types ?? [];
    const costs = inputs?.cost_items ?? [];
    if (!Array.isArray(unitTypes) || unitTypes.length === 0)
      list.push({ level: 'warn', message: 'No unit types configured yet.' });
    if (!Array.isArray(costs) || costs.length === 0)
      list.push({ level: 'warn', message: 'No cost items configured yet.' });

    return list;
  }, [inputs]);

  const hasBlocking = issues.some(i => i.level === 'error');

  return { issues, hasBlocking };
}