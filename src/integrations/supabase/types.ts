export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      alert_pref: {
        Row: {
          irr_threshold: number | null
          npv_threshold: number | null
          user_id: string
        }
        Insert: {
          irr_threshold?: number | null
          npv_threshold?: number | null
          user_id: string
        }
        Update: {
          irr_threshold?: number | null
          npv_threshold?: number | null
          user_id?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          annual_revenue_aed: number | null
          asset_type: string
          cap_rate_percent: number | null
          construction_cost_aed: number | null
          created_at: string | null
          development_timeline_months: number | null
          gfa_sqm: number | null
          id: string
          name: string
          occupancy_rate_percent: number | null
          operating_cost_aed: number | null
          project_id: string | null
          stabilization_period_months: number | null
        }
        Insert: {
          annual_revenue_aed?: number | null
          asset_type: string
          cap_rate_percent?: number | null
          construction_cost_aed?: number | null
          created_at?: string | null
          development_timeline_months?: number | null
          gfa_sqm?: number | null
          id?: string
          name: string
          occupancy_rate_percent?: number | null
          operating_cost_aed?: number | null
          project_id?: string | null
          stabilization_period_months?: number | null
        }
        Update: {
          annual_revenue_aed?: number | null
          asset_type?: string
          cap_rate_percent?: number | null
          construction_cost_aed?: number | null
          created_at?: string | null
          development_timeline_months?: number | null
          gfa_sqm?: number | null
          id?: string
          name?: string
          occupancy_rate_percent?: number | null
          operating_cost_aed?: number | null
          project_id?: string | null
          stabilization_period_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      comment: {
        Row: {
          created_at: string | null
          id: string
          message: string
          project_id: string
          scenario_id: string | null
          target: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          project_id: string
          scenario_id?: string | null
          target?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          project_id?: string
          scenario_id?: string | null
          target?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      construction_item: {
        Row: {
          base_cost: number
          created_at: string | null
          end_period: number
          escalation_rate: number
          id: string
          project_id: string
          retention_percent: number
          retention_release_lag: number
          scenario_id: string | null
          start_period: number
          user_id: string
        }
        Insert: {
          base_cost: number
          created_at?: string | null
          end_period: number
          escalation_rate?: number
          id?: string
          project_id: string
          retention_percent?: number
          retention_release_lag?: number
          scenario_id?: string | null
          start_period: number
          user_id: string
        }
        Update: {
          base_cost?: number
          created_at?: string | null
          end_period?: number
          escalation_rate?: number
          id?: string
          project_id?: string
          retention_percent?: number
          retention_release_lag?: number
          scenario_id?: string | null
          start_period?: number
          user_id?: string
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          body: string
          created_at: string | null
          id: string
          sent: boolean | null
          subject: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          sent?: boolean | null
          subject: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          sent?: boolean | null
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      escrow_releases: {
        Row: {
          construction_progress_percent: number | null
          created_at: string
          id: string
          is_projected: boolean
          milestone_achieved: string | null
          project_id: string
          release_amount: number
          release_date: string
          release_percentage: number
          trigger_details: string | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          construction_progress_percent?: number | null
          created_at?: string
          id?: string
          is_projected?: boolean
          milestone_achieved?: string | null
          project_id: string
          release_amount: number
          release_date: string
          release_percentage: number
          trigger_details?: string | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          construction_progress_percent?: number | null
          created_at?: string
          id?: string
          is_projected?: boolean
          milestone_achieved?: string | null
          project_id?: string
          release_amount?: number
          release_date?: string
          release_percentage?: number
          trigger_details?: string | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          from_currency: string
          id: string
          rate: number
          to_currency: string
          updated_at: string
        }
        Insert: {
          from_currency: string
          id?: string
          rate: number
          to_currency: string
          updated_at?: string
        }
        Update: {
          from_currency?: string
          id?: string
          rate?: number
          to_currency?: string
          updated_at?: string
        }
        Relationships: []
      }
      export_history: {
        Row: {
          export_type: string
          exported_at: string | null
          filename: string | null
          id: string
          project_id: string | null
          scenario_id: string | null
          user_id: string | null
        }
        Insert: {
          export_type: string
          exported_at?: string | null
          filename?: string | null
          id?: string
          project_id?: string | null
          scenario_id?: string | null
          user_id?: string | null
        }
        Update: {
          export_type?: string
          exported_at?: string | null
          filename?: string | null
          id?: string
          project_id?: string | null
          scenario_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "export_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "export_history_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      feasly_alerts: {
        Row: {
          alert_type: string
          body: string
          created_at: string
          id: string
          metadata: Json | null
          project_id: string
          resolved: boolean
          resolved_at: string | null
          severity: string
          title: string
          triggered_at: string
          updated_at: string
        }
        Insert: {
          alert_type: string
          body: string
          created_at?: string
          id?: string
          metadata?: Json | null
          project_id: string
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          title: string
          triggered_at?: string
          updated_at?: string
        }
        Update: {
          alert_type?: string
          body?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          project_id?: string
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          title?: string
          triggered_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      feasly_benchmarks: {
        Row: {
          asset_type: string
          avg_irr: number
          avg_profit_margin: number
          avg_roi: number
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          asset_type: string
          avg_irr: number
          avg_profit_margin: number
          avg_roi: number
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          asset_type?: string
          avg_irr?: number
          avg_profit_margin?: number
          avg_roi?: number
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      feasly_cashflows: {
        Row: {
          cash_balance: number | null
          construction_cost: number | null
          created_at: string
          created_by: string | null
          equity_injected: number | null
          escrow_released: number | null
          escrow_reserved: number | null
          id: string
          is_latest: boolean
          land_cost: number | null
          loan_drawn: number | null
          loan_interest: number | null
          loan_repayment: number | null
          month: string
          net_cashflow: number | null
          profit: number | null
          project_id: string
          revenue: number | null
          revenue_office: number | null
          revenue_residential: number | null
          revenue_retail: number | null
          scenario: string
          soft_costs: number | null
          updated_at: string
          vat_on_costs: number | null
          vat_recoverable: number | null
          version_created_at: string | null
          version_label: string
          version_notes: string | null
          zakat_due: number | null
        }
        Insert: {
          cash_balance?: number | null
          construction_cost?: number | null
          created_at?: string
          created_by?: string | null
          equity_injected?: number | null
          escrow_released?: number | null
          escrow_reserved?: number | null
          id?: string
          is_latest?: boolean
          land_cost?: number | null
          loan_drawn?: number | null
          loan_interest?: number | null
          loan_repayment?: number | null
          month: string
          net_cashflow?: number | null
          profit?: number | null
          project_id: string
          revenue?: number | null
          revenue_office?: number | null
          revenue_residential?: number | null
          revenue_retail?: number | null
          scenario: string
          soft_costs?: number | null
          updated_at?: string
          vat_on_costs?: number | null
          vat_recoverable?: number | null
          version_created_at?: string | null
          version_label?: string
          version_notes?: string | null
          zakat_due?: number | null
        }
        Update: {
          cash_balance?: number | null
          construction_cost?: number | null
          created_at?: string
          created_by?: string | null
          equity_injected?: number | null
          escrow_released?: number | null
          escrow_reserved?: number | null
          id?: string
          is_latest?: boolean
          land_cost?: number | null
          loan_drawn?: number | null
          loan_interest?: number | null
          loan_repayment?: number | null
          month?: string
          net_cashflow?: number | null
          profit?: number | null
          project_id?: string
          revenue?: number | null
          revenue_office?: number | null
          revenue_residential?: number | null
          revenue_retail?: number | null
          scenario?: string
          soft_costs?: number | null
          updated_at?: string
          vat_on_costs?: number | null
          vat_recoverable?: number | null
          version_created_at?: string | null
          version_label?: string
          version_notes?: string | null
          zakat_due?: number | null
        }
        Relationships: []
      }
      feasly_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          project_id: string
          section_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          project_id: string
          section_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          project_id?: string
          section_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feasly_insights_notes: {
        Row: {
          created_at: string
          generated_insights: Json | null
          id: string
          project_id: string
          scenario: string
          updated_at: string
          user_notes: string | null
        }
        Insert: {
          created_at?: string
          generated_insights?: Json | null
          id?: string
          project_id: string
          scenario: string
          updated_at?: string
          user_notes?: string | null
        }
        Update: {
          created_at?: string
          generated_insights?: Json | null
          id?: string
          project_id?: string
          scenario?: string
          updated_at?: string
          user_notes?: string | null
        }
        Relationships: []
      }
      feasly_modules: {
        Row: {
          enabled_at: string | null
          id: string
          is_enabled: boolean | null
          module_name: string
          user_id: string | null
        }
        Insert: {
          enabled_at?: string | null
          id?: string
          is_enabled?: boolean | null
          module_name: string
          user_id?: string | null
        }
        Update: {
          enabled_at?: string | null
          id?: string
          is_enabled?: boolean | null
          module_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      feasly_versions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_latest: boolean
          kpi_snapshot: Json | null
          project_id: string
          scenario_types: string[] | null
          version_label: string
          version_notes: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_latest?: boolean
          kpi_snapshot?: Json | null
          project_id: string
          scenario_types?: string[] | null
          version_label: string
          version_notes?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_latest?: boolean
          kpi_snapshot?: Json | null
          project_id?: string
          scenario_types?: string[] | null
          version_label?: string
          version_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feasly_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_summaries: {
        Row: {
          computed_at: string | null
          id: string
          irr: number | null
          payback_period: number | null
          profit_margin: number | null
          project_id: string | null
          scenario_id: string | null
          total_cost: number | null
          total_revenue: number | null
        }
        Insert: {
          computed_at?: string | null
          id?: string
          irr?: number | null
          payback_period?: number | null
          profit_margin?: number | null
          project_id?: string | null
          scenario_id?: string | null
          total_cost?: number | null
          total_revenue?: number | null
        }
        Update: {
          computed_at?: string | null
          id?: string
          irr?: number | null
          payback_period?: number | null
          profit_margin?: number | null
          project_id?: string | null
          scenario_id?: string | null
          total_cost?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_summaries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_summaries_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      forecast_simulations: {
        Row: {
          base_irr: number | null
          base_payback_period: number | null
          base_roi: number | null
          cost_delta_percent: number | null
          created_at: string
          delay_months: number | null
          forecasted_irr: number | null
          forecasted_payback_period: number | null
          forecasted_roi: number | null
          id: string
          project_id: string
          revenue_delta_percent: number | null
          simulation_data: Json | null
          simulation_name: string
          updated_at: string
        }
        Insert: {
          base_irr?: number | null
          base_payback_period?: number | null
          base_roi?: number | null
          cost_delta_percent?: number | null
          created_at?: string
          delay_months?: number | null
          forecasted_irr?: number | null
          forecasted_payback_period?: number | null
          forecasted_roi?: number | null
          id?: string
          project_id: string
          revenue_delta_percent?: number | null
          simulation_data?: Json | null
          simulation_name?: string
          updated_at?: string
        }
        Update: {
          base_irr?: number | null
          base_payback_period?: number | null
          base_roi?: number | null
          cost_delta_percent?: number | null
          created_at?: string
          delay_months?: number | null
          forecasted_irr?: number | null
          forecasted_payback_period?: number | null
          forecasted_roi?: number | null
          id?: string
          project_id?: string
          revenue_delta_percent?: number | null
          simulation_data?: Json | null
          simulation_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      kpi_snapshot: {
        Row: {
          created_at: string | null
          id: string
          irr: number | null
          npv: number
          profit: number
          project_id: string
          scenario_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          irr?: number | null
          npv: number
          profit: number
          project_id: string
          scenario_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          irr?: number | null
          npv?: number
          profit?: number
          project_id?: string
          scenario_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      organization_audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          organization_id: string
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          organization_id: string
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          organization_id?: string
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          organization_id: string
          role: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by: string
          organization_id: string
          role?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          organization_id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          invited_at: string | null
          last_active: string | null
          organization_id: string
          permissions: Json | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_at?: string | null
          last_active?: string | null
          organization_id: string
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_at?: string | null
          last_active?: string | null
          organization_id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          id: string
          name: string
          slug: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          name: string
          slug?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          name?: string
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_compliance: {
        Row: {
          calculated_amounts: Json | null
          compliance_type: string
          configuration: Json
          created_at: string
          id: string
          is_enabled: boolean
          last_calculated_at: string | null
          project_id: string
          updated_at: string
        }
        Insert: {
          calculated_amounts?: Json | null
          compliance_type: string
          configuration?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_calculated_at?: string | null
          project_id: string
          updated_at?: string
        }
        Update: {
          calculated_amounts?: Json | null
          compliance_type?: string
          configuration?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_calculated_at?: string | null
          project_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_contractors: {
        Row: {
          actual_completion: string | null
          amount: number
          contact_email: string | null
          contact_person: string | null
          created_at: string
          expected_completion: string | null
          id: string
          name: string
          notes: string | null
          phase: string
          project_id: string
          risk_rating: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          actual_completion?: string | null
          amount: number
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string
          expected_completion?: string | null
          id?: string
          name: string
          notes?: string | null
          phase: string
          project_id: string
          risk_rating?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          actual_completion?: string | null
          amount?: number
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string
          expected_completion?: string | null
          id?: string
          name?: string
          notes?: string | null
          phase?: string
          project_id?: string
          risk_rating?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_drafts: {
        Row: {
          created_at: string
          draft_data: Json
          etag: string
          id: string
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          draft_data: Json
          etag?: string
          id?: string
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          draft_data?: Json
          etag?: string
          id?: string
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_input_templates: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_public: boolean | null
          template_data: Json
          template_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_public?: boolean | null
          template_data: Json
          template_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_public?: boolean | null
          template_data?: Json
          template_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_milestones: {
        Row: {
          created_at: string
          description: string | null
          id: string
          label: string
          project_id: string
          status: string
          target_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          label: string
          project_id: string
          status?: string
          target_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          project_id?: string
          status?: string
          target_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_phases: {
        Row: {
          cost_percentage: number
          created_at: string
          duration_months: number
          id: string
          phase_name: string
          phase_order: number
          project_id: string
          start_month: number
          updated_at: string
        }
        Insert: {
          cost_percentage?: number
          created_at?: string
          duration_months?: number
          id?: string
          phase_name: string
          phase_order?: number
          project_id: string
          start_month?: number
          updated_at?: string
        }
        Update: {
          cost_percentage?: number
          created_at?: string
          duration_months?: number
          id?: string
          phase_name?: string
          phase_order?: number
          project_id?: string
          start_month?: number
          updated_at?: string
        }
        Relationships: []
      }
      project_tag_suggestions: {
        Row: {
          created_at: string | null
          generated_at: string | null
          id: string
          project_id: string | null
          suggested_tag: string
        }
        Insert: {
          created_at?: string | null
          generated_at?: string | null
          id?: string
          project_id?: string | null
          suggested_tag: string
        }
        Update: {
          created_at?: string | null
          generated_at?: string | null
          id?: string
          project_id?: string | null
          suggested_tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tag_suggestions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_team: {
        Row: {
          created_at: string | null
          id: string
          project_id: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_team_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          construction_escalation_percent: number | null
          created_at: string | null
          currency_code: string | null
          description: string | null
          enable_escalation: boolean | null
          end_date: string | null
          escalation_duration_months: number | null
          escalation_start_month: number | null
          escrow_enabled: boolean | null
          escrow_percent: number | null
          gfa_office: number | null
          gfa_residential: number | null
          gfa_retail: number | null
          id: string
          is_demo: boolean | null
          is_pinned: boolean | null
          is_public: boolean | null
          name: string
          organization_id: string | null
          project_ai_summary: string | null
          release_rule_details: string | null
          release_threshold: number | null
          release_trigger_type: string | null
          sale_price_office: number | null
          sale_price_residential: number | null
          sale_price_retail: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          tags: string[] | null
          unit_system: string | null
          updated_at: string | null
          use_segmented_revenue: boolean | null
          user_id: string | null
          zakat_applicable: boolean | null
          zakat_calculation_method: string | null
          zakat_exclude_losses: boolean | null
          zakat_rate_percent: number | null
        }
        Insert: {
          construction_escalation_percent?: number | null
          created_at?: string | null
          currency_code?: string | null
          description?: string | null
          enable_escalation?: boolean | null
          end_date?: string | null
          escalation_duration_months?: number | null
          escalation_start_month?: number | null
          escrow_enabled?: boolean | null
          escrow_percent?: number | null
          gfa_office?: number | null
          gfa_residential?: number | null
          gfa_retail?: number | null
          id?: string
          is_demo?: boolean | null
          is_pinned?: boolean | null
          is_public?: boolean | null
          name: string
          organization_id?: string | null
          project_ai_summary?: string | null
          release_rule_details?: string | null
          release_threshold?: number | null
          release_trigger_type?: string | null
          sale_price_office?: number | null
          sale_price_residential?: number | null
          sale_price_retail?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          tags?: string[] | null
          unit_system?: string | null
          updated_at?: string | null
          use_segmented_revenue?: boolean | null
          user_id?: string | null
          zakat_applicable?: boolean | null
          zakat_calculation_method?: string | null
          zakat_exclude_losses?: boolean | null
          zakat_rate_percent?: number | null
        }
        Update: {
          construction_escalation_percent?: number | null
          created_at?: string | null
          currency_code?: string | null
          description?: string | null
          enable_escalation?: boolean | null
          end_date?: string | null
          escalation_duration_months?: number | null
          escalation_start_month?: number | null
          escrow_enabled?: boolean | null
          escrow_percent?: number | null
          gfa_office?: number | null
          gfa_residential?: number | null
          gfa_retail?: number | null
          id?: string
          is_demo?: boolean | null
          is_pinned?: boolean | null
          is_public?: boolean | null
          name?: string
          organization_id?: string | null
          project_ai_summary?: string | null
          release_rule_details?: string | null
          release_threshold?: number | null
          release_trigger_type?: string | null
          sale_price_office?: number | null
          sale_price_residential?: number | null
          sale_price_retail?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          tags?: string[] | null
          unit_system?: string | null
          updated_at?: string | null
          use_segmented_revenue?: boolean | null
          user_id?: string | null
          zakat_applicable?: boolean | null
          zakat_calculation_method?: string | null
          zakat_exclude_losses?: boolean | null
          zakat_rate_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_rental: {
        Row: {
          adr: number
          annual_escalation: number
          created_at: string
          end_period: number
          id: string
          occupancy_rate: number
          project_id: string
          rooms: number
          scenario_id: string | null
          start_period: number
          updated_at: string
          user_id: string
        }
        Insert: {
          adr?: number
          annual_escalation?: number
          created_at?: string
          end_period?: number
          id?: string
          occupancy_rate?: number
          project_id: string
          rooms?: number
          scenario_id?: string | null
          start_period?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          adr?: number
          annual_escalation?: number
          created_at?: string
          end_period?: number
          id?: string
          occupancy_rate?: number
          project_id?: string
          rooms?: number
          scenario_id?: string | null
          start_period?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_sale: {
        Row: {
          created_at: string
          end_period: number
          escalation: number
          id: string
          price_per_unit: number
          project_id: string
          scenario_id: string | null
          start_period: number
          units: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_period?: number
          escalation?: number
          id?: string
          price_per_unit?: number
          project_id: string
          scenario_id?: string | null
          start_period?: number
          units?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_period?: number
          escalation?: number
          id?: string
          price_per_unit?: number
          project_id?: string
          scenario_id?: string | null
          start_period?: number
          units?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      risk_variations: {
        Row: {
          cost_variation_percent: number
          created_at: string
          id: string
          interest_rate_variation_bps: number
          project_id: string
          result_deltas: Json
          sale_price_variation_percent: number
          scenario_id: string
          updated_at: string
        }
        Insert: {
          cost_variation_percent?: number
          created_at?: string
          id?: string
          interest_rate_variation_bps?: number
          project_id: string
          result_deltas: Json
          sale_price_variation_percent?: number
          scenario_id: string
          updated_at?: string
        }
        Update: {
          cost_variation_percent?: number
          created_at?: string
          id?: string
          interest_rate_variation_bps?: number
          project_id?: string
          result_deltas?: Json
          sale_price_variation_percent?: number
          scenario_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      scenario_overrides: {
        Row: {
          annual_revenue_aed: number | null
          asset_id: string | null
          cap_rate_percent: number | null
          construction_cost_aed: number | null
          created_at: string | null
          development_timeline_months: number | null
          field_name: string
          gfa_sqm: number | null
          id: string
          occupancy_rate_percent: number | null
          operating_cost_aed: number | null
          override_text: string | null
          project_id: string
          scenario: string
          scenario_id: string | null
          stabilization_period_months: number | null
        }
        Insert: {
          annual_revenue_aed?: number | null
          asset_id?: string | null
          cap_rate_percent?: number | null
          construction_cost_aed?: number | null
          created_at?: string | null
          development_timeline_months?: number | null
          field_name: string
          gfa_sqm?: number | null
          id?: string
          occupancy_rate_percent?: number | null
          operating_cost_aed?: number | null
          override_text?: string | null
          project_id: string
          scenario?: string
          scenario_id?: string | null
          stabilization_period_months?: number | null
        }
        Update: {
          annual_revenue_aed?: number | null
          asset_id?: string | null
          cap_rate_percent?: number | null
          construction_cost_aed?: number | null
          created_at?: string | null
          development_timeline_months?: number | null
          field_name?: string
          gfa_sqm?: number | null
          id?: string
          occupancy_rate_percent?: number | null
          operating_cost_aed?: number | null
          override_text?: string | null
          project_id?: string
          scenario?: string
          scenario_id?: string | null
          stabilization_period_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scenario_overrides_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scenario_overrides_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_reports: {
        Row: {
          created_by: string
          expires_at: string
          file_size: number | null
          generated_at: string
          id: string
          project_id: string
          report_url: string | null
          scenario_id: string
          status: string
        }
        Insert: {
          created_by: string
          expires_at?: string
          file_size?: number | null
          generated_at?: string
          id?: string
          project_id: string
          report_url?: string | null
          scenario_id: string
          status?: string
        }
        Update: {
          created_by?: string
          expires_at?: string
          file_size?: number | null
          generated_at?: string
          id?: string
          project_id?: string
          report_url?: string | null
          scenario_id?: string
          status?: string
        }
        Relationships: []
      }
      scenario_results: {
        Row: {
          created_at: string
          id: string
          project_id: string
          result: Json
          scenario_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          result: Json
          scenario_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          result?: Json
          scenario_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      scenarios: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_base: boolean | null
          name: string
          project_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_base?: boolean | null
          name: string
          project_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_base?: boolean | null
          name?: string
          project_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenarios_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      zakat_calculations: {
        Row: {
          adjustments: Json | null
          calculation_method: string
          calculation_period: string
          created_at: string
          id: string
          is_final: boolean
          period_end: string
          period_start: string
          project_id: string
          taxable_base: number
          updated_at: string
          zakat_amount: number
          zakat_rate: number
        }
        Insert: {
          adjustments?: Json | null
          calculation_method: string
          calculation_period: string
          created_at?: string
          id?: string
          is_final?: boolean
          period_end: string
          period_start: string
          project_id: string
          taxable_base: number
          updated_at?: string
          zakat_amount: number
          zakat_rate: number
        }
        Update: {
          adjustments?: Json | null
          calculation_method?: string
          calculation_period?: string
          created_at?: string
          id?: string
          is_final?: boolean
          period_end?: string
          period_start?: string
          project_id?: string
          taxable_base?: number
          updated_at?: string
          zakat_amount?: number
          zakat_rate?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_invitations: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_expired_reports: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      is_organization_admin: {
        Args: { org_id: string; user_id: string }
        Returns: boolean
      }
      is_organization_member: {
        Args: { org_id: string; user_id: string }
        Returns: boolean
      }
      log_organization_activity: {
        Args: {
          p_action: string
          p_details?: Json
          p_organization_id: string
          p_resource_id?: string
          p_resource_type: string
          p_user_id: string
        }
        Returns: string
      }
      require_auth: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      project_status: "draft" | "active" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      project_status: ["draft", "active", "archived"],
    },
  },
} as const
