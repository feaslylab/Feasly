import ViewSwitch from '@/components/layout/ViewSwitch';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebarState } from '@/hooks/useSidebarState';

export default function Header() {
  const { isMobile, layoutSpacing } = useResponsiveLayout();
  const { toggleSidebar } = useSidebarState();

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-[var(--z-header)] border-b border-border bg-background/95 backdrop-blur-sm"
      style={{ height: `${layoutSpacing.headerHeight}px` }}
    >
      <div className="h-full px-4 flex items-center gap-3">
        {/* Mobile menu trigger */}
        {isMobile && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0 touch-none min-h-[40px] min-w-[40px]"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <div className="ml-auto flex items-center gap-3">
          <ViewSwitch />
        </div>
      </div>
    </header>
  );
}