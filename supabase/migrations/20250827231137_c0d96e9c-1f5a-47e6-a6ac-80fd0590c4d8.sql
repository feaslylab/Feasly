-- Add RLS policies for project-related tables to fix security vulnerabilities

-- feasly_cashflows - check project access
CREATE POLICY "feasly_cashflows_project_access" 
ON public.feasly_cashflows 
FOR ALL 
USING (is_authenticated_user() AND can_access_project(project_id, auth.uid()));

-- scenarios - check asset ownership through project access  
CREATE POLICY "scenarios_project_access" 
ON public.scenarios 
FOR ALL 
USING (is_authenticated_user() AND EXISTS (
  SELECT 1 FROM public.assets a 
  WHERE a.id = scenarios.asset_id 
  AND can_access_project(a.project_id, auth.uid())
));

-- feasly_versions - check project access
CREATE POLICY "feasly_versions_project_access" 
ON public.feasly_versions 
FOR ALL 
USING (is_authenticated_user() AND can_access_project(project_id, auth.uid()));

-- financial_summaries - check project access
CREATE POLICY "financial_summaries_project_access" 
ON public.financial_summaries 
FOR ALL 
USING (is_authenticated_user() AND can_access_project(project_id, auth.uid()));

-- project_contractors - check project access
CREATE POLICY "project_contractors_project_access" 
ON public.project_contractors 
FOR ALL 
USING (is_authenticated_user() AND can_access_project(project_id, auth.uid()));

-- scenario_overrides - check scenario access through asset and project
CREATE POLICY "scenario_overrides_project_access" 
ON public.scenario_overrides 
FOR ALL 
USING (is_authenticated_user() AND EXISTS (
  SELECT 1 FROM public.scenarios s 
  JOIN public.assets a ON s.asset_id = a.id 
  WHERE s.id = scenario_overrides.scenario_id 
  AND can_access_project(a.project_id, auth.uid())
));

-- project_compliance - check project access
CREATE POLICY "project_compliance_project_access" 
ON public.project_compliance 
FOR ALL 
USING (is_authenticated_user() AND can_access_project(project_id, auth.uid()));

-- forecast_simulations - check project access
CREATE POLICY "forecast_simulations_project_access" 
ON public.forecast_simulations 
FOR ALL 
USING (is_authenticated_user() AND can_access_project(project_id, auth.uid()));

-- feasly_alerts - check project access
CREATE POLICY "feasly_alerts_project_access" 
ON public.feasly_alerts 
FOR ALL 
USING (is_authenticated_user() AND can_access_project(project_id, auth.uid()));

-- project_team - check project access (users can see team members of projects they have access to)
CREATE POLICY "project_team_project_access" 
ON public.project_team 
FOR SELECT 
USING (is_authenticated_user() AND can_access_project(project_id, auth.uid()));

-- project_team - only project owners and admins can modify team
CREATE POLICY "project_team_manage_access" 
ON public.project_team 
FOR ALL 
USING (is_authenticated_user() AND EXISTS (
  SELECT 1 FROM public.projects p 
  WHERE p.id = project_team.project_id 
  AND (p.user_id = auth.uid() OR (
    p.organization_id IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM public.organization_members om 
      WHERE om.organization_id = p.organization_id 
      AND om.user_id = auth.uid() 
      AND om.role = 'admin'
    )
  ))
));

-- project_milestones - check project access
CREATE POLICY "project_milestones_project_access" 
ON public.project_milestones 
FOR ALL 
USING (is_authenticated_user() AND can_access_project(project_id, auth.uid()));

-- project_tag_suggestions - check project access
CREATE POLICY "project_tag_suggestions_project_access" 
ON public.project_tag_suggestions 
FOR ALL 
USING (is_authenticated_user() AND can_access_project(project_id, auth.uid()));

-- project_input_templates - allow authenticated users to read public templates, own templates
CREATE POLICY "project_input_templates_access" 
ON public.project_input_templates 
FOR SELECT 
USING (is_authenticated_user() AND (is_public = true OR created_by = auth.uid()));

CREATE POLICY "project_input_templates_manage" 
ON public.project_input_templates 
FOR ALL 
USING (is_authenticated_user() AND created_by = auth.uid())
WITH CHECK (is_authenticated_user() AND created_by = auth.uid());

-- project_phases - check project access
CREATE POLICY "project_phases_project_access" 
ON public.project_phases 
FOR ALL 
USING (is_authenticated_user() AND can_access_project(project_id, auth.uid()));

-- export_history - user can only see their own exports for projects they have access to
CREATE POLICY "export_history_user_project_access" 
ON public.export_history 
FOR ALL 
USING (is_authenticated_user() AND user_id = auth.uid() AND can_access_project(project_id, auth.uid()));

-- revenue_sale - check project access
CREATE POLICY "revenue_sale_project_access" 
ON public.revenue_sale 
FOR ALL 
USING (is_authenticated_user() AND can_access_project(project_id, auth.uid()));

-- revenue_rental - check project access  
CREATE POLICY "revenue_rental_project_access" 
ON public.revenue_rental 
FOR ALL 
USING (is_authenticated_user() AND can_access_project(project_id, auth.uid()));

-- scenario_results - check project access through scenario
CREATE POLICY "scenario_results_project_access" 
ON public.scenario_results 
FOR ALL 
USING (is_authenticated_user() AND EXISTS (
  SELECT 1 FROM public.scenarios s 
  JOIN public.assets a ON s.asset_id = a.id 
  WHERE s.id = scenario_results.scenario_id 
  AND can_access_project(a.project_id, auth.uid())
));

-- project_drafts - check project access and user ownership
CREATE POLICY "project_drafts_user_project_access" 
ON public.project_drafts 
FOR ALL 
USING (is_authenticated_user() AND user_id = auth.uid() AND can_access_project(project_id, auth.uid()))
WITH CHECK (is_authenticated_user() AND user_id = auth.uid() AND can_access_project(project_id, auth.uid()));

-- feasly_insights_notes - check project access
CREATE POLICY "feasly_insights_notes_project_access" 
ON public.feasly_insights_notes 
FOR ALL 
USING (is_authenticated_user() AND can_access_project(project_id, auth.uid()));

-- feasly_comments - check project access (already has team member check, adding project access as backup)
CREATE POLICY "feasly_comments_project_access" 
ON public.feasly_comments 
FOR SELECT 
USING (is_authenticated_user() AND can_access_project(project_id, auth.uid()));

-- feasly_modules - user can only manage their own modules
CREATE POLICY "feasly_modules_user_access" 
ON public.feasly_modules 
FOR ALL 
USING (is_authenticated_user() AND user_id = auth.uid())
WITH CHECK (is_authenticated_user() AND user_id = auth.uid());