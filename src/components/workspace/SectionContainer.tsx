import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  padding?: 'default' | 'compact' | 'spacious';
  variant?: 'default' | 'outlined' | 'flat';
}

export function SectionContainer({ 
  children, 
  className = '', 
  title,
  description,
  icon,
  actions,
  padding = 'default',
  variant = 'default'
}: SectionContainerProps) {
  const paddingClass = {
    compact: 'p-4',
    default: 'p-6',
    spacious: 'p-8'
  }[padding];

  const containerClass = cn(
    "w-full max-w-[1200px] mx-auto transition-all duration-200",
    paddingClass,
    className
  );

  const content = (
    <div className={containerClass}>
      {/* Header Section */}
      {(title || actions) && (
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-1 flex-1">
            {title && (
              <div className="flex items-center gap-2">
                {icon}
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  {title}
                </h2>
              </div>
            )}
            {description && (
              <p className="text-sm text-muted-foreground max-w-2xl">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 ml-4">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );

  if (variant === 'flat') {
    return <div className="bg-background">{content}</div>;
  }

  if (variant === 'outlined') {
    return (
      <div className="border border-border rounded-lg bg-background">
        {content}
      </div>
    );
  }

  return (
    <Card className="border-border/40 shadow-sm">
      {content}
    </Card>
  );
}

// Specialized container for table-heavy sections
export function TableSectionContainer({ 
  children, 
  className = '',
  ...props 
}: SectionContainerProps) {
  return (
    <SectionContainer 
      className={cn("overflow-hidden", className)}
      padding="compact"
      {...props}
    >
      <div className="space-y-4">
        {children}
      </div>
    </SectionContainer>
  );
}

// Specialized container for form sections
export function FormSectionContainer({ 
  children, 
  className = '',
  ...props 
}: SectionContainerProps) {
  return (
    <SectionContainer 
      className={cn("", className)}
      padding="default"
      {...props}
    >
      <div className="space-y-6">
        {children}
      </div>
    </SectionContainer>
  );
}