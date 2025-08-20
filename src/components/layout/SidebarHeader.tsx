import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarState } from "@/hooks/useSidebarState";

export default function SidebarHeader() {
  const { toggleSidebar, isCollapsed } = useSidebarState();

  return (
    <div className="flex items-center h-12 px-4 border-b border-border justify-center">
      {/* Collapse Toggle - Always visible */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "text-muted-foreground hover:text-foreground transition-colors",
          "h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent"
        )}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
}