import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

interface MetricsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

const variantStyles = {
  default: 'bg-muted/30 border-border/40',
  success: 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800/40',
  warning: 'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800/40',
  error: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800/40',
  info: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/40',
};

const variantTextStyles = {
  default: 'text-foreground',
  success: 'text-green-800 dark:text-green-200',
  warning: 'text-yellow-800 dark:text-yellow-200',
  error: 'text-red-800 dark:text-red-200',
  info: 'text-blue-800 dark:text-blue-200',
};

const variantSubtitleStyles = {
  default: 'text-muted-foreground',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
};

export function MetricsGrid({ children, columns = 4, className }: MetricsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  }[columns];

  return (
    <div className={cn("grid gap-4", gridCols, className)}>
      {children}
    </div>
  );
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  variant = 'default',
  className 
}: MetricCardProps) {
  return (
    <div className={cn(
      "p-4 rounded-lg border transition-all duration-200 hover:shadow-sm",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className={cn("text-xs font-medium", variantSubtitleStyles[variant])}>
          {title}
        </div>
        {icon && (
          <div className={cn("opacity-60", variantTextStyles[variant])}>
            {icon}
          </div>
        )}
      </div>
      <div className={cn("text-2xl font-bold", variantTextStyles[variant])}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {subtitle && (
        <div className={cn("text-xs mt-1", variantSubtitleStyles[variant])}>
          {subtitle}
        </div>
      )}
    </div>
  );
}