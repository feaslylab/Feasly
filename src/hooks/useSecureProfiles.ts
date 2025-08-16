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

      // SECURITY FIX: Explicitly exclude email column to prevent harvesting
      // Only select safe profile fields for team members
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, created_at')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching team member info:', error);
        return null;
      }

      return data ? {
        user_id: data.user_id,
        display_name: data.full_name || '',
        avatar_url: data.avatar_url,
        created_at: data.created_at
      } : null;
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