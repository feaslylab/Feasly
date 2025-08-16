import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SafeProjectTeamMember {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

export const useProjectTeamMembers = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ["project-team-members", projectId],
    queryFn: async (): Promise<SafeProjectTeamMember[]> => {
      if (!projectId) return [];

      // Use secure function to get team members without exposing emails
      const { data, error } = await supabase
        .rpc('get_project_team_members', { project_id_param: projectId });

      if (error) {
        console.error('Error fetching project team members:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!projectId,
  });
};

export interface SafeOrganizationMember {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

export const useOrganizationMembers = (organizationId: string | undefined) => {
  return useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: async (): Promise<SafeOrganizationMember[]> => {
      if (!organizationId) return [];

      // Use secure function to get organization members without exposing emails
      const { data, error } = await supabase
        .rpc('get_organization_members_safe', { org_id: organizationId });

      if (error) {
        console.error('Error fetching organization members:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!organizationId,
  });
};