import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage = ({ onSuccess }: AuthPageProps) => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-accent flex items-center justify-center p-4">
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