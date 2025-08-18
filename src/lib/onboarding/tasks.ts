import { useMemo } from 'react';
import { useModelValidations } from '@/lib/validation/useModelValidations';
import { useEngine } from '@/lib/engine/EngineContext';

export type TaskId =
  | 'set_start_date'
  | 'set_periods'
  | 'add_unit_type'
  | 'add_cost_item';

export type TaskStatus = 'blocked' | 'recommended' | 'done';

export type Task = {
  id: TaskId;
  title: string;
  detail?: string;
  status: TaskStatus;
  link: { tab: 'inputs' | 'preview' | 'results'; section?: string };
};

export function useOnboardingTasks(): { tasks: Task[]; hasBlocking: boolean } {
  const { inputs } = useEngine();
  const { issues, hasBlocking } = useModelValidations(inputs);

  const tasks = useMemo<Task[]>(() => {
    let t: Task[] = [
      {
        id: 'set_start_date',
        title: 'Set project start date',
        link: { tab: 'inputs', section: 'project' },
        status: 'done',
      },
      {
        id: 'set_periods',
        title: 'Set project periods',
        link: { tab: 'inputs', section: 'project' },
        status: 'done',
      },
      {
        id: 'add_unit_type',
        title: 'Add your first unit type',
        link: { tab: 'inputs', section: 'units' },
        status: 'done',
      },
      {
        id: 'add_cost_item',
        title: 'Add your first cost item',
        link: { tab: 'inputs', section: 'costs' },
        status: 'done',
      },
    ];

    for (const i of issues) {
      const err = i.level === 'error' ? 'blocked' : 'recommended';
      if (i.message.includes('start date'))
        t = t.map(x => (x.id === 'set_start_date' ? { ...x, status: err } : x));
      if (i.message.includes('Project periods'))
        t = t.map(x => (x.id === 'set_periods' ? { ...x, status: err } : x));
      if (i.message.includes('No unit types'))
        t = t.map(x => (x.id === 'add_unit_type' ? { ...x, status: err } : x));
      if (i.message.includes('No cost items'))
        t = t.map(x => (x.id === 'add_cost_item' ? { ...x, status: err } : x));
    }
    return t;
  }, [issues]);

  return { tasks, hasBlocking };
}