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
        "min-h-screen bg-gradient-to-br from-primary-light via-background to-accent flex items-center justify-center p-4 relative",
        isRTL && "rtl"
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Language and Theme switchers in top-right corner */}
      <div className={cn(
        "absolute top-6 flex items-center gap-3 z-20 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20",
        isRTL ? "left-6" : "right-6"
      )}>
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md relative z-10">
        {isLoginMode ? (
          <LoginForm onToggleMode={toggleMode} onSuccess={onSuccess} />
        ) : (
          <SignUpForm onToggleMode={toggleMode} onSuccess={onSuccess} />
        )}
      </div>
    </div>
  );
};