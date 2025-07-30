-- Scenarios table (one row per model version)
CREATE TABLE public.scenarios (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL,
  name          text NOT NULL,
  user_id       uuid NOT NULL,
  created_at    timestamp with time zone DEFAULT now(),
  updated_at    timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- RLS policies for scenarios
CREATE POLICY "Users can view their own scenarios"
ON public.scenarios FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scenarios"
ON public.scenarios FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenarios"
ON public.scenarios FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenarios"
ON public.scenarios FOR DELETE
USING (auth.uid() = user_id);

-- Link: scenario ↔ construction_item (existing table already has user_id and project_id)
ALTER TABLE public.construction_item ADD COLUMN scenario_id uuid;

-- Create revenue_sale table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.revenue_sale (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       uuid NOT NULL,
  user_id          uuid NOT NULL,
  scenario_id      uuid,
  units            integer NOT NULL DEFAULT 0,
  price_per_unit   numeric NOT NULL DEFAULT 0,
  start_period     integer NOT NULL DEFAULT 0,
  end_period       integer NOT NULL DEFAULT 0,
  escalation       numeric NOT NULL DEFAULT 0,
  created_at       timestamp with time zone DEFAULT now(),
  updated_at       timestamp with time zone DEFAULT now()
);

-- Enable RLS for revenue_sale
ALTER TABLE public.revenue_sale ENABLE ROW LEVEL SECURITY;

-- RLS policies for revenue_sale
CREATE POLICY "Users can view their own revenue_sale records"
ON public.revenue_sale FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own revenue_sale records"
ON public.revenue_sale FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revenue_sale records"
ON public.revenue_sale FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revenue_sale records"
ON public.revenue_sale FOR DELETE
USING (auth.uid() = user_id);

-- Create revenue_rental table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.revenue_rental (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id          uuid NOT NULL,
  user_id             uuid NOT NULL,
  scenario_id         uuid,
  rooms               integer NOT NULL DEFAULT 0,
  adr                 numeric NOT NULL DEFAULT 0,
  occupancy_rate      numeric NOT NULL DEFAULT 0,
  start_period        integer NOT NULL DEFAULT 0,
  end_period          integer NOT NULL DEFAULT 0,
  annual_escalation   numeric NOT NULL DEFAULT 0,
  created_at          timestamp with time zone DEFAULT now(),
  updated_at          timestamp with time zone DEFAULT now()
);

-- Enable RLS for revenue_rental
ALTER TABLE public.revenue_rental ENABLE ROW LEVEL SECURITY;

-- RLS policies for revenue_rental
CREATE POLICY "Users can view their own revenue_rental records"
ON public.revenue_rental FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own revenue_rental records"
ON public.revenue_rental FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revenue_rental records"
ON public.revenue_rental FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revenue_rental records"
ON public.revenue_rental FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at trigger for scenarios
CREATE TRIGGER update_scenarios_updated_at
  BEFORE UPDATE ON public.scenarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for revenue_sale
CREATE TRIGGER update_revenue_sale_updated_at
  BEFORE UPDATE ON public.revenue_sale
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for revenue_rental
CREATE TRIGGER update_revenue_rental_updated_at
  BEFORE UPDATE ON public.revenue_rental
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();