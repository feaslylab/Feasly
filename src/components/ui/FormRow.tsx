import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ds } from '@/lib/design-system';
import { useLocale } from '@/contexts/LocaleContext';

interface FormRowProps {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
  labelId?: string;
  hintId?: string;
  errorId?: string;
}

export const FormRow: React.FC<FormRowProps> = ({
  label,
  hint,
  error,
  children,
  className,
  labelId,
  hintId,
  errorId
}) => {
  const { isRTL } = useLocale();

  return (
    <div className={cn('grid gap-2', isRTL ? 'grid-cols-[1fr_160px]' : 'grid-cols-[160px_1fr]', className)}>
      <div className={cn('flex flex-col', isRTL ? 'items-end' : 'items-start')}>
        <label 
          className={cn(ds.type.body, 'font-medium text-foreground')}
          id={labelId}
        >
          {label}
        </label>
        {hint && (
          <p 
            className={cn(ds.type.small, 'text-muted-foreground mt-1')}
            id={hintId}
          >
            {hint}
          </p>
        )}
      </div>
      <div className="flex flex-col">
        {children}
        {error && (
          <p 
            className={cn(ds.type.small, 'text-destructive mt-1')}
            id={errorId}
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
};