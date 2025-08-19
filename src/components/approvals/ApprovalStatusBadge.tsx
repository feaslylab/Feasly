import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, FileText } from 'lucide-react';
import type { ApprovalStatus } from '@/hooks/useApprovalStatus';

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
  className?: string;
  showIcon?: boolean;
}

const statusConfig = {
  draft: {
    label: 'Draft',
    variant: 'secondary' as const,
    className: 'bg-muted text-muted-foreground border-muted',
    icon: FileText
  },
  under_review: {
    label: 'Under Review',
    variant: 'default' as const,
    className: 'bg-warning/10 text-warning border-warning/20',
    icon: Clock
  },
  approved: {
    label: 'Approved',
    variant: 'default' as const,
    className: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle
  }
};

export function ApprovalStatusBadge({ 
  status, 
  className, 
  showIcon = true 
}: ApprovalStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
}