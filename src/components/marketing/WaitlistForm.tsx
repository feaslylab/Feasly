import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

interface WaitlistFormProps {
  onSubmit?: (email: string) => void;
  placeholder?: string;
  buttonText?: string;
  size?: "sm" | "lg";
  className?: string;
}

export function WaitlistForm({ 
  onSubmit, 
  placeholder = "Enter your email", 
  buttonText = "Join the Waitlist",
  size = "lg",
  className = "" 
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmit?.(email);
      setIsSubmitted(true);
      
      toast({
        title: "Thanks for joining!",
        description: "We'll let you know when Feasly opens up. Early users get onboarding support and locked-in pricing.",
      });
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`flex items-center gap-2 text-success ${className}`}>
        <Mail className="h-4 w-4" />
        <span className="text-sm font-medium">Thanks! You're on the list.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <Input
        type="email"
        placeholder={placeholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={size === "lg" ? "h-12" : ""}
        required
      />
      <Button 
        type="submit" 
        disabled={isLoading}
        size={size}
        className="shrink-0"
      >
        {isLoading ? "Joining..." : buttonText}
      </Button>
    </form>
  );
}