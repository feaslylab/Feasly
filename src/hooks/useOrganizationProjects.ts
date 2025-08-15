import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

type Project = {
  id: string;
  name: string;
  description?: string | null;
  start_date?: string | null; 
  end_date?: string | null;
  user_id?: string | null;
  organization_id?: string | null;
  created_at?: string;
  updated_at?: string;
  status?: string;
  tags?: string[];
  project_ai_summary?: string | null;
  is_pinned?: boolean;
  is_demo?: boolean;
}

export const useOrganizationProjects = () => {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch projects for current organization
  const {
    data: projects = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['organization-projects', currentOrganization?.id],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by organization if one is selected
      if (currentOrganization) {
        query = query.eq('organization_id', currentOrganization.id);
      } else {
        // If no organization selected, show legacy projects (without organization_id)
        query = query.is('organization_id', null).eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      return data as Project[];
    },
    enabled: !!user,
  });

  // Create project in current organization
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: { name: string; description?: string | null }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          description: projectData.description || null,
          user_id: user.id,
          organization_id: currentOrganization?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-projects'] });
      toast.success('Project created successfully');
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    },
  });

  // Update project
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string | null; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-projects'] });
      toast.success('Project updated successfully');
    },
    onError: (error) => {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    },
  });

  // Delete project
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-projects'] });
      toast.success('Project deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    },
  });

  return {
    projects,
    isLoading,
    error,
    refetch,
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
  };
};