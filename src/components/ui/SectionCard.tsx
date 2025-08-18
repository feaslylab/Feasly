import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ds } from '@/lib/design-system';
import { useLocale } from '@/contexts/LocaleContext';
import { logical } from '@/lib/rtl';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  right,
  children,
  className
}) => {
  const { dir } = useLocale();
  const { flexRow } = logical(dir);

  return (
    <div className={cn(
      'rounded-2xl shadow-sm border bg-card text-card-foreground',
      className
    )}>
      {(title || subtitle || right) && (
        <div className={cn('flex items-start justify-between gap-4 p-6 pb-0', flexRow)}>
          <div className="flex-1 min-w-0">
            {title && (
              <h2 className={cn(ds.type.h2, 'text-foreground')}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={cn(ds.type.body, 'text-muted-foreground mt-1')}>
                {subtitle}
              </p>
            )}
          </div>
          {right && (
            <div className="flex-shrink-0">
              {right}
            </div>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};