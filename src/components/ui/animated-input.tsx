import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, className, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    return (
      <div className="relative">
        {label && (
          <motion.div
            className="absolute left-3 pointer-events-none z-10"
            animate={{
              y: focused || hasValue ? -24 : 8,
              scale: focused || hasValue ? 0.85 : 1,
              color: focused ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Label className="bg-background px-1">{label}</Label>
          </motion.div>
        )}
        
        <motion.div
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Input
            ref={ref}
            className={cn(
              "transition-all duration-200",
              focused && "ring-2 ring-primary border-primary shadow-lg shadow-primary/10",
              error && "border-destructive ring-2 ring-destructive/20",
              className
            )}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            onChange={(e) => {
              setHasValue(e.target.value.length > 0);
              props.onChange?.(e);
            }}
            {...props}
          />
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-destructive mt-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

AnimatedInput.displayName = "AnimatedInput";