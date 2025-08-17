-- Continue with creating policies for the remaining core tables
-- Exchange rates - authenticated users can view (read-only)
CREATE POLICY "exchange_rates_auth_view" ON public.exchange_rates
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

-- Feasly benchmarks - authenticated users can view (read-only)
CREATE POLICY "feasly_benchmarks_auth_view" ON public.feasly_benchmarks
FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

-- Feasly comments - team member access
CREATE POLICY "feasly_comments_auth_team_view" ON public.feasly_comments
FOR SELECT TO authenticated
USING (is_project_team_member(project_id, auth.uid()));

CREATE POLICY "feasly_comments_auth_author_manage" ON public.feasly_comments
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND is_project_team_member(project_id, auth.uid()));

-- KPI snapshot - user ownership
CREATE POLICY "kpi_snapshot_auth_user" ON public.kpi_snapshot
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Organization audit logs - admin access
CREATE POLICY "org_audit_logs_auth_admin_view" ON public.organization_audit_logs
FOR SELECT TO authenticated
USING (organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'billing_admin')
));

CREATE POLICY "org_audit_logs_auth_insert" ON public.organization_audit_logs
FOR INSERT TO authenticated, service_role
WITH CHECK (auth.uid() IS NOT NULL);

-- Organization invitations
CREATE POLICY "org_invitations_auth_own_view" ON public.organization_invitations
FOR SELECT TO authenticated
USING ((email = (SELECT email FROM auth.users WHERE id = auth.uid())) 
       OR organization_id IN (
           SELECT organization_id FROM organization_members 
           WHERE user_id = auth.uid() AND role IN ('admin', 'billing_admin')
       ));

CREATE POLICY "org_invitations_auth_admin_manage" ON public.organization_invitations
FOR ALL TO authenticated
USING (organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'billing_admin')
))
WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'billing_admin')
));