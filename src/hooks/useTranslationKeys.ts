import { useTranslation } from "react-i18next";

/**
 * Centralized translation keys utility for Feasly platform
 * Provides consistent translation key structure across components
 */
export function useTranslationKeys() {
  const { t } = useTranslation();
  
  return {
    // Common actions and navigation
    common: {
      save: () => t('common:save'),
      cancel: () => t('common:cancel'),
      edit: () => t('common:edit'),
      delete: () => t('common:delete'),
      add: () => t('common:add'),
      create: () => t('common:create'),
      update: () => t('common:update'),
      submit: () => t('common:submit'),
      close: () => t('common:close'),
      back: () => t('common:back'),
      next: () => t('common:next'),
      loading: () => t('common:loading'),
      export: () => t('common:export'),
      import: () => t('common:import'),
      search: () => t('common:search'),
      filter: () => t('common:filter'),
    },

    // Navigation
    nav: {
      dashboard: () => t('common:nav.dashboard'),
      projects: () => t('common:nav.projects'),
      model: () => t('common:nav.model'),
      flow: () => t('common:nav.flow'),
      finance: () => t('common:nav.finance'),
      consolidate: () => t('common:nav.consolidate'),
      insights: () => t('common:nav.insights'),
      alerts: () => t('common:nav.alerts'),
      settings: () => t('common:nav.settings'),
      newProject: () => t('common:nav.newProject'),
    },

    // Feasly Model specific
    model: {
      title: () => t('feasly.model:title'),
      description: () => t('feasly.model:description'),
      
      // Project metadata
      projectMetadata: {
        title: () => t('feasly.model:project_metadata'),
        description: () => t('feasly.model:project_metadata_desc'),
        projectName: () => t('feasly.model:project_name'),
        projectNamePlaceholder: () => t('feasly.model:project_name_placeholder'),
        desc: () => t('feasly.model:description'),
        descPlaceholder: () => t('feasly.model:description_placeholder'),
        sponsorName: () => t('feasly.model:sponsor_name'),
        landOwner: () => t('feasly.model:land_owner'),
        country: () => t('feasly.model:country'),
        selectCountry: () => t('feasly.model:select_country'),
        city: () => t('feasly.model:city'),
        planningStage: () => t('feasly.model:planning_stage'),
        currency: () => t('feasly.model:currency'),
        plotNumber: () => t('feasly.model:plot_number'),
      },

      // Timeline and phases
      timeline: {
        title: () => t('feasly.model:timeline_phases'),
        description: () => t('feasly.model:timeline_phases_desc'),
        startDate: () => t('feasly.model:start_date'),
        durationMonths: () => t('feasly.model:duration_months'),
        completionDate: () => t('feasly.model:completion_date'),
        constructionStart: () => t('feasly.model:construction_start'),
        stabilizationPeriod: () => t('feasly.model:stabilization_period'),
        phasingEnabled: () => t('feasly.model:phasing_enabled'),
        phasingEnabledDesc: () => t('feasly.model:phasing_enabled_desc'),
        calculatedEndDate: () => t('feasly.model:calculated_end_date'),
        calculatedEndDateTooltip: () => t('feasly.model:calculated_end_date_tooltip'),
        dataUnavailable: () => t('feasly.model:timeline_data_unavailable'),
        info: () => t('feasly.model:timeline_info'),
        totalDuration: () => t('feasly.model:timeline_total_duration'),
        today: () => t('feasly.model:timeline_today'),
        progress: () => t('feasly.model:timeline_progress'),
        keyMilestones: () => t('feasly.model:timeline_key_milestones'),
        projectStart: () => t('feasly.model:timeline_project_start'),
        projectCompletion: () => t('feasly.model:timeline_project_completion'),
      },

      // Financial inputs
      financial: {
        title: () => t('feasly.model:financial_inputs'),
        description: () => t('feasly.model:financial_inputs_desc'),
        landCost: () => t('feasly.model:land_cost'),
        constructionCost: () => t('feasly.model:construction_cost'),
        softCosts: () => t('feasly.model:soft_costs'),
        marketingCost: () => t('feasly.model:marketing_cost'),
        contingencyPercent: () => t('feasly.model:contingency_percent'),
        contingencyValue: () => t('feasly.model:contingency_value'),
        totalInvestment: () => t('feasly.model:total_investment'),
        totalInvestmentTooltip: () => t('feasly.model:total_investment_tooltip'),
        zakatApplicable: () => t('feasly.model:zakat_applicable'),
        zakatApplicableDesc: () => t('feasly.model:zakat_applicable_desc'),
        zakatRatePercent: () => t('feasly.model:zakat_rate_percent'),
        escrowRequired: () => t('feasly.model:escrow_required'),
        escrowRequiredDesc: () => t('feasly.model:escrow_required_desc'),
        escrowPercent: () => t('feasly.model:escrow_percent'),
      },

      // KPIs and results
      kpi: {
        title: () => t('feasly.model:kpi_dashboard'),
        description: () => t('feasly.model:kpi_dashboard_desc'),
        totalCost: () => t('feasly.model:kpi_total_cost'),
        totalRevenue: () => t('feasly.model:kpi_total_revenue'),
        profit: () => t('feasly.model:kpi_profit'),
        profitMargin: () => t('feasly.model:kpi_profit_margin'),
        roi: () => t('feasly.model:kpi_roi'),
        irr: () => t('feasly.model:kpi_irr'),
        paybackPeriod: () => t('feasly.model:kpi_payback_period'),
        zakatDue: () => t('feasly.model:zakat_due'),
      },

      // Scenarios
      scenarios: {
        title: () => t('feasly.model:scenario_analysis'),
        description: () => t('feasly.model:scenario_analysis_desc'),
        base: () => t('feasly.model:scenario_base'),
        optimistic: () => t('feasly.model:scenario_optimistic'),
        pessimistic: () => t('feasly.model:scenario_pessimistic'),
        custom: () => t('feasly.model:scenario_custom'),
        editScenario: () => t('feasly.model:edit_scenario'),
        editingScenario: () => t('feasly.model:editing_scenario'),
        overrideNote: () => t('feasly.model:scenario_override_note'),
        summary: () => t('feasly.model:scenario_summary'),
      },

      // AI Insights
      insights: {
        title: () => t('feasly.model:smart_insights'),
        description: () => t('feasly.model:smart_insights_desc'),
        regenerate: () => t('feasly.model:regenerate_insights'),
        aiGenerated: () => t('feasly.model:ai_generated_insights'),
        userNotes: () => t('feasly.model:user_notes'),
        saveNotes: () => t('feasly.model:save_notes'),
        notesPlaceholder: () => t('feasly.model:notes_placeholder'),
        notesMarkdownHelp: () => t('feasly.model:notes_markdown_help'),
        noInsightsYet: () => t('feasly.model:no_insights_yet'),
      },

      // Comments and collaboration
      comments: {
        title: () => t('feasly.model:commenting'),
        description: () => t('feasly.model:commenting_desc'),
        projectOverview: () => t('feasly.model:comment_project_overview'),
        financialInputs: () => t('feasly.model:comment_financial_inputs'),
        timeline: () => t('feasly.model:comment_timeline'),
        scenarios: () => t('feasly.model:comment_scenarios'),
        results: () => t('feasly.model:comment_results'),
        addComment: () => t('feasly.model:add_comment'),
        saveComment: () => t('feasly.model:save_comment'),
        noComments: () => t('feasly.model:no_comments'),
        placeholder: () => t('feasly.model:comment_placeholder'),
      },

      // Export functionality
      export: {
        title: () => t('feasly.model:export'),
        description: () => t('feasly.model:export_desc'),
        pdf: () => t('feasly.model:export_pdf'),
        excel: () => t('feasly.model:export_excel'),
        success: () => t('feasly.model:export_success'),
        error: () => t('feasly.model:export_error'),
      },
    },

    // Feasly Insights specific
    insights: {
      title: () => t('feasly.insights:title'),
      description: () => t('feasly.insights:description'),
    },

    // Alerts specific
    alerts: {
      title: () => t('feasly.alerts:title'),
      description: () => t('feasly.alerts:description'),
    },

    // Form validation and warnings
    validation: {
      missingConstructionCost: () => t('validation:missing_construction_cost', 'Construction cost is missing'),
      missingGFA: () => t('validation:missing_gfa', 'Total GFA is missing'),
      revenueLessThanCost: () => t('validation:revenue_less_than_cost', 'Revenue is less than total cost'),
      fundingGapDetected: () => t('validation:funding_gap_detected', 'Funding gap detected'),
      highRiskWarning: () => t('validation:high_risk_warning', 'High risk warning'),
    },
  };
}

/**
 * Hook for commonly used validation messages
 */
export function useValidationMessages() {
  const keys = useTranslationKeys();
  
  return {
    getConstructionCostWarning: () => keys.validation.missingConstructionCost(),
    getGFAWarning: () => keys.validation.missingGFA(),
    getRevenueWarning: () => keys.validation.revenueLessThanCost(),
    getFundingGapWarning: () => keys.validation.fundingGapDetected(),
    getHighRiskWarning: () => keys.validation.highRiskWarning(),
  };
}