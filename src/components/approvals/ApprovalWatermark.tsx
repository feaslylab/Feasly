import { useApprovalStatus } from '@/hooks/useApprovalStatus';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

interface ApprovalWatermarkProps {
  projectId: string;
  scenarioId: string;
  scenarioName?: string;
  className?: string;
}

export function ApprovalWatermark({ 
  projectId, 
  scenarioId, 
  scenarioName,
  className 
}: ApprovalWatermarkProps) {
  const { isApproved, getLog } = useApprovalStatus(projectId, scenarioId);

  if (!isApproved) return null;

  const log = getLog();
  const approvalEntry = log.find(entry => entry.status === 'approved');
  const approvalDate = approvalEntry ? new Date(approvalEntry.changedAt) : new Date();

  return (
    <div 
      className={cn(
        "fixed top-4 right-4 z-50 pointer-events-none",
        "bg-success/5 border border-success/20 rounded-lg p-3",
        "backdrop-blur-sm shadow-lg",
        className
      )}
    >
      <div className="flex items-center gap-2 text-success">
        <CheckCircle className="h-5 w-5" />
        <div className="text-sm font-semibold">APPROVED</div>
      </div>
      
      <div className="text-xs text-success/80 mt-1 space-y-0.5">
        <div>{approvalDate.toLocaleDateString()} at {approvalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        {scenarioName && (
          <div className="font-medium">{scenarioName}</div>
        )}
        <div className="font-mono text-xs opacity-75">
          {projectId}:{scenarioId}
        </div>
      </div>
    </div>
  );
}