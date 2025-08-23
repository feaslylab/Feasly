-- Portfolio System: Alternative Implementation Using Existing Tables
-- Add portfolio functionality to existing project structure

-- 1. Add portfolio fields to existing projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS is_portfolio BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS portfolio_settings JSONB DEFAULT '{"weighting_method": "equal", "aggregation_rules": {"irr": "weighted", "npv": "sum", "roi": "weighted"}}';

-- 2. Add portfolio relationship fields to assets table  
ALTER TABLE public.assets
ADD COLUMN IF NOT EXISTS portfolio_weight NUMERIC DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS portfolio_scenario_id UUID REFERENCES public.scenarios(id);

-- 3. Create indexes for portfolio functionality
CREATE INDEX IF NOT EXISTS idx_projects_is_portfolio ON public.projects(is_portfolio, owner_id);
CREATE INDEX IF NOT EXISTS idx_assets_portfolio_scenario ON public.assets(portfolio_scenario_id);
CREATE INDEX IF NOT EXISTS idx_assets_project_portfolio ON public.assets(project_id, portfolio_scenario_id) WHERE portfolio_scenario_id IS NOT NULL;

-- 4. Create function to get portfolio assets with their scenarios
CREATE OR REPLACE FUNCTION get_portfolio_composition(project_uuid UUID)
RETURNS TABLE(
  asset_id UUID,
  asset_name TEXT,
  project_id UUID,
  scenario_id UUID,
  scenario_name TEXT,
  is_base_scenario BOOLEAN,
  weight NUMERIC
) 
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT 
    a.id as asset_id,
    a.name as asset_name,
    a.project_id,
    COALESCE(a.portfolio_scenario_id, s.id) as scenario_id,
    s.name as scenario_name,
    s.is_base as is_base_scenario,
    a.portfolio_weight as weight
  FROM public.assets a
  LEFT JOIN public.scenarios s ON s.asset_id = a.id 
    AND (a.portfolio_scenario_id IS NULL AND s.is_base = true 
         OR s.id = a.portfolio_scenario_id)
  WHERE a.project_id = project_uuid
    AND EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_uuid 
      AND (p.owner_id = auth.uid() OR p.owner_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
      ))
    );
$$;

-- 5. Create function to validate portfolio scenario assignments
CREATE OR REPLACE FUNCTION validate_portfolio_scenario_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- If portfolio_scenario_id is being set, ensure it belongs to this asset
  IF NEW.portfolio_scenario_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.scenarios s 
      WHERE s.id = NEW.portfolio_scenario_id AND s.asset_id = NEW.id
    ) THEN
      RAISE EXCEPTION 'Portfolio scenario % does not belong to asset %', NEW.portfolio_scenario_id, NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Add trigger to validate portfolio scenario assignments
DROP TRIGGER IF EXISTS validate_portfolio_scenario_trigger ON public.assets;
CREATE TRIGGER validate_portfolio_scenario_trigger
  BEFORE INSERT OR UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION validate_portfolio_scenario_assignment();

-- 7. Create helper function to initialize portfolio from existing project
CREATE OR REPLACE FUNCTION convert_project_to_portfolio(project_uuid UUID, portfolio_name TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_record public.projects%ROWTYPE;
BEGIN
  -- Check if user has access to this project
  SELECT * INTO project_record FROM public.projects 
  WHERE id = project_uuid 
  AND (owner_id = auth.uid() OR owner_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid()
  ));
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found or access denied';
  END IF;
  
  -- Convert project to portfolio
  UPDATE public.projects 
  SET 
    is_portfolio = true,
    name = COALESCE(portfolio_name, name || ' Portfolio'),
    updated_at = now()
  WHERE id = project_uuid;
  
  -- Set default portfolio scenarios for each asset (use base scenarios)
  UPDATE public.assets 
  SET portfolio_scenario_id = (
    SELECT s.id FROM public.scenarios s 
    WHERE s.asset_id = assets.id AND s.is_base = true
    LIMIT 1
  )
  WHERE project_id = project_uuid;
  
  RETURN true;
END;
$$;