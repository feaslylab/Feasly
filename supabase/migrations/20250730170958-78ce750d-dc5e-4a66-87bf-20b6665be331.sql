-- Add scenario_id to existing construction_item table (if not present)
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

-- Create revenue_sale table (idempotent)
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

-- Create revenue_rental table (idempotent)
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

-- Enable RLS on new tables
ALTER TABLE public.revenue_sale ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_rental ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for revenue_sale
CREATE POLICY "users_own_revenue_sale" ON public.revenue_sale
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create RLS policies for revenue_rental  
CREATE POLICY "users_own_revenue_rental" ON public.revenue_rental
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());