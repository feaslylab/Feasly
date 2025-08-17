-- Phase 11A.6 - Explicit deny policies for anon (quiet the linter, harmless w/ RLS)
-- RLS combines policies with OR. A false policy adds no access but makes intent explicit.

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT n.nspname as schema, c.relname as table
    FROM pg_class c
    JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE c.relkind='r'
      AND n.nspname NOT IN ('pg_catalog','information_schema','auth','vault','extensions','graphql','graphql_public','realtime','supabase_functions','storage')
  LOOP
    -- Check if deny_anon_all policy already exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = r.schema AND tablename = r.table AND policyname = 'deny_anon_all'
    ) THEN
      EXECUTE format('CREATE POLICY deny_anon_all ON %I.%I FOR ALL TO anon USING (false) WITH CHECK (false);', r.schema, r.table);
    END IF;
  END LOOP;
END$$;