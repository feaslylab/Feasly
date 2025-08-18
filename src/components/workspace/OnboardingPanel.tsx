import { useSearchParams } from 'react-router-dom';
import { useOnboardingTasks } from '@/lib/onboarding/tasks';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { Badge } from '@/components/ui/badge';

export function OnboardingPanel({ projectId }: { projectId: string | null }) {
  const { tasks } = useOnboardingTasks();
  const { isDismissed, dismiss } = useOnboardingProgress(projectId);
  const [params, setParams] = useSearchParams();

  const go = (tab: string, section?: string) => {
    const p = new URLSearchParams(params);
    p.set('tab', tab);
    if (section) p.set('section', section);
    setParams(p, { replace: true });
    
    // Track event
    console.log(`[Analytics] onboarding_fix_click`, { taskId: section });
  };

  const blocked = tasks.filter(t => t.status === 'blocked' && !isDismissed(t.id));
  const rec = tasks.filter(t => t.status === 'recommended' && !isDismissed(t.id));

  return (
    <aside className="w-full lg:w-80 shrink-0 lg:border-l lg:pl-6">
      <div className="sticky top-20 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Getting started</h3>
          <Badge variant={blocked.length ? 'destructive' : 'secondary'}>
            {blocked.length ? `${blocked.length} required` : 'All set'}
          </Badge>
        </div>

        {blocked.length === 0 && rec.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You can run the model anytime. Use Recommended items to improve fidelity.
          </p>
        ) : (
          <>
            {blocked.length > 0 && (
              <Section title="Required" items={blocked} go={go} dismiss={dismiss} />
            )}
            {rec.length > 0 && (
              <Section title="Recommended" items={rec} go={go} dismiss={dismiss} />
            )}
          </>
        )}
      </div>
    </aside>
  );
}

function Section({
  title,
  items,
  go,
  dismiss,
}: {
  title: string;
  items: { id: string; title: string; link: { tab: string; section?: string } }[];
  go: (tab: string, section?: string) => void;
  dismiss: (id: string) => void;
}) {
  return (
    <div>
      <div className="text-xs uppercase text-muted-foreground mb-2">{title}</div>
      <ul className="space-y-2">
        {items.map(i => (
          <li key={i.id} className="flex items-center justify-between gap-2 rounded-md border p-2">
            <span className="text-sm">{i.title}</span>
            <div className="flex items-center gap-2">
              <button
                className="text-xs underline text-primary hover:no-underline"
                onClick={() => go(i.link.tab, i.link.section)}
              >
                Fix
              </button>
              <button
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  dismiss(i.id);
                  console.log(`[Analytics] onboarding_dismiss`, { taskId: i.id });
                }}
              >
                Dismiss
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}