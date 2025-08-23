-- Fix critical security issues

-- 1. Fix infinite recursion in projects RLS policy
DROP POLICY IF EXISTS "projects_team_access" ON public.projects;

-- Create security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.can_access_project(project_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Check if user owns the project directly
  SELECT EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_id AND projects.user_id = user_id
  )
  OR
  -- Check if user is in project team
  EXISTS (
    SELECT 1 FROM public.project_team 
    WHERE project_team.project_id = project_id AND project_team.user_id = user_id
  )
  OR
  -- Check if user is organization member for org-owned projects
  EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.organization_members om ON p.organization_id = om.organization_id
    WHERE p.id = project_id AND om.user_id = user_id
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

-- 3. Fix organization_members table RLS policies
DROP POLICY IF EXISTS "org_members_access" ON public.organization_members;

CREATE POLICY "org_members_can_view_own_memberships" ON public.organization_members
FOR SELECT USING (
  user_id = auth.uid() 
  OR 
  is_organization_admin(organization_id, auth.uid())
);

CREATE POLICY "org_admins_can_manage_members" ON public.organization_members
FOR ALL USING (is_organization_admin(organization_id, auth.uid()))
WITH CHECK (is_organization_admin(organization_id, auth.uid()));

-- 4. Fix organizations table RLS policies  
DROP POLICY IF EXISTS "org_access" ON public.organizations;

CREATE POLICY "org_members_can_view_orgs" ON public.organizations
FOR SELECT USING (
  id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "org_creators_can_manage" ON public.organizations
FOR ALL USING (created_by_user_id = auth.uid())
WITH CHECK (created_by_user_id = auth.uid());

-- 5. Add proper RLS policies for missing tables
CREATE POLICY "construction_items_user_access" ON public.construction_item
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "revenue_sale_user_access" ON public.revenue_sale
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "revenue_rental_user_access" ON public.revenue_rental
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());