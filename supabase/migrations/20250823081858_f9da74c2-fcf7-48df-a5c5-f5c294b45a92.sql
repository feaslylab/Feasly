-- Fix critical security issues (corrected version)

-- 1. Fix infinite recursion in projects RLS policy
DROP POLICY IF EXISTS "projects_team_access" ON public.projects;

-- Create security definer function to avoid recursion (fixed column ambiguity)
CREATE OR REPLACE FUNCTION public.can_access_project(project_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Check if user owns the project directly
  SELECT EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_id AND projects.user_id = check_user_id
  )
  OR
  -- Check if user is in project team
  EXISTS (
    SELECT 1 FROM public.project_team 
    WHERE project_team.project_id = project_id AND project_team.user_id = check_user_id
  )
  OR
  -- Check if user is organization member for org-owned projects
  EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.organization_members om ON p.organization_id = om.organization_id
    WHERE p.id = project_id AND om.user_id = check_user_id
  );
$$;

-- Create safe RLS policy for projects using the function
CREATE POLICY "projects_secure_access" ON public.projects
FOR ALL USING (
  is_authenticated_user() AND can_access_project(id, auth.uid())
)
WITH CHECK (
  is_authenticated_user() AND (
    -- Can create if user_id matches auth user
    user_id = auth.uid()
    OR
    -- Can create if user is org admin for org projects
    (organization_id IS NOT NULL AND is_organization_admin(organization_id, auth.uid()))
  )
);

-- 2. Fix profiles table RLS policies for security
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;

-- Users can only view their own profile
CREATE POLICY "users_can_view_own_profile" ON public.profiles
FOR SELECT USING (user_id = auth.uid());

-- Users can only update their own profile  
CREATE POLICY "users_can_update_own_profile" ON public.profiles
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can only insert their own profile
CREATE POLICY "users_can_insert_own_profile" ON public.profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can only delete their own profile
CREATE POLICY "users_can_delete_own_profile" ON public.profiles
FOR DELETE USING (user_id = auth.uid());