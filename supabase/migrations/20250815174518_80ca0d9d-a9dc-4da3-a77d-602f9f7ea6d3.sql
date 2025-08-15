-- Create a security definer function to check if user is project team member
CREATE OR REPLACE FUNCTION public.is_project_team_member(project_id_param uuid, user_id_param uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is project owner
  IF EXISTS (
    SELECT 1 FROM projects 
    WHERE id = project_id_param AND user_id = user_id_param
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user is in project team
  IF EXISTS (
    SELECT 1 FROM project_team 
    WHERE project_id = project_id_param AND user_id = user_id_param
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user is organization member for organization-owned projects
  IF EXISTS (
    SELECT 1 FROM projects p
    JOIN organization_members om ON p.organization_id = om.organization_id
    WHERE p.id = project_id_param AND om.user_id = user_id_param
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;

-- Fix the feasly_comments table RLS policy to remove public access
DROP POLICY IF EXISTS "Users can view comments for projects they can access" ON public.feasly_comments;

CREATE POLICY "Team members can view project comments"
ON public.feasly_comments
FOR SELECT
TO authenticated
USING (public.is_project_team_member(project_id, auth.uid()));

-- Update insert policy to ensure only team members can comment
DROP POLICY IF EXISTS "Users can insert comments for their accessible projects" ON public.feasly_comments;

CREATE POLICY "Team members can insert project comments"
ON public.feasly_comments
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_project_team_member(project_id, auth.uid()) 
  AND auth.uid() = user_id
);

-- Also secure the regular comment table with team-based access
DROP POLICY IF EXISTS "Users can view comments for their projects" ON public.comment;

CREATE POLICY "Team members can view project comments"
ON public.comment
FOR SELECT
TO authenticated
USING (public.is_project_team_member(project_id, auth.uid()));

DROP POLICY IF EXISTS "Users can insert comments for their projects" ON public.comment;

CREATE POLICY "Team members can insert project comments"
ON public.comment
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_project_team_member(project_id, auth.uid()) 
  AND auth.uid() = user_id
);