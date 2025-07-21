import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage = ({ onSuccess }: AuthPageProps) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { isRTL } = useLanguage();

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <div 
      className={cn(
        "min-h-screen bg-gradient-to-br from-primary-light via-background to-accent flex items-center justify-center p-4",
        isRTL && "rtl"
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Language and Theme switchers in top-right corner */}
      <div className={cn(
        "fixed top-4 flex items-center gap-2 z-10",
        isRTL ? "left-4" : "right-4"
      )}>
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        {isLoginMode ? (
          <LoginForm onToggleMode={toggleMode} onSuccess={onSuccess} />
        ) : (
          <SignUpForm onToggleMode={toggleMode} onSuccess={onSuccess} />
        )}
      </div>
    </div>
  );
};