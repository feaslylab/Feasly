import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ds } from '@/lib/design-system';
import { useLocale } from '@/contexts/LocaleContext';
import { logical } from '@/lib/rtl';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  className
}) => {
  const { dir } = useLocale();
  const { flexRow } = logical(dir);

  return (
    <header className={cn('mb-6', className)}>
      <div className={cn('flex items-start justify-between gap-4', flexRow)}>
        <div className="flex-1 min-w-0">
          <h1 className={cn(ds.type.h1, 'text-foreground')}>
            {title}
          </h1>
          {subtitle && (
            <p className={cn(ds.type.body, 'text-muted-foreground mt-1')}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};