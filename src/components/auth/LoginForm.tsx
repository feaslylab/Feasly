import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, EyeOff, Building2, Loader2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  onToggleMode: () => void;
  onSuccess: () => void;
}

export const LoginForm = ({ onToggleMode, onSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const emailInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useTranslation('auth');
  const { isRTL } = useLanguage();

  // Auto-focus email field on mount
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  // Real-time email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      setEmailError(t('emailInvalid'));
    } else {
      setEmailError("");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: t('resetPassword'),
        description: t('enterEmailFirst'),
        variant: "destructive",
      });
      return;
    }

    if (emailError) {
      toast({
        title: t('resetPassword'),
        description: t('enterValidEmail'),
        variant: "destructive",
      });
      return;
    }

    setIsForgotPasswordLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: t('resetPassword'),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t('resetPassword'),
          description: t('resetPasswordEmailSent'),
        });
      }
    } catch (error) {
      toast({
        title: t('resetPassword'),
        description: t('resetPasswordError'),
        variant: "destructive",
      });
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-elegant border-0 bg-background/95 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary-light/5 pointer-events-none" />
      
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-primary-glow/20 to-transparent blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-gradient-to-tr from-primary-glow/10 to-transparent blur-3xl" />
      
      <CardHeader className={cn("text-center space-y-6 relative z-10", isRTL && "text-right")}>
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-glow transform transition-all duration-500 hover:scale-105 hover:shadow-lg">
          <Building2 className="w-8 h-8 text-primary-foreground" />
        </div>
        <div>
          <CardTitle className="text-3xl font-semibold tracking-tight">{t('welcomeBack')}</CardTitle>
          <CardDescription className="text-muted-foreground mt-3 text-base">
            {t('loginToAccount')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className={cn("text-sm font-medium", isRTL && "text-right")}>{t('email')}</Label>
            <div className="relative group">
              <Input
                ref={emailInputRef}
                id="email"
                type="email"
                placeholder={t('enterEmail')}
                value={email}
                onChange={handleEmailChange}
                required
                className={cn(
                  "h-12 transition-all duration-200 bg-background/50 backdrop-blur-sm border-border/60",
                  "focus:border-primary/40 focus:ring-primary/20 focus:bg-background/80",
                  "group-hover:border-primary/30",
                  isRTL ? "pr-11 text-right" : "pl-11",
                  emailError && "border-destructive focus-visible:ring-destructive"
                )}
                dir={isRTL ? "rtl" : "ltr"}
              />
              <div className={cn(
                "absolute top-1/2 -translate-y-1/2 transition-colors duration-200",
                isRTL ? "right-3" : "left-3",
                "group-focus-within:text-primary"
              )}>
                <Mail className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
            </div>
            {emailError && (
              <p className={cn(
                "text-xs text-destructive animate-fade-in",
                isRTL && "text-right"
              )}>
                {emailError}
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="password" className={cn("text-sm font-medium", isRTL && "text-right")}>{t('password')}</Label>
            <div className="relative group">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t('enterPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={cn(
                  "h-12 transition-all duration-200 bg-background/50 backdrop-blur-sm border-border/60",
                  "focus:border-primary/40 focus:ring-primary/20 focus:bg-background/80",
                  "group-hover:border-primary/30",
                  isRTL ? "pl-10 text-right" : "pr-10",
                )}
                dir={isRTL ? "rtl" : "ltr"}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-auto p-1 rounded-full hover:bg-primary/5",
                  isRTL ? "left-2" : "right-2"
                )}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </Button>
            </div>
          </div>

          {/* Remember Me and Forgot Password */}
          <div className={cn(
            "flex items-center justify-between text-sm",
            isRTL && "flex-row-reverse"
          )}>
            <div className={cn("flex items-center space-x-2 group", isRTL && "space-x-reverse")}>
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className={cn(
                  "h-4 w-4 border-border/70 transition-colors duration-200",
                  "data-[state=checked]:bg-gradient-to-r from-primary to-primary-dark",
                  "data-[state=checked]:border-primary/0 shadow-sm",
                  "focus-visible:ring-primary/20 focus-visible:ring-offset-0"
                )}
              />
              <Label
                htmlFor="remember"
                className={cn(
                  "cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors duration-200",
                  isRTL && "text-right"
                )}
              >
                {t('rememberMe')}
              </Label>
            </div>
            
            <Button
              type="button"
              variant="link"
              className={cn(
                "p-0 h-auto text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-200",
                "hover:underline hover:underline-offset-4"
              )}
              onClick={handleForgotPassword}
              disabled={isForgotPasswordLoading}
            >
              {isForgotPasswordLoading ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {t('sending')}
                </span>
              ) : (
                t('forgotPassword')
              )}
            </Button>
          </div>

          <Button
            type="submit"
            className={cn(
              "w-full h-12 bg-gradient-to-r from-primary to-primary-dark",
              "hover:from-primary-glow hover:to-primary",
              "shadow-lg hover:shadow-xl transition-all duration-300",
              "hover:scale-[1.02] active:scale-[0.98]",
              "text-base font-semibold tracking-wide",
              "relative overflow-hidden group",
              "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
              "disabled:hover:scale-100 disabled:shadow-lg disabled:opacity-50"
            )}
            disabled={isLoading || !!emailError}
          >
            {isLoading ? (
              <span className="flex items-center gap-2 relative z-10">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('signingIn')}
              </span>
            ) : (
              <span className="relative z-10">{t('login')}</span>
            )}
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full opacity-30" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground/60 font-medium tracking-wider">
                {t('or', 'OR')}
              </span>
            </div>
          </div>
          <p className={cn(
            "text-center text-sm text-muted-foreground mt-6",
            isRTL && "text-right"
          )}>
            {t('dontHaveAccount')}{" "}
            <Button
              variant="link"
              className={cn(
                "p-0 h-auto font-semibold text-primary hover:text-primary-dark transition-colors duration-200",
                "hover:underline hover:underline-offset-4"
              )}
              onClick={onToggleMode}
            >
              {t('signUpHere')}
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};