-- Phase 11A.4 - Revoke EXECUTE on RPC/functions from anon/public
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT n.nspname as schema, p.proname as func, oidvectortypes(p.proargtypes) as args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname NOT IN ('pg_catalog','information_schema','auth','vault','extensions','graphql','graphql_public','realtime','supabase_functions')
  LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM anon, public;', r.schema, r.func, r.args);
    EXCEPTION 
      WHEN insufficient_privilege THEN 
        -- Skip functions we don't own
        NULL;
    END;
  END LOOP;
END$$;

-- Phase 11A.5 - Lock default privileges (stop future grants to anon/public)

-- For future objects created by the current db owner in these schemas
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, public;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, public;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, public;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TYPES FROM anon, public;

-- For storage schema (if we have privileges)
BEGIN;
  ALTER DEFAULT PRIVILEGES IN SCHEMA storage REVOKE ALL ON TABLES FROM anon, public;
  ALTER DEFAULT PRIVILEGES IN SCHEMA storage REVOKE ALL ON FUNCTIONS FROM anon, public;
EXCEPTION 
  WHEN insufficient_privilege THEN 
    -- Skip if we don't have privileges on storage schema
    NULL;
END;