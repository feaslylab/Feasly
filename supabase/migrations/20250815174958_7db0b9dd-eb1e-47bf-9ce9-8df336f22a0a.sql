-- Drop and recreate the function with correct signature
DROP FUNCTION IF EXISTS public.get_safe_team_member_info(uuid);

-- Create a secure function for team member lookups that doesn't expose emails
CREATE OR REPLACE FUNCTION public.get_safe_team_member_info(target_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only return basic profile info, never email addresses
  -- Users can only get this info if they're on the same team or it's their own profile
  
  RETURN QUERY
  SELECT 
    p.user_id,
    p.full_name as display_name,
    p.avatar_url,
    p.created_at
  FROM profiles p
  WHERE p.user_id = target_user_id
    AND (
      -- User can see their own profile
      auth.uid() = target_user_id
      OR
      -- Users can see basic info of team members (but never email)
      EXISTS (
        SELECT 1 FROM project_team pt1
        JOIN project_team pt2 ON pt1.project_id = pt2.project_id
        WHERE pt1.user_id = auth.uid()
          AND pt2.user_id = target_user_id
      )
      OR
      -- Organization members can see each other's basic info
      EXISTS (
        SELECT 1 FROM organization_members om1
        JOIN organization_members om2 ON om1.organization_id = om2.organization_id
        WHERE om1.user_id = auth.uid()
          AND om2.user_id = target_user_id
      )
    );
END;
$$;

-- Add security documentation
COMMENT ON COLUMN public.profiles.email IS 'SECURITY CRITICAL: Email addresses must never be exposed to unauthorized users. Only users should see their own email.';
COMMENT ON TABLE public.profiles IS 'SECURITY: This table contains sensitive user data. All access must go through RLS policies that restrict users to their own data only.';

-- Verify the current RLS policies are secure
DO $$
DECLARE
  policy_count integer;
BEGIN
  -- Count policies that might allow unauthorized access
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
    AND tablename = 'profiles'
    AND cmd = 'SELECT'
    AND qual != '(auth.uid() = user_id)';
    
  IF policy_count > 0 THEN
    RAISE EXCEPTION 'SECURITY ALERT: Found potentially insecure SELECT policies on profiles table!';
  END IF;
  
  RAISE NOTICE 'Profile security verification passed: All SELECT policies properly restrict access to own data only.';
END;
$$;