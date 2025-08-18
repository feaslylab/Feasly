import { LogOut, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const { isRTL } = useLanguage();
  const { t } = useTranslation(['common', 'auth']);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-medium text-sm">
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U"}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-popover border border-border shadow-md z-50" 
        align={isRTL ? "start" : "end"}
        side="bottom"
      >
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user?.user_metadata?.full_name || t('user', { ns: 'auth' })}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('viewAccount', { ns: 'auth' })}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('nav.settings')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('signOut', { ns: 'auth' })}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}