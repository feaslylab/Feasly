import { cn } from "@/lib/utils";

// Enhanced design tokens for consistent spacing and typography
export const designTokens = {
  // Spacing scale based on 4px grid
  spacing: {
    none: "0",
    xs: "0.25rem",    // 4px
    sm: "0.5rem",     // 8px
    md: "1rem",       // 16px
    lg: "1.5rem",     // 24px
    xl: "2rem",       // 32px
    "2xl": "3rem",    // 48px
    "3xl": "4rem",    // 64px
  },
  
  // Typography scale
  fontSize: {
    xs: "0.75rem",    // 12px
    sm: "0.875rem",   // 14px
    base: "1rem",     // 16px
    lg: "1.125rem",   // 18px
    xl: "1.25rem",    // 20px
    "2xl": "1.5rem",  // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem",  // 36px
  },
  
  // Border radius scale
  borderRadius: {
    none: "0",
    sm: "0.25rem",    // 4px
    md: "0.375rem",   // 6px
    lg: "0.5rem",     // 8px
    xl: "0.75rem",    // 12px
    "2xl": "1rem",    // 16px
    full: "9999px",
  },
  
  // Shadow scale
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  }
};

// Utility classes for consistent component styling
export const componentClasses = {
  // Card variants
  card: {
    base: "rounded-lg border bg-card text-card-foreground shadow-elevation-2",
    elevated: "rounded-lg border bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow",
    interactive: "rounded-lg border bg-card text-card-foreground shadow-elevation-2 hover:shadow-md transition-all duration-200 cursor-pointer",
  },
  
  // Button variants with consistent sizing
  button: {
    base: "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    sizes: {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 py-2",
      lg: "h-11 px-8 text-base",
    },
    variants: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      success: "bg-green-600 text-white hover:bg-green-700",
      warning: "bg-yellow-600 text-white hover:bg-yellow-700",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    }
  },
  
  // Input styling
  input: {
    base: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    error: "border-destructive focus-visible:ring-destructive",
    success: "border-green-500 focus-visible:ring-green-500",
  },
  
  // Layout containers
  container: {
    base: "w-full mx-auto px-4 sm:px-6 lg:px-8",
    constrained: "max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8",
    narrow: "max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8",
    wide: "max-w-none w-full mx-auto px-4 sm:px-6 lg:px-8",
  },
  
  // Grid layouts
  grid: {
    auto: "grid grid-cols-1 gap-4 sm:gap-6",
    responsive: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
    dashboard: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6",
    masonry: "columns-1 md:columns-2 lg:columns-3 gap-4 sm:gap-6",
  },
  
  // Typography styles
  typography: {
    h1: "text-3xl sm:text-4xl font-bold tracking-tight text-foreground",
    h2: "text-2xl sm:text-3xl font-semibold tracking-tight text-foreground", 
    h3: "text-xl sm:text-2xl font-semibold text-foreground",
    h4: "feasly-title",
    body: "text-base text-foreground leading-relaxed",
    bodySmall: "text-sm text-muted-foreground",
    caption: "text-xs text-muted-foreground uppercase tracking-wide",
  },
  
  // Status indicators
  status: {
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200", 
    error: "bg-red-100 text-red-800 border-red-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
    neutral: "bg-gray-100 text-gray-800 border-gray-200",
  },
  
  // Animation classes
  animation: {
    fadeIn: "animate-in fade-in duration-200",
    fadeOut: "animate-out fade-out duration-150",
    slideUp: "animate-in slide-in-from-bottom-2 duration-200",
    slideDown: "animate-in slide-in-from-top-2 duration-200",
    scaleIn: "animate-in zoom-in-95 duration-200",
    bounce: "animate-bounce",
  }
};

// Helper function to combine design system classes
export function withDesignSystem(
  baseClasses: string,
  variant?: string,
  size?: string,
  state?: string
): string {
  return cn(baseClasses, variant, size, state);
}

// Theme-aware color utilities
export const themeColors = {
  primary: {
    50: "hsl(var(--primary) / 0.05)",
    100: "hsl(var(--primary) / 0.1)",
    200: "hsl(var(--primary) / 0.2)",
    500: "hsl(var(--primary))",
    600: "hsl(var(--primary) / 0.9)",
    700: "hsl(var(--primary) / 0.8)",
  },
  success: {
    50: "hsl(142 76% 95%)",
    100: "hsl(142 76% 90%)",
    500: "hsl(142 76% 36%)",
    600: "hsl(142 76% 30%)",
  },
  warning: {
    50: "hsl(48 96% 95%)",
    100: "hsl(48 96% 90%)",
    500: "hsl(48 96% 53%)",
    600: "hsl(48 96% 47%)",
  },
  error: {
    50: "hsl(0 86% 97%)",
    100: "hsl(0 86% 95%)",
    500: "hsl(0 86% 57%)",
    600: "hsl(0 86% 51%)",
  }
};