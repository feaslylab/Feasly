-- Phase 11F - Database security smoke checks
-- This script verifies critical security requirements are met

-- 1. Fail if any public table lacks RLS
WITH missing_rls AS (
  SELECT n.nspname as schema, c.relname as table
  FROM pg_class c 
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r' 
    AND n.nspname = 'public' 
    AND c.relrowsecurity = false
)
SELECT CASE 
  WHEN EXISTS(SELECT 1 FROM missing_rls) THEN
    'FAIL: Tables without RLS: ' || (SELECT string_agg(schema||'.'||table, ', ') FROM missing_rls)
  ELSE 'OK'
END as rls_status;

-- 2. Fail if any policy allows anonymous/public access
WITH bad_policies AS (
  SELECT schemaname, tablename, policyname
  FROM pg_policies
  WHERE (roles @> array['public']::name[] OR roles @> array['anon']::name[])
     OR (qual IS NULL OR qual = 'true')
     OR (with_check IS NOT NULL AND with_check = 'true')
)
SELECT CASE 
  WHEN EXISTS(SELECT 1 FROM bad_policies) THEN
    'FAIL: Permissive policies: ' || (SELECT string_agg(policyname||' on '||schemaname||'.'||tablename, ', ') FROM bad_policies)
  ELSE 'OK'
END as policies_status;

-- 3. Fail if any SECURITY DEFINER function missing search_path
WITH bad_functions AS (
  SELECT n.nspname, p.proname
  FROM pg_proc p 
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE p.prosecdef = true
    AND NOT EXISTS (
      SELECT 1 FROM unnest(coalesce(p.proconfig, array[]::text[])) cfg
      WHERE cfg LIKE 'search_path=%'
    )
    AND n.nspname = 'public'
)
SELECT CASE 
  WHEN EXISTS(SELECT 1 FROM bad_functions) THEN
    'FAIL: Functions without search_path: ' || (SELECT string_agg(nspname||'.'||proname, ', ') FROM bad_functions)
  ELSE 'OK'
END as definer_status;

-- 4. Check for dangerous function permissions
WITH risky_functions AS (
  SELECT n.nspname, p.proname
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE p.prosecdef = true
    AND n.nspname = 'public'
    AND has_function_privilege('public', p.oid, 'execute')
)
SELECT CASE 
  WHEN EXISTS(SELECT 1 FROM risky_functions) THEN
    'WARN: Public-executable SECURITY DEFINER functions: ' || (SELECT string_agg(nspname||'.'||proname, ', ') FROM risky_functions)
  ELSE 'OK'
END as function_permissions_status;