import { useEffect, useMemo, useState } from 'react';
import { useEngine } from '@/lib/engine/EngineContext';
import { Button } from '@/components/ui/button';

function isEmptyProject(inputs: any) {
  const start = inputs?.project?.start_date;
  const periods = Number(inputs?.project?.periods ?? 0);
  const unitTypes = inputs?.unit_types ?? [];
  const costs = inputs?.cost_items ?? [];
  
  if (!start || !Number.isFinite(periods) || periods <= 0) return true;
  if ((unitTypes?.length ?? 0) === 0 && (costs?.length ?? 0) === 0) return true;
  return false;
}

export function FirstRunOverlay({
  projectId,
  onOpenChecklist,
}: {
  projectId: string | null;
  onOpenChecklist: () => void;
}) {
  const { inputs } = useEngine();
  const [open, setOpen] = useState(false);
  const key = projectId ? `firstrun:${projectId}` : null;

  const shouldShow = useMemo(() => isEmptyProject(inputs), [inputs]);

  useEffect(() => {
    if (!key || !shouldShow) return;
    const dismissed = localStorage.getItem(key) === 'dismissed';
    setOpen(!dismissed);
  }, [key, shouldShow]);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4">
      <div className="mx-auto max-w-5xl rounded-lg border bg-background/95 backdrop-blur p-4 shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-medium">Quick start</div>
            <p className="text-sm text-muted-foreground">
              Set a start date, periods, and add one unit type or cost item to get a first run.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                onOpenChecklist();
                setOpen(false);
                console.log(`[Analytics] onboarding_open`, { source: 'overlay' });
              }}
              size="sm"
            >
              Open checklist
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (key) localStorage.setItem(key, 'dismissed');
                setOpen(false);
                console.log(`[Analytics] onboarding_overlay_dismiss`);
              }}
            >
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}