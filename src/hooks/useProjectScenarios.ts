
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useOrganization } from '@/contexts/OrganizationContext';

interface Project {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  organization_id?: string;
}

interface Scenario {
  id: string;
  name: string;
  type: string;
  project_id: string;
  is_base: boolean;
}

export const useProjectScenarios = () => {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', currentOrganization?.id, user?.id],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('projects')
        .select('id, name, description, user_id, organization_id')
        .order('created_at', { ascending: false });

      if (currentOrganization) {
        query = query.eq('organization_id', currentOrganization.id);
      } else {
        query = query.eq('user_id', user.id).is('organization_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user,
  });

  const { data: scenarios = [], isLoading: scenariosLoading } = useQuery({
    queryKey: ['scenarios', projects.map(p => p.id)],
    queryFn: async () => {
      if (projects.length === 0) return [];

      const projectIds = projects.map(p => p.id);
      const { data, error } = await supabase
        .from('scenarios')
        .select('id, name, type, project_id, is_base')
        .in('project_id', projectIds)
        .order('is_base', { ascending: false });

      if (error) throw error;
      return data as Scenario[];
    },
    enabled: projects.length > 0,
  });

  // Format data for the picker
  const projectScenarioOptions = projects.flatMap(project => {
    const projectScenarios = scenarios.filter(s => s.project_id === project.id);
    if (projectScenarios.length === 0) {
      // If no scenarios exist, create a placeholder
      return [{
        projectId: project.id,
        projectName: project.name,
        scenarioId: 'new',
        scenarioType: 'base',
        displayName: `${project.name} – Create First Scenario`,
        value: `${project.id}::new`
      }];
    }
    
    return projectScenarios.map(scenario => ({
      projectId: project.id,
      projectName: project.name,
      scenarioId: scenario.id,
      scenarioType: scenario.type.toLowerCase(),
      displayName: `${project.name} – ${scenario.name}`,
      value: `${project.id}::${scenario.id}`
    }));
  });

  return {
    projects,
    scenarios,
    projectScenarioOptions,
    isLoading: projectsLoading || scenariosLoading,
  };
};
