-- ───────────────────────────────────────────────────────────────
-- SCENARIO-AWARE TABLE / COLUMN UPDATES
-- ───────────────────────────────────────────────────────────────

-- 1. add scenario_id to existing cost table (if not present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name   = 'construction_item'
        AND column_name  = 'scenario_id'
  ) THEN
    ALTER TABLE public.construction_item
      ADD COLUMN scenario_id uuid;
  END IF;
END $$;

-- 2. create revenue_sale table   (idempotent)
CREATE TABLE IF NOT EXISTS public.revenue_sale (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     uuid        NOT NULL,
  user_id        uuid        NOT NULL,
  scenario_id    uuid,
  units          integer     NOT NULL DEFAULT 0,
  price_per_unit numeric     NOT NULL DEFAULT 0,
  start_period   integer     NOT NULL DEFAULT 0,
  end_period     integer     NOT NULL DEFAULT 0,
  escalation     numeric     NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- 3. create revenue_rental table  (idempotent)
CREATE TABLE IF NOT EXISTS public.revenue_rental (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        uuid        NOT NULL,
  user_id           uuid        NOT NULL,
  scenario_id       uuid,
  rooms             integer     NOT NULL DEFAULT 0,
  adr               numeric     NOT NULL DEFAULT 0,
  occupancy_rate    numeric     NOT NULL DEFAULT 0,
  start_period      integer     NOT NULL DEFAULT 0,
  end_period        integer     NOT NULL DEFAULT 0,
  annual_escalation numeric     NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────
-- RLS ENABLE + POLICIES  (only if not already in place)
-- ───────────────────────────────────────────────────────────────

-- Helper proc to enable RLS & user-ownership policy
CREATE OR REPLACE PROCEDURE public.ensure_rls(tab text) LANGUAGE plpgsql AS $$
DECLARE pol_view text := tab || '_rls_view';
BEGIN
  -- enable RLS once
  EXECUTE format(
    'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tab
  );

  -- policy for SELECT, UPDATE, DELETE
  PERFORM 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = tab
      AND policyname = 'users_own_rows';
  IF NOT FOUND THEN
    EXECUTE format(
      $$CREATE POLICY users_own_rows ON public.%I
        USING  (user_id = auth.uid())
        WITH   CHECK (user_id = auth.uid());$$, tab);
  END IF;
END $$;

-- apply to each table
CALL public.ensure_rls('construction_item');
CALL public.ensure_rls('revenue_sale');
CALL public.ensure_rls('revenue_rental');

-- ───────────────────────────────────────────────────────────────
-- PUBLICATION (realtime) – add new tables
-- ───────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE
  IF NOT EXISTS public.revenue_sale,
  IF NOT EXISTS public.revenue_rental;