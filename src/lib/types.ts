// Consolidated type definitions to resolve conflicts
// This replaces scattered interface definitions that conflict with database schema

export interface Asset {
  id: string;
  project_id: string;
  name: string;
  type: string; // Flexible to accept any asset type from database
  gfa_sqm: number | null;
  construction_cost_aed: number | null;
  annual_operating_cost_aed: number | null;
  annual_revenue_aed: number | null;
  occupancy_rate_percent: number | null;
  cap_rate_percent: number | null;
  development_timeline_months: number | null;
  stabilization_period_months: number | null;
  created_at: string | null;
  updated_at: string | null;
  [key: string]: any; // Allow additional properties for flexibility
}

export interface ScenarioOverride {
  id?: string;
  scenario_id: string;
  asset_id: string;
  field_name: string;
  override_value: number;
  created_at?: string;
  updated_at?: string;
}

export interface TeamMember {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  created_at: string;
  profiles: {
    email: string;
    full_name?: string;
  };
}

export interface Scenario {
  id: string;
  project_id: string;
  name: string;
  type?: string; // Made optional since database might not have this field
  is_base: boolean;
  created_at: string;
  updated_at: string;
  user_id?: string;
  description?: string;
  [key: string]: any; // Allow additional properties
}