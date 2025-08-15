import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface SecurityWarningProps {
  title: string;
  description: string;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const SecurityWarning = ({ title, description, onDismiss, action }: SecurityWarningProps) => {
  return (
    <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800 dark:text-orange-200">{title}</AlertTitle>
      <AlertDescription className="text-orange-700 dark:text-orange-300 mt-2">
        {description}
        {(action || onDismiss) && (
          <div className="flex gap-2 mt-3">
            {action && (
              <Button
                variant="outline"
                size="sm"
                onClick={action.onClick}
                className="border-orange-300 text-orange-800 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-200 dark:hover:bg-orange-900"
              >
                {action.label}
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="text-orange-600 hover:bg-orange-100 dark:text-orange-400 dark:hover:bg-orange-900"
              >
                Dismiss
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};