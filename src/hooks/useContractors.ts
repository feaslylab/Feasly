import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface Contractor {
  id?: string;
  project_id: string;
  name: string;
  phase: 'design' | 'foundation' | 'structure' | 'mep' | 'facade' | 'fit_out' | 'landscaping' | 'other';
  amount: number;
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  risk_rating: 'low' | 'medium' | 'high';
  contact_person?: string;
  contact_email?: string;
  start_date?: string;
  expected_completion?: string;
  actual_completion?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const PHASE_OPTIONS = [
  { value: 'design', label: 'Design' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'structure', label: 'Structure' },
  { value: 'mep', label: 'MEP' },
  { value: 'facade', label: 'Facade' },
  { value: 'fit_out', label: 'Fit-out' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'other', label: 'Other' },
];

export const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const RISK_OPTIONS = [
  { value: 'low', label: 'Low Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'high', label: 'High Risk' },
];

export function useContractors(projectId: string) {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  // Fetch contractors for the project
  const fetchContractors = async (retry = false) => {
    // Don't fetch if projectId is not valid
    if (!projectId || projectId.trim() === '') {
      logger.warn('Invalid projectId provided to useContractors', { projectId }, 'useContractors');
      setIsLoading(false);
      setError('Invalid project ID');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      logger.debug('Fetching contractors for project', { projectId }, 'useContractors');
      
      const { data, error } = await supabase
        .from('project_contractors')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setContractors((data || []) as Contractor[]);
      setRetryCount(0); // Reset retry count on success
      logger.info('Successfully fetched contractors', { count: data?.length || 0 }, 'useContractors');
      
    } catch (error: any) {
      logger.error('Error fetching contractors', error, 'useContractors');
      setError(error.message || 'Failed to load contractors');
      
      // Auto-retry for mobile network issues (up to 2 retries)
      if (!retry && retryCount < 2) {
        console.log('Retrying contractor fetch...', retryCount + 1);
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchContractors(true), 1000 * (retryCount + 1));
        return;
      }
      
      toast({
        title: 'Error',
        description: 'Failed to load contractors. Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new contractor
  const createContractor = async (contractor: Omit<Contractor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('project_contractors')
        .insert(contractor)
        .select()
        .single();

      if (error) throw error;

      setContractors(prev => [data as Contractor, ...prev]);

      toast({
        title: 'Success',
        description: 'Contractor added successfully',
      });

      return data;
    } catch (error) {
      console.error('Error creating contractor:', error);
      toast({
        title: 'Error',
        description: 'Failed to add contractor',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Update a contractor
  const updateContractor = async (id: string, updates: Partial<Contractor>) => {
    try {
      const { data, error } = await supabase
        .from('project_contractors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setContractors(prev => prev.map(c => c.id === id ? data as Contractor : c));

      toast({
        title: 'Success',
        description: 'Contractor updated successfully',
      });

      return data;
    } catch (error) {
      console.error('Error updating contractor:', error);
      toast({
        title: 'Error',
        description: 'Failed to update contractor',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Delete a contractor
  const deleteContractor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_contractors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContractors(prev => prev.filter(c => c.id !== id));

      toast({
        title: 'Success',
        description: 'Contractor deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting contractor:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete contractor',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Get contractor statistics and analytics
  const getContractorStats = () => {
    const total = contractors.length;
    const totalValue = contractors.reduce((sum, c) => sum + c.amount, 0);
    
    const byStatus = contractors.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byRisk = contractors.reduce((acc, c) => {
      acc[c.risk_rating] = {
        count: (acc[c.risk_rating]?.count || 0) + 1,
        value: (acc[c.risk_rating]?.value || 0) + c.amount
      };
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    const byPhase = contractors.reduce((acc, c) => {
      acc[c.phase] = (acc[c.phase] || 0) + c.amount;
      return acc;
    }, {} as Record<string, number>);

    // Calculate completion percentage
    const completed = byStatus.completed || 0;
    const inProgress = byStatus.in_progress || 0;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const progressPercentage = total > 0 ? Math.round(((completed + inProgress) / total) * 100) : 0;

    return {
      total,
      totalValue,
      byStatus,
      byRisk,
      byPhase,
      completionPercentage,
      progressPercentage,
    };
  };

  // Get risk warnings
  const getRiskWarnings = () => {
    const warnings = [];
    const stats = getContractorStats();
    
    // Warning 1: >30% of contracts are high risk
    const highRiskCount = stats.byRisk.high?.count || 0;
    const highRiskPercentage = stats.total > 0 ? (highRiskCount / stats.total) * 100 : 0;
    
    if (highRiskPercentage > 30) {
      warnings.push({
        type: 'high_risk_exposure',
        severity: 'high',
        title: 'High Risk Exposure',
        message: `${highRiskPercentage.toFixed(1)}% of contracts are high risk (${highRiskCount}/${stats.total})`,
        value: stats.byRisk.high?.value || 0
      });
    }

    // Warning 2: Check for long-running in-progress contracts
    const now = new Date();
    const longRunningContractors = contractors.filter(c => {
      if (c.status !== 'in_progress' || !c.start_date) return false;
      const startDate = new Date(c.start_date);
      const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 120;
    });

    if (longRunningContractors.length > 0) {
      warnings.push({
        type: 'long_running_contracts',
        severity: 'medium',
        title: 'Long-Running Contracts',
        message: `${longRunningContractors.length} contractor(s) in progress for over 120 days`,
        contractors: longRunningContractors
      });
    }

    // Warning 3: High value at risk
    const highRiskValue = stats.byRisk.high?.value || 0;
    if (highRiskValue > stats.totalValue * 0.25) {
      warnings.push({
        type: 'high_value_at_risk',
        severity: 'high',
        title: 'High Value at Risk',
        message: `${((highRiskValue / stats.totalValue) * 100).toFixed(1)}% of contract value is high risk`,
        value: highRiskValue
      });
    }

    return warnings;
  };

  // Export contractors to CSV
  const exportToCSV = () => {
    const headers = [
      'Name',
      'Phase',
      'Amount',
      'Status',
      'Risk Rating',
      'Contact Person',
      'Contact Email',
      'Start Date',
      'Expected Completion',
      'Actual Completion',
      'Notes'
    ];

    const csvContent = [
      headers.join(','),
      ...contractors.map(c => [
        `"${c.name}"`,
        c.phase,
        c.amount,
        c.status,
        c.risk_rating,
        `"${c.contact_person || ''}"`,
        `"${c.contact_email || ''}"`,
        c.start_date || '',
        c.expected_completion || '',
        c.actual_completion || '',
        `"${c.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `contractors_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export Successful',
      description: 'Contractor data exported to CSV',
    });
  };

  useEffect(() => {
    // Only fetch if projectId is valid and not empty
    if (projectId && projectId.trim() !== '') {
      fetchContractors();
    } else {
      setIsLoading(false);
      setContractors([]);
    }
  }, [projectId]);

  return {
    contractors,
    isLoading,
    error,
    retryCount,
    createContractor,
    updateContractor,
    deleteContractor,
    getContractorStats,
    getRiskWarnings,
    exportToCSV,
    refreshContractors: fetchContractors
  };
}