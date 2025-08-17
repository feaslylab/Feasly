-- Phase 11A.2 & 11A.3 - Enable RLS and revoke grants (fixed to exclude system schemas)

-- Enable RLS everywhere (excluding system schemas)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT n.nspname as schema, c.relname as table
    FROM pg_class c
    JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE c.relkind='r'
      AND n.nspname NOT IN ('pg_catalog','information_schema','auth','vault','extensions','graphql','graphql_public','realtime','supabase_functions','storage')
      AND c.relrowsecurity=false
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', r.schema, r.table);
  END LOOP;
END$$;

-- Revoke grants on tables & views (excluding system schemas)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog','information_schema','auth','vault','extensions','graphql','graphql_public','realtime','supabase_functions')
  LOOP
    BEGIN
      EXECUTE format('REVOKE ALL ON %I.%I FROM anon, public;', r.table_schema, r.table_name);
    EXCEPTION 
      WHEN insufficient_privilege THEN 
        -- Skip tables we don't own (like storage tables)
        NULL;
    END;
  END LOOP;
END$$;

-- Revoke grants on sequences (excluding system schemas)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT sequence_schema, sequence_name
    FROM information_schema.sequences
    WHERE sequence_schema NOT IN ('pg_catalog','information_schema','auth','vault','extensions','graphql','graphql_public','realtime','supabase_functions')
  LOOP
    BEGIN
      EXECUTE format('REVOKE ALL ON SEQUENCE %I.%I FROM anon, public;', r.sequence_schema, r.sequence_name);
    EXCEPTION 
      WHEN insufficient_privilege THEN 
        -- Skip sequences we don't own
        NULL;
    END;
  END LOOP;
END$$;