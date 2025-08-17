-- Phase 11A.8 - Re-run Diagnostics

-- Policies mentioning anon/public or wide-open: should be only our 'deny_anon_all'
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE roles @> array['anon'::name] OR roles @> array['public'::name]
   OR qual IS NULL OR qual='true'
ORDER BY 1,2,3;

-- Any residual GRANTs to anon/public?
SELECT table_schema, table_name, privilege_type, grantee
FROM information_schema.table_privileges
WHERE grantee IN ('anon','public')
ORDER BY 1,2,3,4;

-- Function EXECUTE privileges for anon/public (should be none outside auth)
SELECT n.nspname as schema, p.proname as function, r.rolname as grantee
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
JOIN pg_catalog.pg_roles r ON has_function_privilege(r.oid, p.oid, 'EXECUTE')
WHERE r.rolname IN ('anon','public')
  AND n.nspname NOT IN ('pg_catalog','information_schema','auth')
ORDER BY 1,2,3;

-- Check current policies on one of the problematic tables for inspection
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'alert_pref'
ORDER BY policyname;