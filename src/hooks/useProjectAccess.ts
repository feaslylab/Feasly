import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

export const useProjectAccess = (projectId: string) => {
  const { user } = useAuth();

  const { data: accessLevel, isLoading } = useQuery({
    queryKey: ["project-access", projectId, user?.id],
    queryFn: async () => {
      if (!user?.id || !projectId) return null;

      // Check if user is project owner
      const { data: project } = await supabase
        .from("projects")
        .select("user_id, organization_id, is_public")
        .eq("id", projectId)
        .single();

      if (!project) return null;

      const isOwner = project.user_id === user.id;
      
      // Check if user is team member
      const { data: teamMember } = await supabase
        .from("project_team")
        .select("role")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .single();

      // Check if user is organization member
      let isOrgMember = false;
      if (project.organization_id) {
        const { data: orgMember } = await supabase
          .from("organization_members")
          .select("role")
          .eq("organization_id", project.organization_id)
          .eq("user_id", user.id)
          .single();
        
        isOrgMember = !!orgMember;
      }

      return {
        isOwner,
        isTeamMember: !!teamMember,
        isOrgMember,
        hasWriteAccess: isOwner || teamMember?.role === 'admin' || teamMember?.role === 'editor',
        hasReadAccess: isOwner || !!teamMember || isOrgMember || project.is_public,
        canViewComments: isOwner || !!teamMember || isOrgMember,
        teamRole: teamMember?.role,
        project
      };
    },
    enabled: !!user?.id && !!projectId
  });

  return {
    accessLevel,
    isLoading,
    canRead: accessLevel?.hasReadAccess || false,
    canWrite: accessLevel?.hasWriteAccess || false,
    canViewComments: accessLevel?.canViewComments || false,
    isOwner: accessLevel?.isOwner || false,
    isTeamMember: accessLevel?.isTeamMember || false
  };
};