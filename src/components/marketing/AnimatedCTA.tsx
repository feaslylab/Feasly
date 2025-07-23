import { motion } from "framer-motion";
import { ReactNode, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface AnimatedCTAProps {
  children: ReactNode;
  className?: string;
  pulse?: boolean;
}

export function AnimatedCTA({ children, className = "", pulse = false }: AnimatedCTAProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {pulse && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-primary/20"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      {children}
    </motion.div>
  );
}

interface PulsingButtonProps {
  children: ReactNode;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "lg" | "default";
  className?: string;
  asChild?: boolean;
}

export function PulsingButton({ children, variant = "default", size = "default", className = "", asChild }: PulsingButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative"
    >
      {/* Pulsing glow */}
      <motion.div
        className="absolute inset-0 rounded-md bg-primary/20 blur-sm"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <Button variant={variant} size={size} className={`relative z-10 ${className}`} asChild={asChild}>
        {children}
      </Button>
    </motion.div>
  );
}

export function NumberCounter({ target, duration = 2, suffix = "" }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * easeOutProgress));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const element = document.querySelector(`[data-counter="${target}"]`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span data-counter={target}>
      {count}{suffix}
    </span>
  );
}