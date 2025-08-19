import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Save, Play, Eye, BarChart3, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

type WorkspaceTab = 'inputs' | 'preview' | 'preview_revenue' | 'results' | 'snapshots' | 'presets';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  projectName?: string;
  scenarioName?: string;
  onSaveSnapshot?: () => void;
  onRunCalculation?: () => void;
  onResetToBaseline?: () => void;
  onOpenChecklist?: () => void;
  isCalculating?: boolean;
  savedAt?: number | null;
  saveStatus?: SaveStatus;
  disableRun?: boolean;
  activeTab: WorkspaceTab;
  onTabChange: (t: WorkspaceTab) => void;
}

export default function WorkspaceLayout({
  children,
  projectName,
  scenarioName = 'baseline',
  onSaveSnapshot,
  onRunCalculation,
  onResetToBaseline,
  onOpenChecklist,
  isCalculating = false,
  savedAt,
  saveStatus = 'idle',
  disableRun = false,
  activeTab,
  onTabChange
}: WorkspaceLayoutProps) {

  const tabs = [
    { id: 'inputs' as const, label: 'Inputs' },
    { id: 'preview' as const, label: 'Preview' },
    { id: 'preview_revenue' as const, label: 'Revenue Preview' },
    { id: 'results' as const, label: 'Results' },
    { id: 'snapshots' as const, label: 'Snapshots' },
    { id: 'presets' as const, label: 'Presets' },
  ];

  const humanSaved = savedAt
    ? `Saved • ${Math.max(0, Math.floor((Date.now() - savedAt) / 1000))}s ago`
    : saveStatus === 'saving'
    ? 'Saving…'
    : saveStatus === 'error'
    ? 'Save error'
    : '—';

  const saveClass =
    saveStatus === 'saving'
      ? 'text-muted-foreground'
      : saveStatus === 'error'
      ? 'text-red-600'
      : 'text-muted-foreground';

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {projectName && (
              <div className="truncate text-sm">
                <span className="font-semibold">{projectName}</span>
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-muted-foreground">{scenarioName}</span>
              </div>
            )}
            <div className={cn('text-xs', saveClass)} aria-live="polite">{humanSaved}</div>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button size="sm" onClick={onRunCalculation} disabled={disableRun || isCalculating}>
                      {isCalculating ? 'Calculating…' : 'Run'}
                    </Button>
                  </span>
                </TooltipTrigger>
                {disableRun && (
                  <TooltipContent side="bottom">Fix blocking issues in Preview to run the model.</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <Button size="sm" variant="outline" onClick={onSaveSnapshot}>
              Save Snapshot
            </Button>

            {onOpenChecklist && (
              <Button size="sm" variant="secondary" onClick={onOpenChecklist}>
                Checklist
              </Button>
            )}
            
            {onResetToBaseline && (
              <Button size="sm" variant="ghost" onClick={onResetToBaseline}>
                Reset to Baseline
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={cn(
                  'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors hover:text-foreground',
                  activeTab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-4 flex-1">{children}</div>
    </div>
  );
}