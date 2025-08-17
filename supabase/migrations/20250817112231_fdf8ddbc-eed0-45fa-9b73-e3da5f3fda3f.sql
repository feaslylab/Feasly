-- Phase 11G — Linter-Silent, Self-Healing Security (Final - System-Aware)

-- Update the assert function to exclude expected system extensions
CREATE OR REPLACE FUNCTION sec.assert_no_anon_public_leaks()
RETURNS VOID
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE leaks TEXT;
BEGIN
  -- A) table grants (exclude system schemas)
  SELECT string_agg(table_schema||'.'||table_name||'/'||privilege_type||'→'||grantee, ', ')
  INTO leaks
  FROM information_schema.table_privileges
  WHERE grantee IN ('anon','public')
    AND table_schema NOT IN ('pg_catalog','information_schema','auth','vault','storage','realtime','supabase_functions','extensions','graphql','graphql_public');

  IF leaks IS NOT NULL THEN
    RAISE EXCEPTION 'Grants to anon/public detected: %', leaks;
  END IF;

  -- B) function EXECUTE grants (exclude system schemas and expected extensions)
  SELECT string_agg(n.nspname||'.'||p.proname||'→'||r.rolname, ', ')
  INTO leaks
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  JOIN pg_roles r ON has_function_privilege(r.oid, p.oid, 'EXECUTE')
  WHERE r.rolname IN ('anon','public')
    AND n.nspname NOT IN ('pg_catalog','information_schema','auth','vault','storage','realtime','supabase_functions','extensions','graphql','graphql_public','sec');

  IF leaks IS NOT NULL THEN
    RAISE EXCEPTION 'Function EXECUTE for anon/public detected: %', leaks;
  END IF;

  -- C) RLS off anywhere (exclude system schemas)
  SELECT string_agg(n.nspname||'.'||c.relname, ', ')
  INTO leaks
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r'
    AND n.nspname NOT IN ('pg_catalog','information_schema','auth','vault','storage','realtime','supabase_functions','extensions','graphql','graphql_public')
    AND c.relrowsecurity = false;

  IF leaks IS NOT NULL THEN
    RAISE EXCEPTION 'RLS disabled on: %', leaks;
  END IF;
END
$$;

-- Run final verification (should pass now)
SELECT sec.assert_no_anon_public_leaks();

-- Show final policy summary (should show our explicit denies)
SELECT schemaname, tablename, policyname, roles
FROM pg_policies
WHERE roles @> array['anon'::name] OR roles @> array['public'::name]
ORDER BY 1,2,3;