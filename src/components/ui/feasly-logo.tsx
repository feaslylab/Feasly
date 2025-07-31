import { cn } from '@/lib/utils';

interface FeaslyLogoProps {
  className?: string;
  size?: number;
  variant?: 'default' | 'mono' | 'white';
}

export function FeaslyLogoSVG({ 
  className, 
  size = 24, 
  variant = 'default' 
}: FeaslyLogoProps) {
  const getColorClass = () => {
    switch (variant) {
      case 'mono':
        return 'text-current';
      case 'white':
        return 'text-white';
      default:
        return 'text-primary';
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn(getColorClass(), className)}
      fill="currentColor"
    >
      {/* Feasly F Logo - Simplified geometric design */}
      <path d="
        M20 15 
        L80 15 
        L80 25 
        L30 25 
        L30 40 
        L70 40 
        L70 50 
        L30 50 
        L30 85 
        L20 85 
        Z
      " />
      
      {/* Optional gradient overlay for default variant */}
      {variant === 'default' && (
        <defs>
          <linearGradient id="feasly-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary-dark))" />
            <stop offset="50%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary-light))" />
          </linearGradient>
        </defs>
      )}
      
      {variant === 'default' && (
        <path 
          d="
            M20 15 
            L80 15 
            L80 25 
            L30 25 
            L30 40 
            L70 40 
            L70 50 
            L30 50 
            L30 85 
            L20 85 
            Z
          "
          fill="url(#feasly-gradient)"
        />
      )}
    </svg>
  );
}