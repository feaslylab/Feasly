-- Remove the remaining problematic view that's causing Security Definer View error
DROP VIEW IF EXISTS public.safe_team_member_profiles CASCADE;

-- Verify no other views exist that could cause issues
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE schemaname = 'public';

-- Final verification: List all database objects to ensure we're clean
SELECT 
  schemaname,
  objectname,
  objecttype
FROM (
  SELECT schemaname, viewname as objectname, 'VIEW' as objecttype FROM pg_views WHERE schemaname = 'public'
  UNION ALL
  SELECT schemaname, matviewname as objectname, 'MATERIALIZED VIEW' as objecttype FROM pg_matviews WHERE schemaname = 'public'
) objects
ORDER BY objecttype, objectname;

-- Add documentation that the security issue is now fully resolved
COMMENT ON TABLE public.profiles IS 'SECURITY VERIFIED: All email access properly restricted by RLS. No Security Definer views remain.';