import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { TM } from "@/components/ui/trademark";
import { useSidebarState } from "@/hooks/useSidebarState";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SidebarHeader() {
  const { isCollapsed, toggleSidebar } = useSidebarState();
  const { isRTL } = useLanguage();

  return (
    <div className="flex items-center h-12 px-4 border-b border-border gap-2">
      {/* Feasly Logo */}
      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
        <img 
          src="/lovable-uploads/c54aee74-e595-47d1-9bf8-b8efef6fae7d.png" 
          alt="Feasly Logo" 
          className="w-6 h-6 object-contain"
        />
      </div>
      
      {/* Brand Text */}
      {!isCollapsed && (
        <span className="text-lg font-semibold text-foreground">
          Feasly<TM />
        </span>
      )}
      
      {/* Collapse Toggle - Right aligned, mobile only */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "ml-auto lg:hidden text-muted-foreground hover:text-foreground transition-colors",
          "h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent"
        )}
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
}