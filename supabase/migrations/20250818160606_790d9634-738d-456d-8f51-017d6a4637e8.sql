-- Create org_role enum for personas
DO $$ BEGIN
  CREATE TYPE org_role AS ENUM (
    'executive_sponsor',
    'finance_controller',
    'development_lead',
    'analyst'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add role column to organization_members (assuming this table exists)
ALTER TABLE organization_members 
  ADD COLUMN IF NOT EXISTS role org_role DEFAULT 'analyst';

-- Create scenario_permissions table for Phase 2 foundation
CREATE TABLE IF NOT EXISTS scenario_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  can_edit boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scenario_id, user_id)
);

-- Enable RLS on scenario_permissions
ALTER TABLE scenario_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policy for scenario_permissions
CREATE POLICY IF NOT EXISTS "scenario_permissions_member_read" 
ON scenario_permissions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM organization_members om
    WHERE om.user_id = auth.uid()
  )
);