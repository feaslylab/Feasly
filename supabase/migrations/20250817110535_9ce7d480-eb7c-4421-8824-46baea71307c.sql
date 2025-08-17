-- Phase 11A.2 - Enable RLS everywhere (if any still off)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT n.nspname as schema, c.relname as table
    FROM pg_class c
    JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE c.relkind='r'
      AND n.nspname NOT IN ('pg_catalog','information_schema')
      AND c.relrowsecurity=false
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', r.schema, r.table);
  END LOOP;
END$$;

-- Phase 11A.3 - Revoke stray GRANTs (tables/views/sequences, non-auth schemas only)

-- Tables & views
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog','information_schema','auth')
  LOOP
    EXECUTE format('REVOKE ALL ON %I.%I FROM anon, public;', r.table_schema, r.table_name);
  END LOOP;
END$$;

-- Sequences (if any)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT sequence_schema, sequence_name
    FROM information_schema.sequences
    WHERE sequence_schema NOT IN ('pg_catalog','information_schema','auth')
  LOOP
    EXECUTE format('REVOKE ALL ON SEQUENCE %I.%I FROM anon, public;', r.sequence_schema, r.sequence_name);
  END LOOP;
END$$;