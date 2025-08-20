import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarState } from "@/hooks/useSidebarState";

export default function SidebarHeader() {
  const { toggleSidebar, isCollapsed } = useSidebarState();

  return (
    <div className="flex items-center h-12 px-4 border-b border-sidebar-border justify-between">
      {/* App Logo/Title */}
      {!isCollapsed && (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">F</span>
          </div>
          <span className="font-semibold text-sidebar-foreground">Feasly</span>
        </div>
      )}
      
      {/* Toggle Button - Always visible */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
          "h-8 w-8 flex items-center justify-center rounded-md",
          isCollapsed && "mx-auto"
        )}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <Menu className="h-4 w-4" />
      </button>
    </div>
  );
}