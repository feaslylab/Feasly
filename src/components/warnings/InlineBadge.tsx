import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Warning } from '@/utils/validateFeasibility';
import { cn } from '@/lib/utils';

interface InlineBadgeProps {
  warnings: Warning[];
  className?: string;
}

export function InlineBadge({ warnings, className }: InlineBadgeProps) {
  if (warnings.length === 0) return null;

  const highestSeverity = warnings.reduce((highest, warning) => {
    if (warning.severity === 'error') return 'error';
    if (warning.severity === 'warning' && highest !== 'error') return 'warning';
    return highest;
  }, 'info' as Warning['severity']);

  const getSeverityConfig = (severity: Warning['severity']) => {
    switch (severity) {
      case 'error':
        return {
          icon: AlertCircle,
          variant: 'destructive' as const,
          color: 'text-red-600 dark:text-red-400'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          variant: 'outline' as const,
          color: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'info':
        return {
          icon: Info,
          variant: 'secondary' as const,
          color: 'text-blue-600 dark:text-blue-400'
        };
    }
  };

  const config = getSeverityConfig(highestSeverity);
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={config.variant}
            className={cn("h-5 w-5 p-0 flex items-center justify-center", className)}
          >
            <Icon className="h-3 w-3" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            {warnings.slice(0, 3).map((warning) => (
              <p key={warning.id} className="text-xs">
                {warning.message}
              </p>
            ))}
            {warnings.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{warnings.length - 3} more issue{warnings.length - 3 !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}