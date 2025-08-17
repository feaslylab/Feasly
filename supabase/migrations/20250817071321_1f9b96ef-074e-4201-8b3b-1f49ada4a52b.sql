-- Complete security hardening: Fix remaining tables to require authentication
-- This addresses all remaining anonymous access warnings from the security scan

-- The linter is flagging policies that work with both authenticated and anonymous roles
-- We need to explicitly restrict ALL policies to authenticated users only

-- Fix remaining tables that still allow anonymous access
-- Note: Some tables like exchange_rates and feasly_benchmarks are intentionally public

-- Fix assets table
DROP POLICY IF EXISTS "Users can delete their own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can update their own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can view assets of their own projects" ON public.assets;
DROP POLICY IF EXISTS "Users can insert assets into their own projects" ON public.assets;

CREATE POLICY "Authenticated users can manage assets for their projects" 
ON public.assets 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = assets.project_id AND projects.user_id = auth.uid()
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = assets.project_id AND projects.user_id = auth.uid()
  )
);

-- Fix comment table
DROP POLICY IF EXISTS "Team members can view project comments" ON public.comment;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comment;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comment;
DROP POLICY IF EXISTS "Team members can insert project comments" ON public.comment;

CREATE POLICY "Authenticated team members can view project comments" 
ON public.comment 
FOR SELECT 
TO authenticated 
USING (is_project_team_member(project_id, auth.uid()));

CREATE POLICY "Authenticated users can manage their own comments" 
ON public.comment 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (
  auth.uid() = user_id AND is_project_team_member(project_id, auth.uid())
);

-- Fix construction_item table
DROP POLICY IF EXISTS "Users can delete their own construction items" ON public.construction_item;
DROP POLICY IF EXISTS "Users can update their own construction items" ON public.construction_item;
DROP POLICY IF EXISTS "Users can view their own construction items" ON public.construction_item;
DROP POLICY IF EXISTS "Users can insert their own construction items" ON public.construction_item;

CREATE POLICY "Authenticated users can manage their own construction items" 
ON public.construction_item 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Fix project-related tables
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects in their organizations" ON public.projects;
DROP POLICY IF EXISTS "Users can update projects in their organizations" ON public.projects;
DROP POLICY IF EXISTS "Users can delete projects in their organizations" ON public.projects;

CREATE POLICY "Authenticated users can view their projects" 
ON public.projects 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = user_id OR 
  (organization_id IS NOT NULL AND can_access_organization(organization_id))
);

CREATE POLICY "Authenticated users can manage their own projects" 
ON public.projects 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated organization members can manage org projects" 
ON public.projects 
FOR ALL 
TO authenticated 
USING (
  organization_id IS NOT NULL AND 
  is_organization_admin(organization_id, auth.uid())
) 
WITH CHECK (
  organization_id IS NOT NULL AND 
  is_organization_admin(organization_id, auth.uid())
);

-- Fix project_team table
DROP POLICY IF EXISTS "Allow project owner to manage team" ON public.project_team;

CREATE POLICY "Authenticated project owners can manage team" 
ON public.project_team 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_team.project_id AND projects.user_id = auth.uid()
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_team.project_id AND projects.user_id = auth.uid()
  )
);

-- Fix organization_members table
DROP POLICY IF EXISTS "Admin can delete members" ON public.organization_members;
DROP POLICY IF EXISTS "Admin can update members" ON public.organization_members;
DROP POLICY IF EXISTS "Admin can insert members" ON public.organization_members;
DROP POLICY IF EXISTS "Basic member select access" ON public.organization_members;

CREATE POLICY "Authenticated users can view their own membership" 
ON public.organization_members 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Authenticated admins can manage members" 
ON public.organization_members 
FOR ALL 
TO authenticated 
USING (is_organization_admin(organization_id, auth.uid())) 
WITH CHECK (is_organization_admin(organization_id, auth.uid()));

-- Fix project_drafts table
DROP POLICY IF EXISTS "Users can create their own project drafts" ON public.project_drafts;
DROP POLICY IF EXISTS "Users can delete their own project drafts" ON public.project_drafts;
DROP POLICY IF EXISTS "Users can update their own project drafts" ON public.project_drafts;
DROP POLICY IF EXISTS "Users can view their own project drafts" ON public.project_drafts;

CREATE POLICY "Authenticated users can manage their own project drafts" 
ON public.project_drafts 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Update comments on tables to reflect security improvements
COMMENT ON TABLE public.projects IS 'Projects table with enhanced RLS policies requiring authentication for all operations.';
COMMENT ON TABLE public.assets IS 'Assets table with enhanced security requiring authenticated users for all operations.';
COMMENT ON TABLE public.comment IS 'Comments table with enhanced security requiring authenticated team members only.';
COMMENT ON TABLE public.construction_item IS 'Construction items table with enhanced security requiring authenticated users for all operations.';

-- Tables that are intentionally public (exchange_rates, feasly_benchmarks) keep their current policies
-- as they contain reference data that should be publicly accessible

-- Add security audit entry
INSERT INTO organization_audit_logs (
  organization_id, 
  user_id, 
  action, 
  resource_type, 
  details
) 
SELECT 
  om.organization_id,
  auth.uid(),
  'security_hardening_completed',
  'database_policies',
  jsonb_build_object(
    'description', 'Completed comprehensive security hardening to require authentication for all sensitive operations',
    'phase', 'final_security_fix',
    'tables_secured', ARRAY['assets', 'comment', 'construction_item', 'projects', 'project_team', 'organization_members', 'project_drafts'],
    'timestamp', now()
  )
FROM organization_members om 
WHERE om.user_id = auth.uid() 
LIMIT 1;