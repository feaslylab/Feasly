import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { FeasibilityResult } from '@/utils/validateFeasibility';
import { cn } from '@/lib/utils';

interface WarningBannerProps {
  feasibility: FeasibilityResult;
  onViewDetails?: () => void;
}

export function WarningBanner({ feasibility, onViewDetails }: WarningBannerProps) {
  const { grade, summary, warnings, hasBlockingIssues } = feasibility;

  const getGradeConfig = (grade: string) => {
    switch (grade) {
      case 'A':
        return {
          color: 'bg-green-500/10 text-green-700 border-green-200 dark:text-green-400 dark:border-green-800',
          icon: CheckCircle,
          badgeVariant: 'default' as const
        };
      case 'B':
        return {
          color: 'bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400 dark:border-blue-800',
          icon: Info,
          badgeVariant: 'secondary' as const
        };
      case 'C':
        return {
          color: 'bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:text-yellow-400 dark:border-yellow-800',
          icon: AlertTriangle,
          badgeVariant: 'outline' as const
        };
      case 'D':
        return {
          color: 'bg-red-500/10 text-red-700 border-red-200 dark:text-red-400 dark:border-red-800',
          icon: AlertCircle,
          badgeVariant: 'destructive' as const
        };
      default:
        return {
          color: 'bg-muted text-muted-foreground border-border',
          icon: Info,
          badgeVariant: 'secondary' as const
        };
    }
  };

  const config = getGradeConfig(grade);
  const Icon = config.icon;

  if (warnings.length === 0) {
    return (
      <Alert className={cn("mb-6", config.color)}>
        <Icon className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={config.badgeVariant}>Grade {grade}</Badge>
            <span>{summary}</span>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={cn("mb-6", config.color)}>
      <Icon className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={config.badgeVariant}>Grade {grade}</Badge>
          <span>{summary}</span>
          {warnings.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {warnings.length} issue{warnings.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        {onViewDetails && warnings.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onViewDetails}
            className="h-8 px-2 text-xs"
          >
            View Details
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}