import { useState } from "react";
import { Link } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage = ({ onSuccess }: AuthPageProps) => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-primary-light via-background to-accent flex items-center justify-center p-4 relative">
      {/* Feasly Logo in top-left corner */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Link to="/" className="flex items-center">
          <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent hover:scale-105 transition-transform duration-200">
            Feasly
          </span>
        </Link>
      </div>

      {/* Language and Theme switchers in top-right corner */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 sm:gap-3 z-20 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-[90vw] sm:max-w-md relative z-10">
        {isLoginMode ? (
          <LoginForm onToggleMode={toggleMode} onSuccess={onSuccess} />
        ) : (
          <SignUpForm onToggleMode={toggleMode} onSuccess={onSuccess} />
        )}
      </div>
    </div>
  );
};