import { useState } from "react";
import { AlertTriangle, Eye, Users, Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

interface ProjectVisibilityControlProps {
  isPublic: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
  projectName: string;
  hasComments?: boolean;
  hasTeamMembers?: boolean;
}

export const ProjectVisibilityControl = ({ 
  isPublic, 
  onVisibilityChange, 
  projectName,
  hasComments = false,
  hasTeamMembers = false
}: ProjectVisibilityControlProps) => {
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingVisibility, setPendingVisibility] = useState<boolean | null>(null);

  const handleVisibilityToggle = (newIsPublic: boolean) => {
    if (newIsPublic && (hasComments || hasTeamMembers)) {
      setPendingVisibility(newIsPublic);
      setShowWarningDialog(true);
    } else {
      onVisibilityChange(newIsPublic);
    }
  };

  const confirmVisibilityChange = () => {
    if (pendingVisibility !== null) {
      onVisibilityChange(pendingVisibility);
      setPendingVisibility(null);
    }
    setShowWarningDialog(false);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="project-visibility" className="text-sm font-medium">
              Project Visibility
            </Label>
            <p className="text-sm text-muted-foreground">
              Control who can view this project
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="project-visibility"
              checked={isPublic}
              onCheckedChange={handleVisibilityToggle}
            />
            <Label htmlFor="project-visibility" className="text-sm">
              {isPublic ? 'Public' : 'Private'}
            </Label>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          {isPublic ? (
            <>
              <Eye className="h-4 w-4" />
              <span>Anyone can view this project</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>Only team members can view this project</span>
            </>
          )}
        </div>

        {isPublic && (hasComments || hasTeamMembers) && (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">
              Security Notice
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              <div className="space-y-2">
                <p>This project is public, but comments remain private and are only visible to team members.</p>
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-3 w-3" />
                  <span>Comments are protected by team-based access control</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Make Project Public?</span>
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <p>
                You're about to make "{projectName}" publicly visible. Here's what this means:
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <Eye className="h-4 w-4 mt-0.5 text-blue-500" />
                  <div>
                    <p className="font-medium">✅ Public Access</p>
                    <p className="text-muted-foreground">Project details, financials, and data will be visible to anyone</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Lock className="h-4 w-4 mt-0.5 text-green-500" />
                  <div>
                    <p className="font-medium">🔒 Comments Protected</p>
                    <p className="text-muted-foreground">All comments remain private and only visible to team members</p>
                  </div>
                </div>
                
                {hasTeamMembers && (
                  <div className="flex items-start space-x-2">
                    <Users className="h-4 w-4 mt-0.5 text-purple-500" />
                    <div>
                      <p className="font-medium">👥 Team Access</p>
                      <p className="text-muted-foreground">Team members retain full access to all project features</p>
                    </div>
                  </div>
                )}
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Important:</strong> Make sure this project doesn't contain sensitive financial information that shouldn't be public.
                </AlertDescription>
              </Alert>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowWarningDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmVisibilityChange}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Make Public
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};