-- Add scenario_id column to kpi_snapshot table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name   = 'kpi_snapshot'
        AND column_name  = 'scenario_id'
  ) THEN
    ALTER TABLE public.kpi_snapshot ADD COLUMN scenario_id uuid;
  END IF;
END $$;

-- Update RLS policies to ensure proper access control
DROP POLICY IF EXISTS "Users can delete their own KPI snapshots" ON public.kpi_snapshot;
DROP POLICY IF EXISTS "Users can insert their own KPI snapshots" ON public.kpi_snapshot;
DROP POLICY IF EXISTS "Users can update their own KPI snapshots" ON public.kpi_snapshot;
DROP POLICY IF EXISTS "Users can view their own KPI snapshots" ON public.kpi_snapshot;

-- Recreate policies with proper naming
CREATE POLICY "kpi_snapshot_own_rows" ON public.kpi_snapshot
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());