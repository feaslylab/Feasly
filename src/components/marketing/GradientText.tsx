
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  fallbackColor?: string;
}

export function GradientText({ 
  children, 
  className = "",
  fallbackColor = "text-foreground"
}: GradientTextProps) {
  return (
    <span 
      className={cn(
        "bg-gradient-to-r from-primary via-primary to-primary-light bg-clip-text text-transparent",
        "supports-[background-clip:text]:text-transparent",
        "supports-[background-clip:text]:bg-clip-text",
        fallbackColor,
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
