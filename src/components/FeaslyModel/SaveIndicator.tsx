import React from 'react';
import { Check, AlertCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AutosaveState } from '@/hooks/useAutosaveSync';

interface SaveIndicatorProps {
  state: AutosaveState;
  className?: string;
}

export function SaveIndicator({ state, className }: SaveIndicatorProps) {
  const getIndicatorConfig = () => {
    switch (state.status) {
      case 'saving':
        return {
          icon: <Clock className="h-3 w-3 animate-spin" />,
          label: 'Saving...',
          variant: 'secondary' as const,
          className: 'text-primary bg-primary/10 border-primary/20'
        };
      
      case 'saved':
        return {
          icon: <Check className="h-3 w-3" />,
          label: 'Saved',
          variant: 'default' as const,
          className: 'text-green-600 bg-green-50 border-green-200'
        };
      
      case 'error':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Error',
          variant: 'destructive' as const,
          className: 'text-red-600 bg-red-50 border-red-200'
        };
      
      case 'offline':
        return {
          icon: <WifiOff className="h-3 w-3" />,
          label: state.queuedSaves > 0 ? `${state.queuedSaves} queued` : 'Offline',
          variant: 'secondary' as const,
          className: 'text-orange-600 bg-orange-50 border-orange-200'
        };
      
      default:
        return {
          icon: <Wifi className="h-3 w-3" />,
          label: state.isDirty ? 'Unsaved' : 'Up to date',
          variant: 'outline' as const,
          className: state.isDirty ? 'text-warning bg-warning/10 border-warning/20' : 'text-muted-foreground bg-muted/50 border-border'
        };
    }
  };

  const config = getIndicatorConfig();

  const tooltipContent = (
    <div className="space-y-1">
      <div className="font-medium">Status: {config.label}</div>
      {state.lastSyncedAt && (
        <div className="text-xs text-muted-foreground">
          Last synced: {state.lastSyncedAt.toLocaleTimeString()}
        </div>
      )}
      {state.error && (
        <div className="text-xs text-red-500">
          {state.error}
        </div>
      )}
      {state.queuedSaves > 0 && (
        <div className="text-xs text-orange-500">
          {state.queuedSaves} save(s) queued for retry
        </div>
      )}
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={config.variant}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm border transition-all duration-200 cursor-help',
            config.className,
            className
          )}
          aria-live="polite"
          aria-label={`Save status: ${config.label}`}
          data-testid="save-indicator"
        >
          {config.icon}
          <span className="text-xs font-medium">{config.label}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
}