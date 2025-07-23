import { motion, MotionProps } from "framer-motion";
import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileOptimizedMotionProps extends MotionProps {
  children: ReactNode;
  fallback?: ReactNode;
  enableOnMobile?: boolean;
}

export function MobileOptimizedMotion({ 
  children, 
  fallback, 
  enableOnMobile = true,
  ...motionProps 
}: MobileOptimizedMotionProps) {
  const isMobile = useIsMobile();

  // Disable animations on mobile devices that might have performance issues
  if (isMobile && !enableOnMobile) {
    return <div>{fallback || children}</div>;
  }

  // Use simplified animations for mobile
  const mobileOptimizedProps = isMobile ? {
    ...motionProps,
    transition: {
      ...motionProps.transition,
      duration: 0.3, // Shorter duration for mobile
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], // Proper easing array
    },
    style: {
      ...motionProps.style,
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden' as const,
      transform: 'translateZ(0)',
    }
  } : motionProps;

  return (
    <motion.div {...mobileOptimizedProps}>
      {children}
    </motion.div>
  );
}

// Hook to detect reduced motion preference
export function useReducedMotion() {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Enhanced scroll reveal for mobile
export function MobileScrollReveal({ 
  children, 
  className = "",
  disabled = false 
}: { 
  children: ReactNode; 
  className?: string;
  disabled?: boolean;
}) {
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();

  if (disabled || reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: isMobile ? 20 : 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ 
        once: true, 
        margin: isMobile ? "-10px" : "-50px",
        amount: 0.1
      }}
      transition={{ 
        duration: isMobile ? 0.3 : 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }}
      className={className}
      style={{
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)'
      }}
    >
      {children}
    </motion.div>
  );
}