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
      <div className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur shadow-soft">
        <div className="mx-auto max-w-7xl px-4 h-12 flex items-center justify-between gap-4">
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
              
              {/* Primary Action - Run */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button 
                        size="sm" 
                        onClick={onRunCalculation} 
                        disabled={disableRun || isCalculating || isApproved}
                        className="h-7 px-3 text-xs font-medium bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <Play className="h-2.5 w-2.5 mr-1" strokeWidth={1.5} />
                        {isCalculating ? 'Running...' : 'Run'}
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

              {/* Secondary Actions */}
              <div className="flex items-center bg-muted/20 rounded-md p-0.5 gap-0.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={onSaveSnapshot}
                          disabled={isApproved}
                          className="h-7 w-7 p-0 hover:bg-muted/60 transition-colors"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {isApproved ? 'Cannot save snapshots for approved scenarios' : 'Save Snapshot'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {onOpenChecklist && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={onOpenChecklist}
                          className="h-7 w-7 p-0 hover:bg-muted/60 transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Checklist</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
                            className="h-7 w-7 p-0 hover:bg-muted/60 transition-colors"
                          >
                            <Database className="h-3 w-3" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {isApproved ? 'Cannot reset approved scenarios' : 'Reset to Baseline'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
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