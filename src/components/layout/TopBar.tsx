import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { UserMenu } from '@/components/layout/UserMenu';
import { PATHS } from '@/routes/paths';
import { useLanguage } from '@/contexts/LanguageContext';

export function TopBar() {
  const { isRTL } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link 
          to={PATHS.dashboard} 
          className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
        >
          <img 
            src="/lovable-uploads/4b3d51a1-21a0-4d40-a32f-16a402b2a939.png" 
            alt="Feasly" 
            className="w-8 h-8 object-contain"
          />
          <span className="hidden sm:inline">Feasly</span>
        </Link>

        {/* Center: Global Search (placeholder) */}
        <div className="hidden md:flex flex-1 max-w-sm mx-8">
          <div className="relative w-full">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              placeholder="Search projects, models..."
              className={`w-full ${isRTL ? 'pr-10' : 'pl-10'}`}
              disabled
            />
          </div>
        </div>

        {/* Right: Language + User Menu */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}