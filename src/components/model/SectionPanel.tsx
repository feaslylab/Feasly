import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SectionStatus = 'valid' | 'warning' | 'error' | 'empty';

interface SectionPanelProps {
  id: string;
  title: string;
  children: ReactNode;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
  status?: SectionStatus;
  className?: string;
  lazyLoad?: boolean;
  rowCount?: number; // For grid components
}

const statusConfig = {
  valid: {
    icon: CheckCircle,
    className: 'text-success border-success/20 bg-success/10',
    label: 'Complete'
  },
  warning: {
    icon: AlertTriangle,
    className: 'text-warning border-warning/20 bg-warning/10',
    label: 'Partial'
  },
  error: {
    icon: XCircle,
    className: 'text-destructive border-destructive/20 bg-destructive/10',
    label: 'Issues'
  },
  empty: {
    icon: ChevronRight,
    className: 'text-muted-foreground border-muted/20 bg-muted/5',
    label: 'Pending'
  }
};

export function SectionPanel({
  id,
  title,
  children,
  isOpen = false,
  onToggle,
  status = 'empty',
  className,
  lazyLoad = false,
  rowCount
}: SectionPanelProps) {
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  const handleToggle = () => {
    onToggle?.(!isOpen);
    
    // Scroll to section when opening
    if (!isOpen) {
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    }
  };

  return (
    <Card 
      id={id}
      className={cn(
        'transition-all duration-200',
        isOpen && 'ring-2 ring-primary/20',
        className
      )}
    >
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader 
            className={cn(
              'cursor-pointer hover:bg-muted/50 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              'group'
            )}
            role="button"
            aria-expanded={isOpen}
            tabIndex={0}
            onClick={handleToggle}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggle();
              }
            }}
          >
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-foreground" />
                  )}
                  <span className="group-hover:text-primary transition-colors">
                    {title}
                  </span>
                </div>
              </CardTitle>
              
              <div className="flex items-center gap-2">
                {rowCount !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    {rowCount} {rowCount === 1 ? 'item' : 'items'}
                  </Badge>
                )}
                <Badge 
                  variant="outline"
                  className={cn(
                    'flex items-center gap-1.5 transition-colors',
                    statusInfo.className
                  )}
                >
                  <StatusIcon className="h-3 w-3" />
                  <span className="text-xs font-medium">
                    {statusInfo.label}
                  </span>
                </Badge>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="transition-all duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1">
          <CardContent className="pt-0">
            {/* Lazy load content if specified and panel is open */}
            {lazyLoad ? (isOpen ? children : null) : children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}