import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eye, EyeOff, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  onToggleMode: () => void;
  onSuccess: () => void;
}

export const LoginForm = ({ onToggleMode, onSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation('auth');
  const { isRTL } = useLanguage();

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
    <Card className="w-full max-w-md shadow-medium">
      <CardHeader className={cn("text-center space-y-4", isRTL && "text-right")}>
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <CardTitle className="text-2xl font-semibold">{t('welcomeBack')}</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            {t('loginToAccount')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className={cn(isRTL && "text-right")}>{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('enterEmail')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={cn("h-11", isRTL && "text-right")}
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className={cn(isRTL && "text-right")}>{t('password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t('enterPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={cn("h-11", isRTL ? "pl-10 text-right" : "pr-10")}
                dir={isRTL ? "rtl" : "ltr"}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-auto p-1 hover:bg-transparent",
                  isRTL ? "left-2" : "right-2"
                )}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : t('login')}
          </Button>
        </form>

        <div className="mt-6">
          <Separator className="my-4" />
          <p className={cn("text-center text-sm text-muted-foreground", isRTL && "text-right")}>
            {t('dontHaveAccount')}{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-medium text-primary hover:text-primary-dark"
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