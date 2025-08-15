-- Fix the remaining Security Definer View issue
-- Drop the problematic view that might be causing security issues

DROP VIEW IF EXISTS public.safe_team_member_profiles;

-- Create a secure view without SECURITY DEFINER that relies on RLS
-- This view will only show profiles that the current user should be able to see
CREATE VIEW public.safe_team_member_profiles 
WITH (security_barrier = true)
AS 
SELECT 
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.created_at
FROM profiles p
WHERE (
    -- User can see their own profile
    p.user_id = auth.uid()
    OR
    -- Users can see basic info of team members (through RLS policies)
    EXISTS (
        SELECT 1 FROM project_team pt1
        JOIN project_team pt2 ON pt1.project_id = pt2.project_id
        WHERE pt1.user_id = auth.uid()
        AND pt2.user_id = p.user_id
    )
    OR
    -- Organization members can see each other's basic info
    EXISTS (
        SELECT 1 FROM organization_members om1
        JOIN organization_members om2 ON om1.organization_id = om2.organization_id
        WHERE om1.user_id = auth.uid()
        AND om2.user_id = p.user_id
    )
);

-- Add comment explaining the security model
COMMENT ON VIEW public.safe_team_member_profiles IS 'Secure view that shows team member profiles based on access permissions without bypassing RLS';