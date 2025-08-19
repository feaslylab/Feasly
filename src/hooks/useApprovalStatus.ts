import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export type ApprovalStatus = 'draft' | 'under_review' | 'approved';

export interface ApprovalLogEntry {
  changedAt: string;
  status: ApprovalStatus;
  changedBy: string;
  note?: string;
}

interface UseApprovalStatusReturn {
  status: ApprovalStatus;
  setStatus: (newStatus: ApprovalStatus, note?: string) => void;
  getLog: () => ApprovalLogEntry[];
  isApproved: boolean;
  isUnderReview: boolean;
  isDraft: boolean;
}

export function useApprovalStatus(projectId: string, scenarioId: string): UseApprovalStatusReturn {
  const [status, setStatusState] = useState<ApprovalStatus>('draft');
  const { toast } = useToast();

  const statusKey = `approval_status:${projectId}:${scenarioId}`;
  const logKey = `approval_log:${projectId}:${scenarioId}`;

  // Load status from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(statusKey);
      if (stored && ['draft', 'under_review', 'approved'].includes(stored)) {
        setStatusState(stored as ApprovalStatus);
      }
    } catch (error) {
      console.error('Error loading approval status:', error);
    }
  }, [statusKey]);

  const getLog = useCallback((): ApprovalLogEntry[] => {
    try {
      const stored = localStorage.getItem(logKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading approval log:', error);
      return [];
    }
  }, [logKey]);

  const setStatus = useCallback((newStatus: ApprovalStatus, note?: string) => {
    try {
      // Update status
      setStatusState(newStatus);
      localStorage.setItem(statusKey, newStatus);

      // Add to log
      const logEntry: ApprovalLogEntry = {
        changedAt: new Date().toISOString(),
        status: newStatus,
        changedBy: 'Anonymous', // Placeholder for future user auth
        note
      };

      const currentLog = getLog();
      const updatedLog = [...currentLog, logEntry];
      localStorage.setItem(logKey, JSON.stringify(updatedLog));

      // Show toast notification
      const statusLabels = {
        draft: 'Draft',
        under_review: 'Under Review',
        approved: 'Approved'
      };

      toast({
        title: 'Status Updated',
        description: `Scenario status changed to ${statusLabels[newStatus]}`,
        duration: 3000,
      });

    } catch (error) {
      console.error('Error updating approval status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update approval status',
        variant: 'destructive',
      });
    }
  }, [statusKey, logKey, getLog, toast]);

  return {
    status,
    setStatus,
    getLog,
    isApproved: status === 'approved',
    isUnderReview: status === 'under_review',
    isDraft: status === 'draft'
  };
}