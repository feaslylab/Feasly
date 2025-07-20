import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          type: 'Residential' | 'Mixed Use' | 'Retail' | 'Hospitality' | 'Infrastructure';
          gfa_sqm: number;
          construction_cost_aed: number;
          annual_operating_cost_aed: number;
          annual_revenue_potential_aed: number;
          occupancy_rate_percent: number;
          cap_rate_percent: number;
          development_timeline_months: number;
          stabilization_period_months: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          type: 'Residential' | 'Mixed Use' | 'Retail' | 'Hospitality' | 'Infrastructure';
          gfa_sqm: number;
          construction_cost_aed: number;
          annual_operating_cost_aed: number;
          annual_revenue_potential_aed: number;
          occupancy_rate_percent: number;
          cap_rate_percent: number;
          development_timeline_months: number;
          stabilization_period_months: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          type?: 'Residential' | 'Mixed Use' | 'Retail' | 'Hospitality' | 'Infrastructure';
          gfa_sqm?: number;
          construction_cost_aed?: number;
          annual_operating_cost_aed?: number;
          annual_revenue_potential_aed?: number;
          occupancy_rate_percent?: number;
          cap_rate_percent?: number;
          development_timeline_months?: number;
          stabilization_period_months?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      scenarios: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          type: 'Base Case' | 'Optimistic' | 'Pessimistic';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          type: 'Base Case' | 'Optimistic' | 'Pessimistic';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          type?: 'Base Case' | 'Optimistic' | 'Pessimistic';
          created_at?: string;
          updated_at?: string;
        };
      };
      scenario_overrides: {
        Row: {
          id: string;
          scenario_id: string;
          asset_id: string;
          field_name: string;
          override_value: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          scenario_id: string;
          asset_id: string;
          field_name: string;
          override_value: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          scenario_id?: string;
          asset_id?: string;
          field_name?: string;
          override_value?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};