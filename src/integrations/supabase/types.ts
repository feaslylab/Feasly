export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
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
          version_label: string
          zakat_due: number | null
        }
        Insert: {
          cash_balance?: number | null
          construction_cost?: number | null
          created_at?: string
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
          version_label?: string
          zakat_due?: number | null
        }
        Update: {
          cash_balance?: number | null
          construction_cost?: number | null
          created_at?: string
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
          version_label?: string
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
          created_at: string | null
          currency_code: string | null
          description: string | null
          end_date: string | null
          id: string
          is_demo: boolean | null
          is_public: boolean | null
          name: string
          start_date: string | null
          updated_at: string | null
          user_id: string | null
          zakat_applicable: boolean | null
          zakat_rate_percent: number | null
        }
        Insert: {
          created_at?: string | null
          currency_code?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_demo?: boolean | null
          is_public?: boolean | null
          name: string
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          zakat_applicable?: boolean | null
          zakat_rate_percent?: number | null
        }
        Update: {
          created_at?: string | null
          currency_code?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_demo?: boolean | null
          is_public?: boolean | null
          name?: string
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          zakat_applicable?: boolean | null
          zakat_rate_percent?: number | null
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
          gfa_sqm: number | null
          id: string
          occupancy_rate_percent: number | null
          operating_cost_aed: number | null
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
          gfa_sqm?: number | null
          id?: string
          occupancy_rate_percent?: number | null
          operating_cost_aed?: number | null
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
          gfa_sqm?: number | null
          id?: string
          occupancy_rate_percent?: number | null
          operating_cost_aed?: number | null
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
      scenarios: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_base: boolean | null
          name: string
          project_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_base?: boolean | null
          name: string
          project_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_base?: boolean | null
          name?: string
          project_id?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
