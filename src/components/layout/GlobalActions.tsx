import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { PresenceDots } from "@/components/collaboration/PresenceDots";
import { useAlerts } from "@/hooks/useAlerts";
import { useSelectionStore } from "@/state/selectionStore";

interface GlobalActionsProps {
  onAlertsClick: () => void;
}

export default function GlobalActions({ onAlertsClick }: GlobalActionsProps) {
  const { unreadCount } = useAlerts();
  const { projectId } = useSelectionStore();

  return (
    <div className="flex items-center gap-2">
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Language Switcher */}
      <LanguageSwitcher />
      
      {/* Alerts Bell */}
      <div className="relative">
        <Button
          onClick={onAlertsClick}
          variant="ghost"
          size="sm"
          className="relative p-2"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </div>
      
      {/* Presence Dots */}
      {projectId && <PresenceDots />}
    </div>
  );
}