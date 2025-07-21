import { Building2, BarChart3, FolderOpen, Settings, LogOut, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

const navigation = [
  { nameKey: "nav.dashboard", href: "/dashboard", icon: BarChart3 },
  { nameKey: "nav.projects", href: "/projects", icon: FolderOpen },
  { nameKey: "nav.settings", href: "/settings", icon: Settings },
];

export const Sidebar = () => {
  const { signOut, user } = useAuth();
  const { t, isRTL } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    // Navigation will be handled automatically by the auth state change
  };

  return (
    <div className={cn("flex h-full flex-col bg-card border-border", isRTL ? "border-l" : "border-r")}>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className={cn("flex-1", isRTL && "text-right")}>
          <h1 className="text-lg font-semibold text-foreground">ProjectPro</h1>
          <p className="text-xs text-muted-foreground">Financial Modeling</p>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>

      {/* Quick Action */}
      <div className="p-4">
        <Button 
          asChild
          className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
        >
          <NavLink to="/projects/new">
            <Plus className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
            {t('nav.newProject')}
          </NavLink>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.nameKey}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
                isRTL && "flex-row-reverse"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {t(item.nameKey)}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 text-sm">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-medium">
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {user?.user_metadata?.full_name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Separator className="my-2" />
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full text-muted-foreground hover:text-foreground",
            isRTL ? "justify-end" : "justify-start"
          )}
          onClick={handleSignOut}
        >
          <LogOut className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
          {t('nav.signOut')}
        </Button>
      </div>
    </div>
  );
};