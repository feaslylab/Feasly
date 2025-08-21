import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Save, Play, Eye, BarChart3, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApprovalWatermark } from '@/components/approvals/ApprovalWatermark';
import { useApprovalStatus } from '@/hooks/useApprovalStatus';
import { FilingCabinetTabs } from './FilingCabinetTabs';

type WorkspaceTab = 'inputs' | 'preview' | 'preview_revenue' | 'executive_report' | 'insights' | 'results' | 'timeline' | 'snapshots' | 'presets' | 'portfolio';
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
  scenarioSelector?: React.ReactNode;
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
  onTabChange,
  scenarioSelector
}: WorkspaceLayoutProps) {
  // Get approval status for current scenario
  const { isApproved } = useApprovalStatus('default', scenarioName);

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
    <div className="flex flex-col h-full w-full relative">
      {/* Approval Watermark */}
      <ApprovalWatermark 
        projectId="default"
        scenarioId={scenarioName}
        scenarioName={scenarioName}
      />
      
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
            {scenarioSelector}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button 
                      size="sm" 
                      onClick={onRunCalculation} 
                      disabled={disableRun || isCalculating || isApproved}
                    >
                      {isCalculating ? 'Calculating…' : 'Run'}
                    </Button>
                  </span>
                </TooltipTrigger>
                {(disableRun || isApproved) && (
                  <TooltipContent side="bottom">
                    {isApproved 
                      ? 'Cannot run calculations on approved scenarios'
                      : 'Fix blocking issues in Preview to run the model.'
                    }
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={onSaveSnapshot}
                      disabled={isApproved}
                    >
                      Save Snapshot
                    </Button>
                  </span>
                </TooltipTrigger>
                {isApproved && (
                  <TooltipContent side="bottom">
                    Cannot save snapshots for approved scenarios
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            {onOpenChecklist && (
              <Button size="sm" variant="secondary" onClick={onOpenChecklist}>
                Checklist
              </Button>
            )}
            
            {onResetToBaseline && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={onResetToBaseline}
                        disabled={isApproved}
                      >
                        Reset to Baseline
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {isApproved && (
                    <TooltipContent side="bottom">
                      Cannot reset approved scenarios
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Filing Cabinet Tabs */}
        <div className="mx-auto max-w-7xl px-4">
          <FilingCabinetTabs activeTab={activeTab} onTabChange={onTabChange} />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-4 flex-1">{children}</div>
    </div>
  );
}