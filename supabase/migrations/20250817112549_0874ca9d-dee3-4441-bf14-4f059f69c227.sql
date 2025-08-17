-- Phase 11H — Close-Out & CI Proof

-- 11H.1 — Assert that any anon/public policy is deny-only
-- This complements your existing sec.assert_no_anon_public_leaks() by ensuring 
-- the only policies that ever mention anon/public are the explicit denies

CREATE OR REPLACE FUNCTION sec.assert_anon_public_policies_are_deny_only()
RETURNS VOID
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE offenders TEXT;
BEGIN
  /* find any anon/public policy whose USING or CHECK is not literally FALSE */
  WITH pol AS (
    SELECT
      p.schemaname, p.tablename, p.policyname, p.roles,
      COALESCE(pg_get_expr(p.qual, p.polrelid), 'false')       AS using_sql,
      COALESCE(pg_get_expr(p.with_check, p.polrelid), 'false') AS check_sql
    FROM pg_policies p
    WHERE p.roles && array['anon'::name,'public'::name]
  )
  SELECT string_agg(schemaname||'.'||tablename||'/'||policyname, ', ')
  INTO offenders
  FROM pol
  WHERE using_sql <> 'false' OR check_sql <> 'false';

  IF offenders IS NOT NULL THEN
    RAISE EXCEPTION 'Non-deny anon/public policies found: %', offenders;
  END IF;
END
$$;

-- Run both asserts together to prove security posture
SELECT sec.assert_no_anon_public_leaks();
SELECT sec.assert_anon_public_policies_are_deny_only();

-- Final verification: Show that ALL anon/public policies are explicit denies
SELECT 
  schemaname, 
  tablename, 
  policyname,
  COALESCE(pg_get_expr(qual, polrelid), 'false') AS using_clause,
  COALESCE(pg_get_expr(with_check, polrelid), 'false') AS check_clause
FROM pg_policies 
WHERE roles && array['anon'::name,'public'::name]
ORDER BY schemaname, tablename, policyname;