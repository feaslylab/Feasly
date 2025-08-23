-- Complete Portfolio System: Add missing helper functions

-- 1. Fix the search path security issue for existing functions
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
$$ LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public;

-- 2. Create the missing portfolio composition function
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
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
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
      AND (p.user_id = auth.uid() OR p.organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
      ))
    );
END;
$$;

-- 3. Create the project to portfolio conversion function
CREATE OR REPLACE FUNCTION convert_project_to_portfolio(project_uuid UUID, portfolio_name TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_record public.projects%ROWTYPE;
BEGIN
  -- Check if user has access to this project
  SELECT * INTO project_record FROM public.projects 
  WHERE id = project_uuid 
  AND (user_id = auth.uid() OR organization_id IN (
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