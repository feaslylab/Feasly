-- Add project_type column to projects table to support consolidation mode
ALTER TABLE public.projects 
ADD COLUMN project_type text NOT NULL DEFAULT 'normal';

-- Add constraint to ensure valid project types
ALTER TABLE public.projects 
ADD CONSTRAINT projects_project_type_check 
CHECK (project_type IN ('normal', 'consolidation'));

-- Add parent_project_id to support project hierarchy
ALTER TABLE public.projects 
ADD COLUMN parent_project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;

-- Add index for better performance when querying child projects
CREATE INDEX idx_projects_parent_project_id ON public.projects(parent_project_id);

-- Add consolidation settings
ALTER TABLE public.projects 
ADD COLUMN consolidation_settings jsonb DEFAULT '{}';

-- Update RLS policies to handle parent-child relationships
DROP POLICY IF EXISTS "projects_team_access" ON public.projects;

CREATE POLICY "projects_team_access" ON public.projects
FOR ALL USING (
  is_authenticated_user() AND (
    -- Direct project access
    is_project_team_member(id, auth.uid())
    OR
    -- Access through parent project (for child projects)
    (parent_project_id IS NOT NULL AND is_project_team_member(parent_project_id, auth.uid()))
    OR
    -- Access to child projects through parent (for parent projects)
    EXISTS (
      SELECT 1 FROM public.projects child_projects 
      WHERE child_projects.parent_project_id = projects.id 
      AND is_project_team_member(child_projects.id, auth.uid())
    )
  )
)
WITH CHECK (
  is_authenticated_user() AND (
    is_project_team_member(id, auth.uid())
    OR
    (parent_project_id IS NOT NULL AND is_project_team_member(parent_project_id, auth.uid()))
  )
);