-- Phase 11A.4 - Create strict authenticated-only policies

-- Alert preferences - user ownership
CREATE POLICY "alert_pref_auth_user" ON public.alert_pref
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Assets - project ownership 
CREATE POLICY "assets_auth_project_owner" ON public.assets
FOR ALL TO authenticated  
USING (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = assets.project_id 
    AND projects.user_id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = assets.project_id 
    AND projects.user_id = auth.uid()
));

-- Comments - team members and comment authors
CREATE POLICY "comment_auth_team_view" ON public.comment
FOR SELECT TO authenticated
USING (is_project_team_member(project_id, auth.uid()));

CREATE POLICY "comment_auth_author_manage" ON public.comment
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND is_project_team_member(project_id, auth.uid()));

-- Construction items - user ownership
CREATE POLICY "construction_item_auth_user" ON public.construction_item
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Email queue - user ownership
CREATE POLICY "email_queue_auth_user" ON public.email_queue
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Email queue audit - view own records, system can insert
CREATE POLICY "email_queue_audit_auth_view" ON public.email_queue_audit
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "email_queue_audit_system_insert" ON public.email_queue_audit
FOR INSERT TO authenticated, service_role
WITH CHECK (auth.uid() IS NOT NULL);

-- Escrow releases - project ownership
CREATE POLICY "escrow_releases_auth_project_owner" ON public.escrow_releases
FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = escrow_releases.project_id 
    AND projects.user_id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = escrow_releases.project_id 
    AND projects.user_id = auth.uid()
));