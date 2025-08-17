-- Phase 11A.1 - Diagnostics: Tables without RLS
-- 1) Tables without RLS
SELECT n.nspname as schema, c.relname as table, c.relrowsecurity as rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE c.relkind='r' 
  AND n.nspname NOT IN ('pg_catalog','information_schema')
ORDER BY 1,2;

-- 2) Existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
ORDER BY schemaname, tablename, policyname;

-- 3) Detect dangerously-permissive policies
SELECT * FROM pg_policies
WHERE (roles @> array['public']::name[] OR roles @> array['anon']::name[])
   OR (qual IS NULL OR qual = 'true')
   OR (with_check IS NOT NULL AND with_check = 'true')
ORDER BY schemaname, tablename, policyname;