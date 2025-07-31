import React from 'react';
import { cn } from '@/lib/utils';

interface TouchTargetProps {
  children: React.ReactNode;
  className?: string;
  minSize?: number;
}

// Ensures minimum touch target size for mobile accessibility
export const TouchTarget: React.FC<TouchTargetProps> = ({ 
  children, 
  className, 
  minSize = 44 
}) => {
  return (
    <div 
      className={cn(
        "inline-flex items-center justify-center touch-none",
        className
      )}
      style={{ 
        minHeight: `${minSize}px`, 
        minWidth: `${minSize}px` 
      }}
    >
      {children}
    </div>
  );
};

// Mobile-optimized button variants
export const MobileButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 touch-none";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };
  
  const sizes = {
    sm: "h-10 px-3 text-sm min-h-[40px]", // Mobile-friendly minimum
    md: "h-12 px-4 py-2 min-h-[44px]",   // Recommended touch target
    lg: "h-14 px-6 text-lg min-h-[48px]", // Large touch target
  };
  
  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

MobileButton.displayName = "MobileButton";

// Mobile-optimized input with larger touch targets
export const MobileInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] touch-none",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

MobileInput.displayName = "MobileInput";

// Responsive spacing utilities
export const spacing = {
  mobile: {
    xs: "p-2",
    sm: "p-3", 
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  },
  desktop: {
    xs: "sm:p-3",
    sm: "sm:p-4",
    md: "sm:p-6", 
    lg: "sm:p-8",
    xl: "sm:p-12",
  }
};

// Mobile-first responsive container
export const ResponsiveContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  padding?: keyof typeof spacing.mobile;
}> = ({ children, className, padding = 'md' }) => {
  return (
    <div className={cn(
      "w-full mx-auto",
      spacing.mobile[padding],
      spacing.desktop[padding],
      "max-w-7xl", // Prevent content from being too wide on large screens
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-optimized card with better touch interactions
export const MobileCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}> = ({ children, className, interactive = false, onClick }) => {
  return (
    <div 
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-elevation-2",
        interactive && "cursor-pointer hover:shadow-md transition-shadow duration-200 active:scale-[0.98] touch-none",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};