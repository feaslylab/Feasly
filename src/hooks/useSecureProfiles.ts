import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface SafeTeamMemberInfo {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
}

export const useTeamMemberInfo = (userId: string | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["safe-team-member-info", userId, user?.id],
    queryFn: async (): Promise<SafeTeamMemberInfo | null> => {
      if (!userId || !user?.id) return null;

      // Use the secure function to get team member info
      const { data, error } = await supabase
        .rpc('get_safe_team_member_info', { target_user_id: userId });

      if (error) {
        console.error('Error fetching team member info:', error);
        return null;
      }

      return data?.[0] || null;
    },
    enabled: !!userId && !!user?.id
  });
};

// Hook for current user's own profile (can access email)
export const useOwnProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["own-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error('Error fetching own profile:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id
  });
};