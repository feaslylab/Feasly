import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ds } from '@/lib/design-system';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  subtitle,
  action,
  className
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center py-12 px-4',
      className
    )}>
      <div className="rounded-full bg-muted p-6 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className={cn(ds.type.h3, 'text-foreground mb-2')}>
        {title}
      </h3>
      {subtitle && (
        <p className={cn(ds.type.body, 'text-muted-foreground mb-6 max-w-md')}>
          {subtitle}
        </p>
      )}
      {action && action}
    </div>
  );
};