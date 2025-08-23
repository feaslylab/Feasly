import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface PortfolioWeightInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const PortfolioWeightInput = ({ 
  value, 
  onChange, 
  disabled = false 
}: PortfolioWeightInputProps) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isValid, setIsValid] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const validateAndUpdate = (newValue: string) => {
    setInputValue(newValue);
    
    // Allow empty input temporarily
    if (newValue === '') {
      setIsValid(true);
      return;
    }

    const numValue = parseFloat(newValue);
    
    // Validate: must be a positive number
    if (isNaN(numValue) || numValue <= 0) {
      setIsValid(false);
      return;
    }

    // Warn if weight is very high
    if (numValue > 10) {
      toast({
        title: "High Weight Warning",
        description: "Weight values above 10 may produce unexpected results.",
        variant: "destructive",
      });
    }

    setIsValid(true);
    onChange(numValue);
  };

  const handleBlur = () => {
    // On blur, if invalid or empty, reset to current valid value
    if (!isValid || inputValue === '') {
      setInputValue(value.toString());
      setIsValid(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey) || 
        (e.keyCode === 67 && e.ctrlKey) || 
        (e.keyCode === 86 && e.ctrlKey) || 
        (e.keyCode === 88 && e.ctrlKey) ||
        // Allow decimal point
        e.key === '.') {
      return;
    }
    
    // Ensure it's a number
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-1">
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => validateAndUpdate(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? "Auto" : "1.0"}
        className={!isValid ? "border-destructive" : ""}
      />
      
      {disabled && (
        <p className="text-xs text-muted-foreground">
          Equal weighting mode - weights are automatically calculated
        </p>
      )}
      
      {!isValid && !disabled && (
        <p className="text-xs text-destructive">
          Weight must be a positive number
        </p>
      )}
    </div>
  );
};