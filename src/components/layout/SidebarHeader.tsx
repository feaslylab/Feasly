import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarState } from "@/hooks/useSidebarState";

export default function SidebarHeader() {
  const { toggleSidebar, isCollapsed, clearStorageAndReset } = useSidebarState();

  const handleToggle = () => {
    console.log('🔧 [HEADER] Toggle Button Clicked - isCollapsed:', isCollapsed, 'timestamp:', Date.now());
    toggleSidebar();
  };

  const handleClearStorage = () => {
    console.log('🧹 Clear Storage Button Clicked');
    clearStorageAndReset();
  };

  console.log('🔧 [HEADER] Render - isCollapsed:', isCollapsed, 'timestamp:', Date.now());

  return (
    <div className="flex items-center h-12 px-2 border-b border-border justify-between">
      {/* Collapse Toggle - Always visible */}
      <button
        onClick={handleToggle}
        className={cn(
          "text-muted-foreground hover:text-foreground transition-colors",
          "h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent"
        )}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <Menu className="h-5 w-5" />
      </button>
      
      {/* Debug button to clear localStorage - only visible when expanded */}
      {!isCollapsed && (
        <button
          onClick={handleClearStorage}
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded"
          title="Clear localStorage (debug)"
        >
          🧹
        </button>
      )}
    </div>
  );
}