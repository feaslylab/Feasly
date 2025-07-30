-- Create construction_item table
CREATE TABLE public.construction_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  base_cost numeric NOT NULL,
  start_period integer NOT NULL,
  end_period integer NOT NULL,
  escalation_rate numeric NOT NULL DEFAULT 0,
  retention_percent numeric NOT NULL DEFAULT 0,
  retention_release_lag integer NOT NULL DEFAULT 0,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create kpi_snapshot table
CREATE TABLE public.kpi_snapshot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  npv numeric NOT NULL,
  irr numeric,
  profit numeric NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.construction_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_snapshot ENABLE ROW LEVEL SECURITY;

-- RLS policies for construction_item
CREATE POLICY "Users can view their own construction items"
ON public.construction_item
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own construction items"
ON public.construction_item
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own construction items"
ON public.construction_item
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own construction items"
ON public.construction_item
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for kpi_snapshot
CREATE POLICY "Users can view their own KPI snapshots"
ON public.kpi_snapshot
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KPI snapshots"
ON public.kpi_snapshot
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KPI snapshots"
ON public.kpi_snapshot
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own KPI snapshots"
ON public.kpi_snapshot
FOR DELETE
USING (auth.uid() = user_id);

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE construction_item, kpi_snapshot;