import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AnimatedBackground } from "@/components/marketing/AnimatedBackground";
import { cn } from "@/lib/utils";

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage = ({ onSuccess }: AuthPageProps) => {
  console.log('AuthPage component mounted');
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Ensure theme is properly loaded
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', '160 70% 30%');
    document.documentElement.style.setProperty('--primary-light', '160 60% 42%');
    document.documentElement.style.setProperty('--primary-dark', '160 80% 20%');
  }, []);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-primary/10 via-background to-primary-light/5 flex items-center justify-center p-4 relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Feasly Logo in top-left corner */}
      <motion.div 
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Link to="/" className="flex items-center group">
          <motion.span 
            className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent transition-transform duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            F
          </motion.span>
        </Link>
      </motion.div>

      {/* Language and Theme switchers in top-right corner */}
      <motion.div 
        className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 sm:gap-3 z-20 bg-card/10 backdrop-blur-sm rounded-lg p-2 border border-primary/20"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <ThemeToggle />
        <LanguageSwitcher />
      </motion.div>

      <motion.div 
        className="w-full max-w-[90vw] sm:max-w-md relative z-10"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.8, 
          delay: 0.1,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        {isLoginMode ? (
          <LoginForm onToggleMode={toggleMode} onSuccess={onSuccess} />
        ) : (
          <SignUpForm onToggleMode={toggleMode} onSuccess={onSuccess} />
        )}
      </motion.div>
    </div>
  );
};