-- Fix RLS policies for scenario_reports to require authentication
DROP POLICY IF EXISTS "Users can view reports for their projects" ON public.scenario_reports;
DROP POLICY IF EXISTS "Users can create reports for their projects" ON public.scenario_reports;
DROP POLICY IF EXISTS "Users can update reports for their projects" ON public.scenario_reports;

-- Create secure policies that require authentication
CREATE POLICY "Users can view reports for their projects" 
ON public.scenario_reports 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = scenario_reports.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create reports for their projects" 
ON public.scenario_reports 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = scenario_reports.project_id 
    AND projects.user_id = auth.uid()
  ) AND created_by = auth.uid()
);

CREATE POLICY "Users can update reports for their projects" 
ON public.scenario_reports 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = scenario_reports.project_id 
    AND projects.user_id = auth.uid()
  )
);