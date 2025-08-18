import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonCardProps {
  className?: string;
  showHeader?: boolean;
  rows?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className,
  showHeader = true,
  rows = 3
}) => {
  return (
    <div className={cn(
      'rounded-2xl shadow-sm border bg-card p-6',
      className
    )}>
      {showHeader && (
        <div className="mb-4">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonKpi: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('space-y-2', className)}>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-24" />
    </div>
  );
};

export const SkeletonTable: React.FC<{ 
  rows?: number; 
  cols?: number; 
  className?: string; 
}> = ({ 
  rows = 5, 
  cols = 4, 
  className 
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: cols }, (_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }, (_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};