import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignUpFormProps {
  onToggleMode: () => void;
  onSuccess: () => void;
}

export const SignUpForm = ({ onToggleMode, onSuccess }: SignUpFormProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isRTL } = useLanguage();
  const { t } = useTranslation('auth');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
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
    <Card className="w-full max-w-md shadow-elegant border-0 bg-primary/5 backdrop-blur-sm relative overflow-hidden">
      <CardHeader className={cn("text-center space-y-4", isRTL && "text-right")}>
        <div className="mx-auto flex items-center justify-center">
          <img 
            src="/lovable-uploads/4b3d51a1-21a0-4d40-a32f-16a402b2a939.png" 
            alt="Feasly Logo" 
            className="w-16 h-16 object-contain"
          />
        </div>
        <div>
          <CardTitle className="text-2xl font-semibold">{t('createAccount')}</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            {t('getStarted')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className={cn(isRTL && "text-right")}>{t('fullName')}</Label>
            <Input
              id="fullName"
              type="text"
              placeholder={t('enterFullName')}
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              required
              className={cn("h-11", isRTL && "text-right")}
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className={cn(isRTL && "text-right")}>{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('enterEmail')}
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
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
                placeholder={t('createPassword')}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className={cn(isRTL && "text-right")}>{t('confirmPassword')}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t('confirmYourPassword')}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
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
            {isLoading ? t('common.loading') : t('signup')}
          </Button>
        </form>

        <div className="mt-6">
          <Separator className="my-4" />
          <p className={cn("text-center text-sm text-muted-foreground", isRTL && "text-right")}>
            {t('alreadyHaveAccount')}{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-medium text-primary hover:text-primary-dark"
              onClick={onToggleMode}
            >
              {t('signInHere')}
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};