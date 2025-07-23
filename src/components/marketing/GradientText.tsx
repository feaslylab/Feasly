
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  fallbackColor?: string;
  animated?: boolean;
}

export function GradientText({ 
  children, 
  className = "",
  fallbackColor = "text-foreground",
  animated = false
}: GradientTextProps) {
  return (
    <span 
      className={cn(
        animated 
          ? "bg-gradient-to-r from-primary via-primary-light to-primary-dark bg-clip-text text-transparent animate-gradient-x"
          : "bg-gradient-to-r from-primary via-primary to-primary-light bg-clip-text text-transparent",
        "supports-[background-clip:text]:text-transparent",
        "supports-[background-clip:text]:bg-clip-text",
        fallbackColor,
        animated && "bg-[length:200%_200%]",
        className
      )}
      style={{
        // Fallback for browsers that don't support background-clip: text
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  );
}
