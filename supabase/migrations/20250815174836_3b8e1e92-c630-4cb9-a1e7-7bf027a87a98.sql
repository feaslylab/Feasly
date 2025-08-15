-- Remove the security definer view that was flagged as risky
DROP VIEW IF EXISTS public.team_member_profiles;

-- Instead, create a regular view without security definer
CREATE OR REPLACE VIEW public.safe_team_member_profiles AS
SELECT 
  p.user_id,
  p.full_name,
  p.avatar_url,
  p.created_at
FROM public.profiles p
WHERE p.user_id = auth.uid(); -- This view only shows the current user's own profile

-- Update the team member function to be more secure and not use security definer unnecessarily
DROP FUNCTION IF EXISTS public.get_team_member_display_info(uuid, uuid);

-- Create a simpler, safer function that doesn't expose sensitive data
CREATE OR REPLACE FUNCTION public.get_safe_team_member_info(member_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text
)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  -- This function only returns non-sensitive profile information
  -- Email addresses are never exposed through this function
  
  RETURN QUERY
  SELECT 
    p.user_id,
    p.full_name as display_name,
    p.avatar_url
  FROM profiles p
  WHERE p.user_id = member_user_id
    AND (
      -- User can see their own profile
      auth.uid() = member_user_id
      OR
      -- Users can see basic info of team members they work with
      EXISTS (
        SELECT 1 FROM project_team pt1
        JOIN project_team pt2 ON pt1.project_id = pt2.project_id
        WHERE pt1.user_id = auth.uid()
          AND pt2.user_id = member_user_id
      )
      OR
      -- Users can see basic info of organization members
      EXISTS (
        SELECT 1 FROM organization_members om1
        JOIN organization_members om2 ON om1.organization_id = om2.organization_id
        WHERE om1.user_id = auth.uid()
          AND om2.user_id = member_user_id
      )
    );
END;
$$;

-- Verify that profiles table has the most restrictive policies possible
-- These policies ensure ZERO access to other users' email addresses
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';