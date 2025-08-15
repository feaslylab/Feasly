-- Fix database schema issues causing TypeScript errors

-- 1. Fix assets table - add missing columns and fix type field
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS annual_operating_cost_aed numeric DEFAULT 0;

-- Rename asset_type to type to match the TypeScript interface
ALTER TABLE public.assets 
RENAME COLUMN asset_type TO type;

-- 2. Fix scenario_overrides table - the current table seems to be using assets columns instead
-- Check if scenario_overrides exists properly
CREATE TABLE IF NOT EXISTS public.scenario_overrides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  field_name text NOT NULL,
  override_value numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on scenario_overrides
ALTER TABLE public.scenario_overrides ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for scenario_overrides
CREATE POLICY "Users can access overrides for their projects" 
ON public.scenario_overrides 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM scenarios s
  JOIN projects p ON s.project_id = p.id
  WHERE s.id = scenario_overrides.scenario_id 
  AND p.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM scenarios s
  JOIN projects p ON s.project_id = p.id
  WHERE s.id = scenario_overrides.scenario_id 
  AND p.user_id = auth.uid()
));

-- 3. Fix scenarios table - add missing columns if needed
ALTER TABLE public.scenarios 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'Base Case',
ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();

-- Add updated_at trigger for scenario_overrides
CREATE TRIGGER update_scenario_overrides_updated_at
  BEFORE UPDATE ON public.scenario_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for assets
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();