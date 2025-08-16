-- Fix email exposure vulnerability in profiles table
-- Replace the overly permissive RLS policy with more secure ones

-- First, drop the existing problematic policy
DROP POLICY IF EXISTS "Secure profile access with email protection" ON public.profiles;

-- Create a restrictive policy that only allows users to see their own complete profile
CREATE POLICY "Users can only view their own complete profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create a separate policy for safe team member access (no email exposure)
CREATE POLICY "Team members can view safe profile data"
ON public.profiles  
FOR SELECT
TO authenticated
USING (
  auth.uid() <> user_id AND (
    EXISTS (
      SELECT 1 FROM project_team pt1
      JOIN project_team pt2 ON pt1.project_id = pt2.project_id
      WHERE pt1.user_id = auth.uid() AND pt2.user_id = profiles.user_id
    ) OR
    EXISTS (
      SELECT 1 FROM organization_members om1
      JOIN organization_members om2 ON om1.organization_id = om2.organization_id  
      WHERE om1.user_id = auth.uid() AND om2.user_id = profiles.user_id
    )
  )
);

-- However, the above policy still exposes emails. Let's use a function-based approach instead.
-- Drop the team member policy we just created
DROP POLICY IF EXISTS "Team members can view safe profile data" ON public.profiles;

-- Update the existing safe team member function to include organization context
CREATE OR REPLACE FUNCTION public.get_safe_team_member_info(target_user_id uuid)
RETURNS TABLE(
  user_id uuid, 
  display_name text, 
  avatar_url text, 
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.user_id,
    p.full_name as display_name,
    p.avatar_url,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = target_user_id
  AND (
    -- Allow if requesting user is the target user
    target_user_id = auth.uid()
    OR
    -- Allow if users share a project team
    EXISTS (
      SELECT 1 FROM project_team pt1
      JOIN project_team pt2 ON pt1.project_id = pt2.project_id
      WHERE pt1.user_id = auth.uid() AND pt2.user_id = target_user_id
    )
    OR
    -- Allow if users share an organization
    EXISTS (
      SELECT 1 FROM organization_members om1
      JOIN organization_members om2 ON om1.organization_id = om2.organization_id
      WHERE om1.user_id = auth.uid() AND om2.user_id = target_user_id
    )
  );
$$;

-- Create a function to safely get multiple team members
CREATE OR REPLACE FUNCTION public.get_project_team_members(project_id_param uuid)
RETURNS TABLE(
  user_id uuid,
  display_name text, 
  avatar_url text,
  role text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER  
SET search_path = 'public'
AS $$
  SELECT 
    p.user_id,
    p.full_name as display_name,
    p.avatar_url,
    pt.role,
    p.created_at
  FROM public.profiles p
  JOIN public.project_team pt ON p.user_id = pt.user_id
  WHERE pt.project_id = project_id_param
  AND is_project_team_member(project_id_param, auth.uid());
$$;

-- Create a function to safely get organization members
CREATE OR REPLACE FUNCTION public.get_organization_members_safe(org_id uuid)
RETURNS TABLE(
  user_id uuid,
  display_name text,
  avatar_url text, 
  role text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.user_id,
    p.full_name as display_name,
    p.avatar_url,
    om.role,
    p.created_at
  FROM public.profiles p
  JOIN public.organization_members om ON p.user_id = om.user_id
  WHERE om.organization_id = org_id
  AND is_organization_member(org_id, auth.uid());
$$;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION public.get_safe_team_member_info(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_team_members(uuid) TO authenticated; 
GRANT EXECUTE ON FUNCTION public.get_organization_members_safe(uuid) TO authenticated;