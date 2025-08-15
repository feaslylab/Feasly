-- Fix database schema issues and complete security fixes

-- 1. Fix assets table - add missing columns and fix type field
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS annual_operating_cost_aed numeric DEFAULT 0;

-- Update any existing assets with null operating costs
UPDATE public.assets 
SET annual_operating_cost_aed = 0 
WHERE annual_operating_cost_aed IS NULL;

-- 2. Drop and recreate scenario_overrides policies
DROP POLICY IF EXISTS "Users can access overrides for their projects" ON public.scenario_overrides;
DROP POLICY IF EXISTS "Users can view overrides for their projects" ON public.scenario_overrides;

-- Recreate the correct policies
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
ADD COLUMN IF NOT EXISTS user_id uuid;

-- Update scenarios user_id based on project ownership
UPDATE public.scenarios 
SET user_id = p.user_id
FROM projects p 
WHERE scenarios.project_id = p.id 
AND scenarios.user_id IS NULL;

-- 4. Add missing triggers
DROP TRIGGER IF EXISTS update_scenario_overrides_updated_at ON public.scenario_overrides;
CREATE TRIGGER update_scenario_overrides_updated_at
  BEFORE UPDATE ON public.scenario_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_assets_updated_at ON public.assets;
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Secure the import_emdf edge function by requiring authentication
-- Update import_emdf to require JWT validation and derive user_id from auth
-- This will be handled in the edge function code update