import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStickyNavigation } from '@/hooks/useStickyNavigation';
import { FeaslyModelFormData } from '@/components/FeaslyModel/types';
import { useSectionStatus } from '@/hooks/useSectionValidation';

interface ValidationSectionStatus {
  id: string;
  title: string;
  status: 'valid' | 'warning' | 'error' | 'empty';
  completionRatio: number;
  missingFields: string[];
  hasWarnings: boolean;
}

interface RightSideValidationPanelProps {
  className?: string;
}

export function RightSideValidationPanel({ className }: RightSideValidationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Try to get form context, but handle gracefully if not available
  let formState, formData;
  try {
    const form = useFormContext<FeaslyModelFormData>();
    if (form) {
      formState = form.formState;
      formData = form.watch();
    }
  } catch {
    // Form context not available, use defaults
    formState = { errors: {} };
    formData = {};
  }
  
  // If no form context, render a simplified version
  if (!formState || !formData) {
    return (
      <aside 
        className={cn('fixed right-4 top-20 w-72 z-40', className)}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary" />
              Validation Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Validation panel loading...
            </p>
          </CardContent>
        </Card>
      </aside>
    );
  }
  
  
  const { getStickyContainerStyles } = useStickyNavigation({
    topOffset: 80, // Account for header + some spacing
    maxHeight: 'calc(100vh - 6rem)'
  });

  // Define sections to validate
  const sectionsToValidate = [
    { id: 'project-metadata', title: 'Project Info' },
    { id: 'timeline', title: 'Timeline' },
    { id: 'site-metrics', title: 'Site Metrics' },
    { id: 'financial-inputs', title: 'Financial Inputs' },
    { id: 'construction-development', title: 'Construction' },
    { id: 'revenue-segments', title: 'Revenue' },
    { id: 'rental-segments', title: 'Rental' },
  ];

  // Get validation status for each section
  const sectionStatuses: ValidationSectionStatus[] = sectionsToValidate.map(section => {
    const { status, validation } = useSectionStatus(section.id, formData);
    return {
      id: section.id,
      title: section.title,
      status,
      completionRatio: validation.completionRatio,
      missingFields: validation.missingFields,
      hasWarnings: validation.hasWarnings
    };
  });

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const totalSections = sectionStatuses.length;
    const completedSections = sectionStatuses.filter(s => s.status === 'valid').length;
    const partialSections = sectionStatuses.filter(s => s.completionRatio > 0 && s.status !== 'valid').length;
    
    return {
      percentage: Math.round((completedSections / totalSections) * 100),
      completed: completedSections,
      partial: partialSections,
      total: totalSections,
      hasErrors: sectionStatuses.some(s => s.status === 'error'),
      hasWarnings: sectionStatuses.some(s => s.hasWarnings)
    };
  }, [sectionStatuses]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-3 w-3 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-warning" />;
      case 'error':
        return <XCircle className="h-3 w-3 text-destructive" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getOverallStatusColor = () => {
    if (overallProgress.hasErrors) return 'text-destructive';
    if (overallProgress.hasWarnings) return 'text-warning';
    if (overallProgress.percentage === 100) return 'text-success';
    return 'text-primary';
  };

  const stickyStyles = getStickyContainerStyles();

  return (
    <aside 
      className={cn('fixed right-4 top-20 w-72 z-40 hidden lg:block', className)}
    >
      <Card className="shadow-lg border-2"
        style={stickyStyles}
      >
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Validation Status
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
          
          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Overall Progress</span>
              <span className={cn('text-xs font-medium', getOverallStatusColor())}>
                {overallProgress.percentage}%
              </span>
            </div>
            
            <Progress 
              value={overallProgress.percentage} 
              className="h-2"
            />
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-center hover:bg-muted/50 rounded p-1 transition-colors"
              >
                <div className="font-medium text-success">{overallProgress.completed}</div>
                <div className="text-muted-foreground">Complete</div>
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-center hover:bg-muted/50 rounded p-1 transition-colors"
              >
                <div className="font-medium text-warning">{overallProgress.partial}</div>
                <div className="text-muted-foreground">Partial</div>
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-center hover:bg-muted/50 rounded p-1 transition-colors"
              >
                <div className="font-medium text-muted-foreground">
                  {overallProgress.total - overallProgress.completed - overallProgress.partial}
                </div>
                <div className="text-muted-foreground">Pending</div>
              </button>
            </div>
          </div>
        </CardHeader>

        {/* Expandable Section Details */}
        {isExpanded && (
          <CardContent className="pt-0">
            <ScrollArea className="h-[calc(100vh-20rem)]">
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Section Status
                </h4>
                
                {sectionStatuses.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {getStatusIcon(section.status)}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">
                          {section.title}
                        </div>
                        {section.completionRatio > 0 && section.completionRatio < 1 && (
                          <div className="text-xs text-muted-foreground">
                            {Math.round(section.completionRatio * 100)}% complete
                          </div>
                        )}
                        {section.missingFields.length > 0 && (
                          <div className="text-xs text-destructive">
                            {section.missingFields.length} missing
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-xs px-1.5 py-0.5',
                        {
                          'border-success text-success': section.status === 'valid',
                          'border-warning text-warning': section.status === 'warning',
                          'border-destructive text-destructive': section.status === 'error',
                          'border-muted text-muted-foreground': section.status === 'empty'
                        }
                      )}
                    >
                      {section.status === 'valid' && 'Done'}
                      {section.status === 'warning' && 'Issues'}
                      {section.status === 'error' && 'Error'}
                      {section.status === 'empty' && 'Pending'}
                    </Badge>
                  </div>
                ))}

                {/* Form Errors Summary */}
                {formState.errors && Object.keys(formState.errors).length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <h4 className="text-xs font-medium text-destructive mb-2 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Form Errors ({Object.keys(formState.errors).length})
                    </h4>
                    <div className="space-y-1 text-xs text-destructive/80 max-h-20 overflow-y-auto">
                       {Object.entries(formState.errors).slice(0, 5).map(([field, error]) => (
                         <div key={field} className="truncate">
                           • {field}: {(error as any)?.message || 'Invalid value'}
                         </div>
                      ))}
                      {Object.keys(formState.errors).length > 5 && (
                        <div className="text-muted-foreground">
                          +{Object.keys(formState.errors).length - 5} more errors
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="mt-4 p-3 rounded-lg bg-muted/30">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Quick Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="font-medium">{formData.construction_items?.length || 0}</div>
                      <div className="text-muted-foreground">Cost Items</div>
                    </div>
                    <div>
                      <div className="font-medium">{formData.sale_lines?.length || 0}</div>
                      <div className="text-muted-foreground">Sale Lines</div>
                    </div>
                    <div>
                      <div className="font-medium">{formData.rental_lines?.length || 0}</div>
                      <div className="text-muted-foreground">Rental Lines</div>
                    </div>
                    <div>
                      <div className="font-medium">
                        {formData.project_name ? '✓' : '—'}
                      </div>
                      <div className="text-muted-foreground">Project Name</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        )}
      </Card>
    </aside>
  );
}