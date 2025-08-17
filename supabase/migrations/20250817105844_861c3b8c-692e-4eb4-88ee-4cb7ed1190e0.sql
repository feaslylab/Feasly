-- Continue creating strict policies for remaining tables
-- Skip tables that already have policies, focus on missing ones

-- Feasly comments - update remaining policies
DROP POLICY IF EXISTS "feasly_comments_auth_team_view" ON public.feasly_comments;
DROP POLICY IF EXISTS "feasly_comments_auth_author_manage" ON public.feasly_comments;
CREATE POLICY "feasly_comments_strict_view" ON public.feasly_comments
FOR SELECT TO authenticated
USING (is_authenticated_user() AND is_project_team_member(project_id, auth.uid()));

CREATE POLICY "feasly_comments_strict_manage" ON public.feasly_comments
FOR ALL TO authenticated
USING (is_authenticated_user() AND auth.uid() = user_id)
WITH CHECK (is_authenticated_user() AND auth.uid() = user_id AND is_project_team_member(project_id, auth.uid()));

-- KPI snapshot - update policy
DROP POLICY IF EXISTS "kpi_snapshot_auth_user" ON public.kpi_snapshot;
CREATE POLICY "kpi_snapshot_strict" ON public.kpi_snapshot
FOR ALL TO authenticated
USING (is_authenticated_user() AND user_id = auth.uid())
WITH CHECK (is_authenticated_user() AND user_id = auth.uid());

-- Organization audit logs - update policies
DROP POLICY IF EXISTS "org_audit_logs_auth_admin_view" ON public.organization_audit_logs;
DROP POLICY IF EXISTS "org_audit_logs_auth_insert" ON public.organization_audit_logs;
CREATE POLICY "org_audit_logs_strict_view" ON public.organization_audit_logs
FOR SELECT TO authenticated
USING (is_authenticated_user() AND organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'billing_admin')
));

CREATE POLICY "org_audit_logs_strict_insert" ON public.organization_audit_logs
FOR INSERT TO authenticated, service_role
WITH CHECK (auth.uid() IS NOT NULL);