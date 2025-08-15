-- Secure the project_contractors table with team-based access control
-- Ensure contractor information is NEVER exposed, even for public projects

-- Drop existing policies and recreate with maximum security
DROP POLICY IF EXISTS "Users can view contractors for their projects" ON public.project_contractors;
DROP POLICY IF EXISTS "Users can create contractors for their projects" ON public.project_contractors;
DROP POLICY IF EXISTS "Users can update contractors for their projects" ON public.project_contractors;
DROP POLICY IF EXISTS "Users can delete contractors for their projects" ON public.project_contractors;

-- Create ultra-secure policies using team membership (not public project access)
-- SELECT policy - only project team members can view contractor info
CREATE POLICY "Team members can view project contractors"
ON public.project_contractors
FOR SELECT
TO authenticated
USING (public.is_project_team_member(project_id, auth.uid()));

-- INSERT policy - only project team members can add contractors
CREATE POLICY "Team members can create project contractors"
ON public.project_contractors
FOR INSERT
TO authenticated
WITH CHECK (public.is_project_team_member(project_id, auth.uid()));

-- UPDATE policy - only project team members can update contractors
CREATE POLICY "Team members can update project contractors"
ON public.project_contractors
FOR UPDATE
TO authenticated
USING (public.is_project_team_member(project_id, auth.uid()))
WITH CHECK (public.is_project_team_member(project_id, auth.uid()));

-- DELETE policy - only project team members can delete contractors
CREATE POLICY "Team members can delete project contractors"
ON public.project_contractors
FOR DELETE
TO authenticated
USING (public.is_project_team_member(project_id, auth.uid()));

-- Add security documentation
COMMENT ON COLUMN public.project_contractors.contact_email IS 'SECURITY CRITICAL: Contractor emails must never be exposed to unauthorized users. Only project team members should access this.';
COMMENT ON COLUMN public.project_contractors.contact_person IS 'SECURITY CRITICAL: Contractor contact information is sensitive business data.';
COMMENT ON COLUMN public.project_contractors.amount IS 'BUSINESS SENSITIVE: Contract amounts are confidential financial information.';
COMMENT ON TABLE public.project_contractors IS 'SECURITY: Contains sensitive contractor contact and financial information. Access restricted to project team members only.';

-- Create a secure function to get contractor summary for public viewing (without sensitive details)
CREATE OR REPLACE FUNCTION public.get_public_contractor_summary(project_id_param uuid)
RETURNS TABLE (
  contractor_count bigint,
  total_phases bigint,
  project_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- This function can be called for public projects but returns only non-sensitive aggregated data
  -- Check if project is public first
  IF NOT EXISTS (
    SELECT 1 FROM projects 
    WHERE id = project_id_param AND is_public = true
  ) THEN
    -- If project is not public, user must be team member
    IF NOT public.is_project_team_member(project_id_param, auth.uid()) THEN
      RETURN;
    END IF;
  END IF;
  
  -- Return only aggregated, non-sensitive information
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as contractor_count,
    COUNT(DISTINCT phase)::bigint as total_phases,
    CASE 
      WHEN COUNT(CASE WHEN status = 'completed' THEN 1 END) = COUNT(*) THEN 'all_completed'
      WHEN COUNT(CASE WHEN status = 'in_progress' THEN 1 END) > 0 THEN 'in_progress'
      ELSE 'planning'
    END as project_status
  FROM project_contractors
  WHERE project_id = project_id_param;
END;
$$;