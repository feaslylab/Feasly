import ViewSwitch from '@/components/layout/ViewSwitch';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function Header() {
  const { layoutSpacing } = useResponsiveLayout();

  return (
    <header 
      className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
      style={{ height: `${layoutSpacing.headerHeight}px` }}
    >
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="ml-auto flex items-center gap-3">
          <ViewSwitch />
        </div>
      </div>
    </header>
  );
}