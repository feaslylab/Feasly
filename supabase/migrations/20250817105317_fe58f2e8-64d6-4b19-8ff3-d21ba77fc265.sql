-- Phase 11A.5 - Create explicit anonymous-blocking policies
-- First create a function to ensure user is authenticated (not anonymous)
CREATE OR REPLACE FUNCTION public.is_authenticated_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.uid() IS NOT NULL AND auth.role() = 'authenticated';
$$;

-- Recreate all policies with explicit anonymous blocking

-- Drop and recreate existing policies with better security
DROP POLICY IF EXISTS "alert_pref_auth_user" ON public.alert_pref;
CREATE POLICY "alert_pref_strict" ON public.alert_pref
FOR ALL TO authenticated
USING (is_authenticated_user() AND auth.uid() = user_id)
WITH CHECK (is_authenticated_user() AND auth.uid() = user_id);

DROP POLICY IF EXISTS "assets_auth_project_owner" ON public.assets;
CREATE POLICY "assets_strict" ON public.assets
FOR ALL TO authenticated
USING (is_authenticated_user() AND EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = assets.project_id 
    AND projects.user_id = auth.uid()
))
WITH CHECK (is_authenticated_user() AND EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = assets.project_id 
    AND projects.user_id = auth.uid()
));

DROP POLICY IF EXISTS "comment_auth_team_view" ON public.comment;
DROP POLICY IF EXISTS "comment_auth_author_manage" ON public.comment;
CREATE POLICY "comment_strict_view" ON public.comment
FOR SELECT TO authenticated
USING (is_authenticated_user() AND is_project_team_member(project_id, auth.uid()));

CREATE POLICY "comment_strict_manage" ON public.comment
FOR ALL TO authenticated
USING (is_authenticated_user() AND auth.uid() = user_id)
WITH CHECK (is_authenticated_user() AND auth.uid() = user_id AND is_project_team_member(project_id, auth.uid()));

DROP POLICY IF EXISTS "construction_item_auth_user" ON public.construction_item;
CREATE POLICY "construction_item_strict" ON public.construction_item
FOR ALL TO authenticated
USING (is_authenticated_user() AND auth.uid() = user_id)
WITH CHECK (is_authenticated_user() AND auth.uid() = user_id);