import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/contexts/LocaleContext';
import { logical } from '@/lib/rtl';

interface ToolbarProps {
  children: ReactNode;
  className?: string;
  sticky?: boolean;
}

interface ToolbarGroupProps {
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

const ToolbarGroup: React.FC<ToolbarGroupProps> = ({ 
  children, 
  align = 'left',
  className 
}) => {
  const { dir } = useLocale();
  const { flexRow } = logical(dir);
  
  const alignClass = align === 'right' ? 'ml-auto' : '';
  
  return (
    <div className={cn('flex items-center gap-2', flexRow, alignClass, className)}>
      {children}
    </div>
  );
};

export const Toolbar: React.FC<ToolbarProps> & {
  Group: typeof ToolbarGroup;
} = ({ 
  children, 
  className,
  sticky = false 
}) => {
  const { dir } = useLocale();
  const { flexRow } = logical(dir);

  return (
    <div className={cn(
      'flex items-center justify-between gap-4 py-4',
      flexRow,
      sticky && 'sticky top-14 z-30 bg-background border-b',
      className
    )}>
      {children}
    </div>
  );
};

Toolbar.Group = ToolbarGroup;