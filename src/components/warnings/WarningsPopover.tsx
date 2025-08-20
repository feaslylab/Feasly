import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { Warning } from '@/utils/validateFeasibility';
import { cn } from '@/lib/utils';

interface WarningsPopoverProps {
  warnings: Warning[];
}

export function WarningsPopover({ warnings }: WarningsPopoverProps) {
  const [open, setOpen] = useState(false);

  if (warnings.length === 0) return null;

  const getSeverityConfig = (severity: Warning['severity']) => {
    switch (severity) {
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-950/30',
          variant: 'destructive' as const
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
          variant: 'outline' as const
        };
      case 'info':
        return {
          icon: Info,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-950/30',
          variant: 'secondary' as const
        };
    }
  };

  const groupedWarnings = warnings.reduce((acc, warning) => {
    const location = warning.location || 'general';
    if (!acc[location]) acc[location] = [];
    acc[location].push(warning);
    return acc;
  }, {} as Record<string, Warning[]>);

  const getLocationLabel = (location: string) => {
    switch (location) {
      case 'project': return 'Project Setup';
      case 'costs': return 'Cost Items';
      case 'revenue': return 'Revenue & Units';
      case 'financing': return 'Financing';
      default: return 'General';
    }
  };

  const errorCount = warnings.filter(w => w.severity === 'error').length;
  const warningCount = warnings.filter(w => w.severity === 'warning').length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "h-8 w-8 p-0 relative",
            errorCount > 0 ? "text-red-600 hover:text-red-700" : "text-yellow-600 hover:text-yellow-700"
          )}
        >
          {errorCount > 0 ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          {warnings.length > 0 && (
            <Badge 
              variant={errorCount > 0 ? "destructive" : "outline"}
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
            >
              {warnings.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Project Issues</h3>
            <div className="flex gap-1">
              {errorCount > 0 && (
                <Badge variant="destructive" className="text-xs h-5">
                  {errorCount} error{errorCount !== 1 ? 's' : ''}
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge variant="outline" className="text-xs h-5">
                  {warningCount} warning{warningCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setOpen(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <ScrollArea className="max-h-96">
          <div className="p-4 pt-0 space-y-4">
            {Object.entries(groupedWarnings).map(([location, locationWarnings]) => (
              <div key={location}>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  {getLocationLabel(location)}
                </h4>
                <div className="space-y-2">
                  {locationWarnings.map((warning) => {
                    const config = getSeverityConfig(warning.severity);
                    const Icon = config.icon;
                    
                    return (
                      <div
                        key={warning.id}
                        className={cn(
                          "flex items-start gap-2 p-2 rounded-md text-sm",
                          config.bgColor
                        )}
                      >
                        <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", config.color)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-5">{warning.message}</p>
                          {warning.field && (
                            <p className="text-xs text-muted-foreground mt-1 font-mono">
                              {warning.field}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {location !== Object.keys(groupedWarnings)[Object.keys(groupedWarnings).length - 1] && (
                  <Separator className="mt-3" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}