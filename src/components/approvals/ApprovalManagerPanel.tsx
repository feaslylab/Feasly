import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronDown, Shield } from 'lucide-react';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';
import { useApprovalStatus, type ApprovalStatus } from '@/hooks/useApprovalStatus';

interface ApprovalManagerPanelProps {
  projectId: string;
  scenarioId: string;
}

export function ApprovalManagerPanel({ projectId, scenarioId }: ApprovalManagerPanelProps) {
  const { status, setStatus } = useApprovalStatus(projectId, scenarioId);
  const [pendingStatus, setPendingStatus] = useState<ApprovalStatus | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const statusOptions: { value: ApprovalStatus; label: string; description: string }[] = [
    {
      value: 'draft',
      label: 'Set to Draft',
      description: 'Mark as work in progress. All editing capabilities enabled.'
    },
    {
      value: 'under_review',
      label: 'Submit for Review',
      description: 'Submit scenario for stakeholder review and approval.'
    },
    {
      value: 'approved',
      label: 'Mark as Approved',
      description: 'Finalize and lock scenario. Inputs will become read-only.'
    }
  ];

  const handleStatusChange = (newStatus: ApprovalStatus) => {
    if (newStatus === 'approved' || status === 'approved') {
      setPendingStatus(newStatus);
      setShowConfirmation(true);
    } else {
      setStatus(newStatus);
    }
  };

  const confirmStatusChange = () => {
    if (pendingStatus) {
      setStatus(pendingStatus);
      setPendingStatus(null);
    }
    setShowConfirmation(false);
  };

  const getConfirmationContent = () => {
    if (pendingStatus === 'approved') {
      return {
        title: 'Approve Scenario',
        description: 'This will mark the scenario as approved and lock all inputs. You can still view and export data, but no modifications will be allowed. Are you sure you want to proceed?'
      };
    } else if (status === 'approved') {
      return {
        title: 'Unlock Scenario',
        description: 'This will remove the approved status and allow editing again. This action will be logged in the audit trail. Are you sure you want to proceed?'
      };
    }
    return { title: '', description: '' };
  };

  const confirmationContent = getConfirmationContent();

  return (
    <>
      <div className="flex items-center gap-2">
        <ApprovalStatusBadge status={status} />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="h-4 w-4" />
              <span className="sr-only">Change approval status</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-64 bg-background border border-border shadow-lg z-50"
          >
            <div className="px-3 py-2 text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Approval Status
            </div>
            <DropdownMenuSeparator />
            
            {statusOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                disabled={option.value === status}
                className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent"
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {option.description}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="bg-background border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmationContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmStatusChange}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}