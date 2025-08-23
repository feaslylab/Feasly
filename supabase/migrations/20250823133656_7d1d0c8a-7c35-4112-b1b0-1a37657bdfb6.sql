-- Portfolio System Implementation: Flexible Multi-Asset, Multi-Scenario Management
-- Phase 1: Core Tables and Access Control

-- 1. Create portfolios table for dynamic collections
CREATE TABLE public.portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL, -- Owner (user or organization)
  settings JSONB DEFAULT '{"weighting_method": "equal", "aggregation_rules": {"irr": "weighted", "npv": "sum", "roi": "weighted"}}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create portfolio_assets junction table for flexible asset+scenario relationships
CREATE TABLE public.portfolio_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  weight_override NUMERIC, -- Optional manual weight override
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique combinations within a portfolio
  UNIQUE(portfolio_id, asset_id),
  
  -- Ensure scenario belongs to the asset (data integrity)
  CONSTRAINT portfolio_assets_scenario_asset_check 
    CHECK (EXISTS (
      SELECT 1 FROM public.scenarios s 
      WHERE s.id = scenario_id AND s.asset_id = portfolio_assets.asset_id
    ))
);

-- 3. Enable Row Level Security
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_assets ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for portfolios
CREATE POLICY "Users can manage their own portfolios" ON public.portfolios
FOR ALL USING (
  is_authenticated_user() AND (
    -- Direct ownership
    user_id = auth.uid() OR
    -- Organization membership
    user_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  )
);

-- 5. Create RLS policies for portfolio_assets
CREATE POLICY "Users can manage portfolio assets they own" ON public.portfolio_assets
FOR ALL USING (
  is_authenticated_user() AND (
    -- Must own the portfolio
    portfolio_id IN (
      SELECT id FROM public.portfolios 
      WHERE user_id = auth.uid() OR 
      user_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
      )
    ) AND
    -- Must have access to the asset
    asset_id IN (
      SELECT a.id FROM public.assets a
      JOIN public.projects p ON p.id = a.project_id
      WHERE p.owner_id = auth.uid() OR 
      p.owner_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  )
);

-- 6. Create performance indexes
CREATE INDEX idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX idx_portfolio_assets_portfolio_id ON public.portfolio_assets(portfolio_id);
CREATE INDEX idx_portfolio_assets_asset_scenario ON public.portfolio_assets(asset_id, scenario_id);
CREATE INDEX idx_portfolios_created_at ON public.portfolios(created_at DESC);

-- 7. Add update timestamp triggers
CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Create validation function to ensure scenario belongs to asset
CREATE OR REPLACE FUNCTION validate_portfolio_asset_scenario()
RETURNS TRIGGER AS $$
BEGIN
  -- Check that the scenario belongs to the specified asset
  IF NOT EXISTS (
    SELECT 1 FROM public.scenarios s 
    WHERE s.id = NEW.scenario_id AND s.asset_id = NEW.asset_id
  ) THEN
    RAISE EXCEPTION 'Scenario % does not belong to asset %', NEW.scenario_id, NEW.asset_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Add trigger to validate scenario-asset relationships
CREATE TRIGGER validate_portfolio_asset_scenario_trigger
  BEFORE INSERT OR UPDATE ON public.portfolio_assets
  FOR EACH ROW
  EXECUTE FUNCTION validate_portfolio_asset_scenario();

-- 10. Create helper function to get portfolio summary
CREATE OR REPLACE FUNCTION get_portfolio_summary(portfolio_uuid UUID)
RETURNS TABLE(
  portfolio_name TEXT,
  total_assets INTEGER,
  unique_projects INTEGER,
  scenario_mix JSONB
) 
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT 
    p.name as portfolio_name,
    COUNT(pa.asset_id)::INTEGER as total_assets,
    COUNT(DISTINCT a.project_id)::INTEGER as unique_projects,
    jsonb_object_agg(
      CASE WHEN s.is_base THEN 'base' ELSE 'variant' END, 
      COUNT(*)
    ) as scenario_mix
  FROM public.portfolios p
  LEFT JOIN public.portfolio_assets pa ON pa.portfolio_id = p.id
  LEFT JOIN public.assets a ON a.id = pa.asset_id
  LEFT JOIN public.scenarios s ON s.id = pa.scenario_id
  WHERE p.id = portfolio_uuid
    AND (p.user_id = auth.uid() OR p.user_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    ))
  GROUP BY p.name;
$$;