import { useEngine, useEngineNumbers } from '@/lib/engine/EngineContext';
import { useModelValidations } from '@/lib/validation/useModelValidations';
import { useEffect, useState } from 'react';
import { fmtCurrency, fmtPct } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertTriangle, XCircle, Play, Calendar, TrendingUp, DollarSign, Hash, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewPanelProps {
  onBlockingChange?: (hasBlocking: boolean) => void;
  onRunCalculation?: () => void;
}

export default function PreviewPanel({ onBlockingChange, onRunCalculation }: PreviewPanelProps) {
  const { inputs } = useEngine();
  const numbers = useEngineNumbers();
  const { issues, hasBlocking } = useModelValidations(inputs);
  const [dismissedIssues, setDismissedIssues] = useState<Set<string>>(new Set());

  // Load dismissed issues from localStorage
  useEffect(() => {
    const projectId = 'current'; // You might want to get this from context
    const stored = localStorage.getItem(`dismissed:${projectId}`);
    if (stored) {
      try {
        setDismissedIssues(new Set(JSON.parse(stored)));
      } catch (e) {
        console.warn('Failed to parse dismissed issues from localStorage');
      }
    }
  }, []);

  // Save dismissed issues to localStorage
  const dismissIssue = (issueMessage: string) => {
    const projectId = 'current';
    const newDismissed = new Set([...dismissedIssues, issueMessage]);
    setDismissedIssues(newDismissed);
    localStorage.setItem(`dismissed:${projectId}`, JSON.stringify(Array.from(newDismissed)));
  };

  // Filter out dismissed issues
  const visibleIssues = issues.filter(issue => !dismissedIssues.has(issue.message));
  const errorIssues = visibleIssues.filter(issue => issue.level === 'error');
  const warningIssues = visibleIssues.filter(issue => issue.level === 'warn');

  // Notify parent of blocking status
  useEffect(() => {
    if (onBlockingChange) {
      onBlockingChange(hasBlocking);
    }
  }, [hasBlocking, onBlockingChange]);

  // Extract key metrics from available data
  const totalRevenue = numbers?.revenue?.sales?.total || numbers?.revenue?.rent?.total;
  const irrPa = numbers?.equity?.kpis?.irr_pa || numbers?.equity?.irr;
  const totalPeriods = inputs?.project?.periods;
  const startDate = inputs?.project?.start_date;

  const hasData = totalRevenue || irrPa || totalPeriods || startDate;

  return (
    <div className="space-y-6" data-section="preview">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Preview</h2>
        <p className="text-muted-foreground">
          Review key assumptions and readiness before running calculations.
        </p>
      </div>

      {/* Readiness Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {visibleIssues.length === 0 ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : errorIssues.length > 0 ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
            Project Readiness
          </CardTitle>
          <CardDescription>
            Validation checks for your project configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {visibleIssues.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">You're good to go!</span>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Blocking Issues */}
              {errorIssues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-red-600 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    Blocking Issues ({errorIssues.length})
                  </h4>
                  <div className="space-y-1">
                    {errorIssues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700"
                      >
                        <span>{issue.message}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => dismissIssue(issue.message)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning Issues */}
              {warningIssues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-yellow-600 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    Recommended ({warningIssues.length})
                  </h4>
                  <div className="space-y-1">
                    {warningIssues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700"
                      >
                        <span>{issue.message}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => dismissIssue(issue.message)}
                          className="h-6 w-6 p-0 text-yellow-500 hover:text-yellow-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Preview KPIs */}
      {hasData ? (
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
            <CardDescription>
              Summary of your project assumptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <DollarSign className="h-4 w-4" />
                  Total Revenue
                </div>
                <div className="text-lg font-semibold">
                  {fmtCurrency(totalRevenue, 'AED')}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <TrendingUp className="h-4 w-4" />
                  IRR (pa)
                </div>
                <div className="text-lg font-semibold">
                  {fmtPct(irrPa)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Hash className="h-4 w-4" />
                  Total Periods
                </div>
                <div className="text-lg font-semibold">
                  {totalPeriods || '—'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </div>
                <div className="text-lg font-semibold">
                  {startDate ? new Date(startDate).toLocaleDateString() : '—'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Play className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Ready to Start Modeling</h3>
              <p className="text-muted-foreground max-w-md">
                Set your key inputs in the Project and Units tabs to begin financial modeling and see preview metrics here.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold">Run Financial Model</h3>
              <p className="text-sm text-muted-foreground">
                Generate detailed calculations and view results
              </p>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      size="lg"
                      onClick={onRunCalculation}
                      disabled={errorIssues.length > 0}
                      className="gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Run Model
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {errorIssues.length > 0 
                    ? "Fix errors to enable model run" 
                    : "Run financial calculations"
                  }
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}