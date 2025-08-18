import React from 'react';
import { cn } from '@/lib/utils';
import { ds } from '@/lib/design-system';
import { useLocale } from '@/contexts/LocaleContext';
import { fmtFinance, fmtPercentage } from '@/lib/number';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiStatProps {
  label: string;
  value: number | string;
  delta?: number;
  format?: 'number' | 'currency' | 'percentage';
  className?: string;
}

export const KpiStat: React.FC<KpiStatProps> = ({
  label,
  value,
  delta,
  format = 'number',
  className
}) => {
  const { locale } = useLocale();

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return `$${fmtFinance(val, locale)}`;
      case 'percentage':
        return fmtPercentage(val, locale);
      default:
        return fmtFinance(val, locale);
    }
  };

  const getDeltaColor = (deltaValue: number) => {
    if (deltaValue > 0) return 'text-green-600';
    if (deltaValue < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getDeltaIcon = (deltaValue: number) => {
    if (deltaValue > 0) return TrendingUp;
    if (deltaValue < 0) return TrendingDown;
    return null;
  };

  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      <p className={cn(ds.type.small, 'text-muted-foreground font-medium')}>
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-semibold text-foreground">
          {formatValue(value)}
        </span>
        {delta !== undefined && (
          <div className={cn('flex items-center gap-1', getDeltaColor(delta))}>
            {(() => {
              const Icon = getDeltaIcon(delta);
              return Icon ? <Icon className="h-3 w-3" /> : null;
            })()}
            <span className={cn(ds.type.small, 'font-medium')}>
              {delta > 0 ? '+' : ''}{fmtPercentage(Math.abs(delta), locale)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};