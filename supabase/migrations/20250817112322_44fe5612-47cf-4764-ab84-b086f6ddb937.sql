-- Phase 11G — Complete Linter-Silent, Self-Healing Security

-- Create sec schema and stable auth function
CREATE SCHEMA IF NOT EXISTS sec;

CREATE OR REPLACE FUNCTION sec.is_authenticated_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SET search_path = pg_catalog, public
AS $$
  SELECT auth.uid() IS NOT NULL AND auth.role() = 'authenticated'
$$;

-- Add explicit deny policies for both anon and public on all public schema tables
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT n.nspname AS schema, c.relname AS table
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname = 'public'
  LOOP
    -- deny anon
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = r.schema AND tablename = r.table AND policyname = 'deny_anon_all'
    ) THEN
      EXECUTE format('CREATE POLICY deny_anon_all ON %I.%I FOR ALL TO anon USING (false) WITH CHECK (false);', r.schema, r.table);
    END IF;

    -- deny public
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = r.schema AND tablename = r.table AND policyname = 'deny_public_all'
    ) THEN
      EXECUTE format('CREATE POLICY deny_public_all ON %I.%I FOR ALL TO public USING (false) WITH CHECK (false);', r.schema, r.table);
    END IF;
  END LOOP;
END$$;

-- Auto-hardening for future tables
CREATE OR REPLACE FUNCTION sec.harden_table(_sch TEXT, _tbl TEXT)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', _sch, _tbl);
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = _sch AND tablename = _tbl AND policyname = 'deny_anon_all'
  ) THEN
    EXECUTE format('CREATE POLICY deny_anon_all ON %I.%I FOR ALL TO anon USING (false) WITH CHECK (false);', _sch, _tbl);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = _sch AND tablename = _tbl AND policyname = 'deny_public_all'
  ) THEN
    EXECUTE format('CREATE POLICY deny_public_all ON %I.%I FOR ALL TO public USING (false) WITH CHECK (false);', _sch, _tbl);
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION sec.on_create_table()
RETURNS event_trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF r.schema_name = 'public' THEN
      PERFORM sec.harden_table(r.schema_name, r.object_name);
    END IF;
  END LOOP;
END
$$;

DROP EVENT TRIGGER IF EXISTS trg_harden_new_tables;
CREATE EVENT TRIGGER trg_harden_new_tables
ON ddl_command_end
WHEN tag IN ('CREATE TABLE')
EXECUTE PROCEDURE sec.on_create_table();

-- Final assert function for CI testing
CREATE OR REPLACE FUNCTION sec.assert_no_anon_public_leaks()
RETURNS VOID
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE leaks TEXT;
BEGIN
  -- Check for table grants to anon/public (only in public schema)
  SELECT string_agg(table_schema||'.'||table_name||'/'||privilege_type||'→'||grantee, ', ')
  INTO leaks
  FROM information_schema.table_privileges
  WHERE grantee IN ('anon','public')
    AND table_schema = 'public';

  IF leaks IS NOT NULL THEN
    RAISE EXCEPTION 'Public schema grants to anon/public detected: %', leaks;
  END IF;

  -- Check for function EXECUTE grants to anon/public (only in public schema)
  SELECT string_agg(n.nspname||'.'||p.proname||'→'||r.rolname, ', ')
  INTO leaks
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  JOIN pg_roles r ON has_function_privilege(r.oid, p.oid, 'EXECUTE')
  WHERE r.rolname IN ('anon','public')
    AND n.nspname = 'public';

  IF leaks IS NOT NULL THEN
    RAISE EXCEPTION 'Public schema function EXECUTE for anon/public detected: %', leaks;
  END IF;

  -- Check for RLS disabled (only in public schema)
  SELECT string_agg(n.nspname||'.'||c.relname, ', ')
  INTO leaks
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r'
    AND n.nspname = 'public'
    AND c.relrowsecurity = false;

  IF leaks IS NOT NULL THEN
    RAISE EXCEPTION 'Public schema RLS disabled on: %', leaks;
  END IF;
END
$$;

-- Schema hygiene
REVOKE CREATE ON SCHEMA public FROM public;

-- Verify security posture
SELECT sec.assert_no_anon_public_leaks();