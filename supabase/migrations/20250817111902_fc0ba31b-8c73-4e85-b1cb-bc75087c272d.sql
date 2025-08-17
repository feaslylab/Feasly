-- Phase 11G — Linter-Silent, Self-Healing Security

-- 11G.0 — Guard Function (final form)
-- Ensures every policy uses a stable, safe checker with a locked search_path.

CREATE SCHEMA IF NOT EXISTS sec;

CREATE OR REPLACE FUNCTION sec.is_authenticated_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SET search_path = pg_catalog, public
AS $$
  SELECT auth.uid() IS NOT NULL AND auth.role() = 'authenticated'
$$;

-- 11G.1 — Explicit denies for BOTH anon and public (lint-quiet)
-- RLS already denies implicitly; these "false" policies add no access but keep the linter quiet.

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT n.nspname AS schema, c.relname AS table
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname NOT IN ('pg_catalog','information_schema','auth')
  LOOP
    -- deny anon
    EXECUTE format($f$
      DO $inner$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = %L AND tablename = %L AND policyname = 'deny_anon_all'
        ) THEN
          EXECUTE format('CREATE POLICY deny_anon_all ON %I.%I FOR ALL TO anon USING (false) WITH CHECK (false);', %L, %L);
        END IF;
      END$inner$;
    $f$, r.schema, r.table, r.schema, r.table);

    -- deny public
    EXECUTE format($f$
      DO $inner$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = %L AND tablename = %L AND policyname = 'deny_public_all'
        ) THEN
          EXECUTE format('CREATE POLICY deny_public_all ON %I.%I FOR ALL TO public USING (false) WITH CHECK (false);', %L, %L);
        END IF;
      END$inner$;
    $f$, r.schema, r.table, r.schema, r.table);
  END LOOP;
END$$;

-- 11G.2 — Event Trigger: auto-enable RLS + auto-create explicit denies on new tables
-- This prevents future regressions when someone adds a table and forgets RLS/policies.

-- 1) Helper to harden a single table (idempotent)
CREATE OR REPLACE FUNCTION sec.harden_table(_sch TEXT, _tbl TEXT)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', _sch, _tbl);
  
  PERFORM 1
  FROM pg_policies
  WHERE schemaname = _sch AND tablename = _tbl AND policyname = 'deny_anon_all';
  IF NOT FOUND THEN
    EXECUTE format(
      'CREATE POLICY deny_anon_all ON %I.%I FOR ALL TO anon USING (false) WITH CHECK (false);',
      _sch, _tbl
    );
  END IF;

  PERFORM 1
  FROM pg_policies
  WHERE schemaname = _sch AND tablename = _tbl AND policyname = 'deny_public_all';
  IF NOT FOUND THEN
    EXECUTE format(
      'CREATE POLICY deny_public_all ON %I.%I FOR ALL TO public USING (false) WITH CHECK (false);',
      _sch, _tbl
    );
  END IF;
END
$$;

-- 3) The trigger procedure
CREATE OR REPLACE FUNCTION sec.on_create_table()
RETURNS event_trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF r.schema_name NOT IN ('pg_catalog','information_schema','auth') THEN
      PERFORM sec.harden_table(r.schema_name, r.object_name);
    END IF;
  END LOOP;
END
$$;

-- 2) Event trigger to call harden_table on CREATE TABLE
DROP EVENT TRIGGER IF EXISTS trg_harden_new_tables;
CREATE EVENT TRIGGER trg_harden_new_tables
ON ddl_command_end
WHEN tag IN ('CREATE TABLE')
EXECUTE PROCEDURE sec.on_create_table();

-- 11G.3 — Assert function: fail migrations/CI if any anon/public leaks reappear
-- Use this to make your migrations self-testable, and wire it into CI.

CREATE OR REPLACE FUNCTION sec.assert_no_anon_public_leaks()
RETURNS VOID
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE leaks TEXT;
BEGIN
  -- A) table grants
  SELECT string_agg(table_schema||'.'||table_name||'/'||privilege_type||'→'||grantee, ', ')
  INTO leaks
  FROM information_schema.table_privileges
  WHERE grantee IN ('anon','public');

  IF leaks IS NOT NULL THEN
    RAISE EXCEPTION 'Grants to anon/public detected: %', leaks;
  END IF;

  -- B) function EXECUTE grants
  SELECT string_agg(n.nspname||'.'||p.proname||'→'||r.rolname, ', ')
  INTO leaks
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  JOIN pg_roles r ON has_function_privilege(r.oid, p.oid, 'EXECUTE')
  WHERE r.rolname IN ('anon','public')
    AND n.nspname NOT IN ('pg_catalog','information_schema','auth');

  IF leaks IS NOT NULL THEN
    RAISE EXCEPTION 'Function EXECUTE for anon/public detected: %', leaks;
  END IF;

  -- C) RLS off anywhere
  SELECT string_agg(n.nspname||'.'||c.relname, ', ')
  INTO leaks
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r'
    AND n.nspname NOT IN ('pg_catalog','information_schema')
    AND c.relrowsecurity = false;

  IF leaks IS NOT NULL THEN
    RAISE EXCEPTION 'RLS disabled on: %', leaks;
  END IF;
END
$$;

-- 11G.4 — Public schema hygiene (safe, common)
-- These are standard hardening lines that linters also like to see.

-- Don't let "public" role create objects in schema public
REVOKE CREATE ON SCHEMA public FROM public;

-- Run the assert function now (will raise if anything regressed)
SELECT sec.assert_no_anon_public_leaks();