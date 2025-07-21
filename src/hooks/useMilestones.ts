import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Milestone {
  id?: string;
  project_id: string;
  label: string;
  target_date: string;
  status: 'planned' | 'in_progress' | 'completed';
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export function useMilestones(projectId: string) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch milestones for the project
  const fetchMilestones = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('target_date', { ascending: true });

      if (error) throw error;
      setMilestones((data || []) as Milestone[]);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      toast({
        title: 'Error',
        description: 'Failed to load milestones',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new milestone
  const createMilestone = async (milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .insert(milestone)
        .select()
        .single();

      if (error) throw error;

      setMilestones(prev => [...prev, data as Milestone].sort((a, b) => 
        new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
      ));

      toast({
        title: 'Success',
        description: 'Milestone created successfully',
      });

      return data;
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast({
        title: 'Error',
        description: 'Failed to create milestone',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Update a milestone
  const updateMilestone = async (id: string, updates: Partial<Milestone>) => {
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setMilestones(prev => prev.map(m => m.id === id ? data as Milestone : m)
        .sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime())
      );

      toast({
        title: 'Success',
        description: 'Milestone updated successfully',
      });

      return data;
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast({
        title: 'Error',
        description: 'Failed to update milestone',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Delete a milestone
  const deleteMilestone = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_milestones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMilestones(prev => prev.filter(m => m.id !== id));

      toast({
        title: 'Success',
        description: 'Milestone deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting milestone:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete milestone',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Get milestone statistics
  const getMilestoneStats = () => {
    const now = new Date();
    const overdue = milestones.filter(m => 
      m.status !== 'completed' && new Date(m.target_date) < now
    ).length;
    
    const completed = milestones.filter(m => m.status === 'completed').length;
    const total = milestones.length;
    
    const nextMilestone = milestones.find(m => 
      m.status !== 'completed' && new Date(m.target_date) >= now
    );

    return {
      total,
      completed,
      overdue,
      nextMilestone,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  useEffect(() => {
    if (projectId) {
      fetchMilestones();
    }
  }, [projectId]);

  return {
    milestones,
    isLoading,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    getMilestoneStats,
    refreshMilestones: fetchMilestones
  };
}