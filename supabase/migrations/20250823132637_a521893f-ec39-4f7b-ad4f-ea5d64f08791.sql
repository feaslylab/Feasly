-- Enterprise Schema Refactor: Step 1 - Create new projects table and update assets
-- Breaking into smaller steps to avoid Supabase internal errors

-- 1. Create new projects table (development initiative containers)
CREATE TABLE IF NOT EXISTS public.new_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL,
  start_date DATE,
  end_date DATE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Add new columns to assets table for asset-level modeling
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS project_id UUID,
ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'AED',
ADD COLUMN IF NOT EXISTS unit_system TEXT DEFAULT 'sqm',
ADD COLUMN IF NOT EXISTS gfa_residential NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS gfa_retail NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS gfa_office NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_price_residential NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_price_retail NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_price_office NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS use_segmented_revenue BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_escalation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS construction_escalation_percent NUMERIC DEFAULT 4.0,
ADD COLUMN IF NOT EXISTS escalation_start_month INTEGER DEFAULT 6,
ADD COLUMN IF NOT EXISTS escalation_duration_months INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS zakat_applicable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS zakat_rate_percent NUMERIC,
ADD COLUMN IF NOT EXISTS zakat_exclude_losses BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS zakat_calculation_method TEXT DEFAULT 'net_profit',
ADD COLUMN IF NOT EXISTS escrow_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS escrow_percent NUMERIC DEFAULT 20.0,
ADD COLUMN IF NOT EXISTS release_threshold NUMERIC DEFAULT 75.0,
ADD COLUMN IF NOT EXISTS release_trigger_type TEXT DEFAULT 'construction_percent',
ADD COLUMN IF NOT EXISTS release_rule_details TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- 3. Add asset_id to scenarios table
ALTER TABLE public.scenarios 
ADD COLUMN IF NOT EXISTS asset_id UUID,
ADD COLUMN IF NOT EXISTS is_base BOOLEAN DEFAULT false;

-- 4. Enable RLS on new table
ALTER TABLE public.new_projects ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policy for new projects
CREATE POLICY "Users can manage their projects" ON public.new_projects
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    owner_id = auth.uid() OR
    owner_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  )
);