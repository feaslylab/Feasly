-- Complete remaining policies to address "RLS Enabled No Policy" warnings
-- Continue fixing remaining policies with strict authentication checks

-- Update remaining policies to use strict authentication
DROP POLICY IF EXISTS "email_queue_auth_user" ON public.email_queue;
CREATE POLICY "email_queue_strict" ON public.email_queue
FOR ALL TO authenticated
USING (is_authenticated_user() AND auth.uid() = user_id)
WITH CHECK (is_authenticated_user() AND auth.uid() = user_id);

DROP POLICY IF EXISTS "email_queue_audit_auth_view" ON public.email_queue_audit;
DROP POLICY IF EXISTS "email_queue_audit_system_insert" ON public.email_queue_audit;
CREATE POLICY "email_queue_audit_strict_view" ON public.email_queue_audit
FOR SELECT TO authenticated
USING (is_authenticated_user() AND user_id = auth.uid());

CREATE POLICY "email_queue_audit_strict_insert" ON public.email_queue_audit
FOR INSERT TO authenticated, service_role
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "escrow_releases_auth_project_owner" ON public.escrow_releases;
CREATE POLICY "escrow_releases_strict" ON public.escrow_releases
FOR ALL TO authenticated
USING (is_authenticated_user() AND EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = escrow_releases.project_id 
    AND projects.user_id = auth.uid()
))
WITH CHECK (is_authenticated_user() AND EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = escrow_releases.project_id 
    AND projects.user_id = auth.uid()
));

DROP POLICY IF EXISTS "exchange_rates_auth_view" ON public.exchange_rates;
CREATE POLICY "exchange_rates_strict" ON public.exchange_rates
FOR SELECT TO authenticated
USING (is_authenticated_user());

DROP POLICY IF EXISTS "feasly_benchmarks_auth_view" ON public.feasly_benchmarks;
CREATE POLICY "feasly_benchmarks_strict" ON public.feasly_benchmarks
FOR SELECT TO authenticated
USING (is_authenticated_user());