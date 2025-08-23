-- Portfolio System: Fix column references and implement core functionality

-- 1. Add portfolio fields to existing projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS is_portfolio BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS portfolio_settings JSONB DEFAULT '{"weighting_method": "equal", "aggregation_rules": {"irr": "weighted", "npv": "sum", "roi": "weighted"}}';

-- 2. Add portfolio relationship fields to assets table  
ALTER TABLE public.assets
ADD COLUMN IF NOT EXISTS portfolio_weight NUMERIC DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS portfolio_scenario_id UUID;

-- 3. Create indexes for portfolio functionality
CREATE INDEX IF NOT EXISTS idx_projects_is_portfolio ON public.projects(is_portfolio, user_id);
CREATE INDEX IF NOT EXISTS idx_assets_portfolio_scenario ON public.assets(portfolio_scenario_id);

-- 4. Add foreign key constraint for portfolio scenario
ALTER TABLE public.assets 
DROP CONSTRAINT IF EXISTS assets_portfolio_scenario_fkey,
ADD CONSTRAINT assets_portfolio_scenario_fkey 
FOREIGN KEY (portfolio_scenario_id) REFERENCES public.scenarios(id) ON DELETE SET NULL;

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