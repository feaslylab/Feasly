import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Base translations (keeping existing common translations for backward compatibility)
const baseTranslations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.projects': 'Projects',
    'nav.settings': 'Settings',
    'nav.newProject': 'New Project',
    'nav.signOut': 'Sign Out',
    
    // Auth
    'auth.loggedIn': 'Logged in',
    'auth.viewAccount': 'View Account',
    'auth.account': 'Account',
    'auth.user': 'User',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back! Here\'s an overview of your projects and portfolio.',
    'dashboard.totalProjects': 'Total Projects',
    'dashboard.totalAssets': 'Total Assets',
    'dashboard.portfolioValue': 'Portfolio Value',
    'dashboard.estimatedRevenue': 'Estimated Revenue',
    'dashboard.avgIRR': 'Avg. IRR',
    'dashboard.kpiComparison': 'KPI Comparison',
    'dashboard.portfolioInsights': 'Portfolio Insights',
    'dashboard.recentProjects': 'Recent Projects',
    'dashboard.revenueProjection': 'Revenue Projection',
    'dashboard.filter': 'Filter Dashboard',
    'dashboard.allProjects': 'All Projects',
    'dashboard.allTime': 'All Time',
    'dashboard.noProjectsYet': 'No projects yet',
    'dashboard.createFirstProject': 'Create your first project to get started with financial modeling.',
    
    // Feasly Modules
    'nav.model': 'Feasly Model',
    'nav.flow': 'Feasly Flow', 
    'nav.finance': 'Feasly Finance',
    'nav.consolidate': 'Feasly Consolidate',
    'nav.insights': 'Feasly Insights',
    
    // Feasly Model - Extended
    'feasly.model.title': 'Feasly Model',
    'feasly.model.description': 'Development feasibility engine for planning, input, and analysis.',
    'feasly.model.inputs': 'Feasly Model Inputs',
    'feasly.model.scenarios': 'Feasly Model Scenarios',
    'feasly.model.kpis': 'Feasly Model KPIs',
    'feasly.model.flow_data_loaded': 'Flow Data Loaded',
    'feasly.model.flow_data_loaded_desc': 'Phase data from Feasly Flow has been automatically applied.',
    'feasly.model.flow_data_available': 'Flow Data Available',
    'feasly.model.flow_data_available_desc': 'New phase data from Feasly Flow is available. Choose to apply or keep current values.',
    'feasly.model.apply_flow_data': 'Apply Flow Data',
    'feasly.model.flow_data_applied': 'Flow Data Applied',
    'feasly.model.flow_data_applied_desc': 'Phase data has been successfully applied to your model.',
    'feasly.model.project_metadata': 'Project Metadata',
    'feasly.model.project_metadata_desc': 'Basic project information and location details',
    'feasly.model.project_name': 'Project Name',
    'feasly.model.project_name_placeholder': 'Enter project name',
    'feasly.model.project_description': 'Description',
    'feasly.model.description_placeholder': 'Enter project description',
    'feasly.model.sponsor_name': 'Sponsor Name',
    'feasly.model.land_owner': 'Land Owner',
    'feasly.model.country': 'Country',
    'feasly.model.select_country': 'Select country',
    'feasly.model.city': 'City',
    'feasly.model.planning_stage': 'Planning Stage',
    'feasly.model.currency': 'Currency',
    'feasly.model.timeline_phases': 'Timeline & Phases',
    'feasly.model.timeline_phases_desc': 'Project schedule and phasing information',
    'feasly.model.start_date': 'Start Date',
    'feasly.model.select_date': 'Select date',
    'feasly.model.duration_months': 'Duration (Months)',
    'feasly.model.calculated_end_date': 'Calculated End Date',
    'feasly.model.calculated_end_date_tooltip': 'Automatically calculated based on start date and duration',
    'feasly.model.construction_start': 'Construction Start Date',
    'feasly.model.completion_date': 'Completion Date',
    'feasly.model.stabilization_period': 'Stabilization Period (Months)',
    'feasly.model.phasing_enabled': 'Enable Phasing',
    'feasly.model.phasing_enabled_desc': 'Break down the project into multiple phases',
    'feasly.model.site_area_metrics': 'Site & Area Metrics',
    'feasly.model.site_area_metrics_desc': 'Land and building area calculations',
    'feasly.model.site_area_sqm': 'Site Area (sqm)',
    'feasly.model.total_gfa_sqm': 'Total GFA (sqm)',
    'feasly.model.buildable_ratio': 'Buildable Ratio',
    'feasly.model.efficiency_ratio': 'Efficiency Ratio',
    'feasly.model.far_ratio': 'FAR Ratio',
    'feasly.model.height_stories': 'Height (Stories)',
    'feasly.model.plot_number': 'Plot Number',
    'feasly.model.financial_inputs': 'Financial Inputs',
    'feasly.model.financial_inputs_desc': 'Project costs and investment details',
    'feasly.model.land_cost': 'Land Cost',
    'feasly.model.construction_cost': 'Construction Cost',
    'feasly.model.soft_costs': 'Soft Costs',
    'feasly.model.marketing_cost': 'Marketing Cost',
    'feasly.model.contingency_percent': 'Contingency (%)',
    'feasly.model.total_investment': 'Total Investment',
    'feasly.model.total_investment_tooltip': 'Sum of all project costs including contingency',

    // Feasly Flow - Extended
    'feasly.flow.title': 'Feasly Flow',
    'feasly.flow.description': 'Workflow management and phased development planning',
    'feasly.flow.add_phase': 'Add Phase',
    'feasly.flow.edit_phase': 'Edit Phase',
    'feasly.flow.phase_form_desc': 'Define project phases with timeline and cost details',
    'feasly.flow.phase_name': 'Phase Name',
    'feasly.flow.phase_name_placeholder': 'e.g., Foundation & Structure',
    'feasly.flow.starts_after': 'Starts After',
    'feasly.flow.starts_after_tooltip': 'Select a phase that must complete before this phase can start',
    'feasly.flow.select_preceding_phase': 'Select preceding phase',
    'feasly.flow.no_dependency': 'No dependency',
    'feasly.flow.start_date': 'Start Date',
    'feasly.flow.select_date': 'Select date',
    'feasly.flow.duration_months': 'Duration (Months)',
    'feasly.flow.calculated_end_date': 'Calculated End Date',
    'feasly.flow.auto_calculated': 'Auto-calculated',
    'feasly.flow.gfa_sqm': 'GFA (sqm)',
    'feasly.flow.land_area_sqm': 'Land Area (sqm)',
    'feasly.flow.phase_cost': 'Phase Cost',
    'feasly.flow.update_phase': 'Update Phase',
    'feasly.flow.cancel': 'Cancel',
    'feasly.flow.sync_to_model': 'Sync to Feasly Model',
    'feasly.flow.sync_success': 'Sync Successful',
    'feasly.flow.sync_success_desc': 'Phase data has been synced to Feasly Model',
    'feasly.flow.sync_error': 'Sync Error',
    'feasly.flow.sync_error_desc': 'Failed to sync data to Feasly Model',
    'feasly.flow.no_phases_to_sync': 'No phases available to sync',
    'feasly.flow.project_phases': 'Project Phases',
    'feasly.flow.phases_list_desc': 'Current project phases and timeline',
    'feasly.flow.edit': 'Edit',
    'feasly.flow.duration': 'Duration',
    'feasly.flow.months': 'months',
    'feasly.flow.gfa': 'GFA',
    'feasly.flow.cost': 'Cost',
    'feasly.flow.dates': 'Dates',
    'feasly.flow.depends_on': 'Depends on',
    'feasly.flow.summary_metrics': 'Summary Metrics',
    'feasly.flow.total_phases': 'Total Phases',
    'feasly.flow.total_gfa': 'Total GFA',
    'feasly.flow.total_cost': 'Total Cost',
    'feasly.flow.total_duration': 'Total Duration',
    'feasly.flow.validation_issues': 'Validation Issues',
    'feasly.flow.project_summary': 'Project Summary',
    'feasly.flow.phases_configured': 'phases configured',
    'feasly.flow.ready_for_timeline': 'Ready for timeline generation',
    'feasly.flow.use_in_model': 'Use in Feasly Model',

    // Feasly Finance - Extended  
    'feasly.finance.title': 'Feasly Finance',
    'feasly.finance.description': 'Financial modeling and capital structure analysis',
    'feasly.finance.capital_structure': 'Capital Structure',
    'feasly.finance.capital_structure_desc': 'Define funding sources and debt details',
    'feasly.finance.equity_amount': 'Equity Amount',
    'feasly.finance.equity_amount_tooltip': 'Total equity investment in the project',
    'feasly.finance.debt_amount': 'Debt Amount',
    'feasly.finance.debt_amount_tooltip': 'Total debt financing for the project',
    'feasly.finance.total_capital': 'Total Capital',
    'feasly.finance.equity_percentage': 'Equity %',
    'feasly.finance.debt_percentage': 'Debt %',
    'feasly.finance.equity': 'Equity',
    'feasly.finance.debt': 'Debt',
    'feasly.finance.capital_summary': 'Capital Summary',
    'feasly.finance.model_data_loaded': 'Model Data Loaded',
    'feasly.finance.model_data_loaded_desc': 'Financial data has been loaded from Feasly Model',
    'feasly.finance.data_saved': 'Data Saved',
    'feasly.finance.data_saved_desc': 'Financial data has been saved successfully',
    'feasly.finance.debt_details': 'Debt Details',
    'feasly.finance.debt_details_desc': 'Loan terms and repayment structure',
    'feasly.finance.interest_rate': 'Interest Rate (%)',
    'feasly.finance.loan_term_years': 'Loan Term (Years)',
    'feasly.finance.grace_period_months': 'Grace Period (Months)',
    'feasly.finance.repayment_type': 'Repayment Type',
    'feasly.finance.amortized': 'Amortized',
    'feasly.finance.bullet': 'Bullet Payment',
    'feasly.finance.payment_calculation': 'Payment Calculation',
    'feasly.finance.monthly_payment': 'Monthly Payment',
    'feasly.finance.payment_type': 'Payment Type',
    'feasly.finance.interest_only': 'Interest Only',
    'feasly.finance.principal_interest': 'Principal & Interest',
    'feasly.finance.grace_period': 'Grace Period',
    'feasly.finance.months': 'months',
    'feasly.finance.return_waterfall': 'Return Waterfall',
    'feasly.finance.waterfall_desc': 'Cash flow distribution and returns analysis',
    'feasly.finance.preferred_irr': 'Preferred IRR (%)',
    'feasly.finance.hurdle_irr': 'Hurdle IRR (%)',
    'feasly.finance.distribution_waterfall': 'Distribution Waterfall',
    'feasly.finance.tier': 'Tier',
    'feasly.finance.return_type': 'Return Type',
    'feasly.finance.threshold': 'Threshold',
    'feasly.finance.share': 'Share',
    'feasly.finance.waterfall_note': 'This is a simplified waterfall structure for illustration purposes',
    'feasly.finance.preferred_return': 'Preferred Return',
    'feasly.finance.return_of_capital': 'Return of Capital',
    'feasly.finance.promoted_interest': 'Promoted Interest',

    // Feasly Consolidate - Extended
    'feasly.consolidate.title': 'Feasly Consolidate',
    'feasly.consolidate.description': 'Portfolio management and project consolidation',
    'feasly.consolidate.project_portfolio': 'Project Portfolio',
    'feasly.consolidate.project_portfolio_desc': 'Manage and analyze your project portfolio',
    'feasly.consolidate.export': 'Export',
    'feasly.consolidate.select_all': 'Select All',
    'feasly.consolidate.project_name': 'Project Name',
    'feasly.consolidate.total_gfa': 'Total GFA',
    'feasly.consolidate.construction_cost': 'Construction Cost',
    'feasly.consolidate.estimated_revenue': 'Estimated Revenue',
    'feasly.consolidate.irr': 'IRR',
    'feasly.consolidate.status': 'Status',
    'feasly.consolidate.portfolio_summary': 'Portfolio Summary',
    'feasly.consolidate.portfolio_summary_desc': 'Overview of selected projects',
    'feasly.consolidate.total_projects': 'Total Projects',
    'feasly.consolidate.portfolio_total_gfa': 'Total GFA',
    'feasly.consolidate.total_cost': 'Total Cost',
    'feasly.consolidate.total_revenue': 'Total Revenue',
    'feasly.consolidate.average_irr': 'Average IRR',
    'feasly.consolidate.profit_margin': 'Profit Margin',
    'feasly.consolidate.total_net_profit': 'Total Net Profit',
    'feasly.consolidate.kpi_comparison': 'KPI Comparison',
    'feasly.consolidate.kpi_comparison_desc': 'Compare key performance indicators',
    'feasly.consolidate.project': 'Project',
    'feasly.consolidate.roi': 'ROI',
    'feasly.consolidate.revenue': 'Revenue',
    'feasly.consolidate.cost': 'Cost',
    'feasly.consolidate.net_profit': 'Net Profit',
    'feasly.consolidate.no_projects': 'No Projects',
    'feasly.consolidate.no_projects_desc': 'No projects found in your portfolio',
    'feasly.consolidate.select_projects_desc': 'Select projects to view portfolio summary',
    'feasly.consolidate.high_performance': 'High Performance',
    'feasly.consolidate.moderate_performance': 'Moderate Performance',
    'feasly.consolidate.low_performance': 'Low Performance',
    'feasly.consolidate.export_success': 'Export Successful',
    'feasly.consolidate.export_success_desc': 'Portfolio data has been exported successfully',
    'feasly.consolidate.export_error': 'Export Error',
    'feasly.consolidate.no_projects_selected': 'Please select at least one project to export',

    // Feasly Insights - Extended
    'feasly.insights.title': 'Feasly Insights',
    'feasly.insights.description': 'Advanced analytics and insights dashboard',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Auth
    'auth.login': 'Log In',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.fullName': 'Full Name',
    'auth.enterEmail': 'Enter your email',
    'auth.enterPassword': 'Enter your password',
    'auth.createPassword': 'Create a password',
    'auth.confirmYourPassword': 'Confirm your password',
    'auth.enterFullName': 'Enter your full name',
    'auth.showPassword': 'Show password',
    'auth.hidePassword': 'Hide password',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.signInHere': 'Sign in here',
    'auth.signUpHere': 'Sign up here',
    'auth.welcomeBack': 'Welcome Back',
    'auth.loginToAccount': 'Log in to your account',
    'auth.createAccount': 'Create your account',
    'auth.getStarted': 'Get started with your financial modeling platform',
    'dashboard.quickActions': 'Quick Actions',
    
    // Projects
    'projects.title': 'Projects',
    'projects.newProject': 'New Project',
    'projects.projectName': 'Project Name',
    'projects.projectType': 'Project Type',
    'projects.description': 'Description',
    'projects.location': 'Location',
    'projects.totalInvestment': 'Total Investment',
    'projects.expectedROI': 'Expected ROI',
    'projects.timeline': 'Timeline',
    'projects.status': 'Status',
    'projects.createdAt': 'Created',
    'projects.updatedAt': 'Updated',
    'projects.enterProjectName': 'Enter project name',
    'projects.enterDescription': 'Enter project description',
    'projects.enterLocation': 'Enter location',
    'projects.selectProjectType': 'Select project type',
    'projects.comingSoon': 'Projects page coming soon...',
    
    // Assets
    'assets.title': 'Assets',
    'assets.addAsset': 'Add Asset',
    'assets.assetName': 'Asset Name',
    'assets.assetType': 'Asset Type',
    'assets.gfa': 'Gross Floor Area (sqm)',
    'assets.constructionCost': 'Construction Cost (AED)',
    'assets.annualRevenue': 'Annual Revenue Potential (AED/year)',
    'assets.operatingCost': 'Operating Cost (AED/year)',
    'assets.occupancyRate': 'Occupancy Rate (%)',
    'assets.capRate': 'Cap Rate (%)',
    'assets.developmentTimeline': 'Development Timeline (months)',
    'assets.stabilizationPeriod': 'Stabilization Period (months)',
    'assets.enterAssetName': 'Enter asset name',
    'assets.selectAssetType': 'Select asset type',
    'assets.enterGFA': 'Enter GFA in square meters',
    'assets.enterConstructionCost': 'Enter construction cost',
    'assets.enterAnnualRevenue': 'Enter annual revenue potential',
    'assets.enterOperatingCost': 'Enter annual operating cost',
    'assets.enterOccupancyRate': 'Enter occupancy rate',
    'assets.enterCapRate': 'Enter cap rate',
    'assets.enterDevelopmentTimeline': 'Enter development timeline',
    'assets.enterStabilizationPeriod': 'Enter stabilization period',
    
    // Financial
    'financial.summary': 'Financial Summary',
    'financial.revenue': 'Revenue',
    'financial.costs': 'Costs',
    'financial.profit': 'Profit',
    'financial.roi': 'ROI',
    'financial.irr': 'IRR',
    'financial.npv': 'NPV',
    'financial.paybackPeriod': 'Payback Period',
    'financial.totalInvestment': 'Total Investment',
    'financial.totalRevenue': 'Total Revenue',
    'financial.totalCosts': 'Total Costs',
    'financial.netProfit': 'Net Profit',
    
    // Scenarios
    'scenarios.title': 'Scenarios',
    'scenarios.baseCase': 'Base Case',
    'scenarios.optimistic': 'Optimistic',
    'scenarios.pessimistic': 'Pessimistic',
    'scenarios.custom': 'Custom',
    'scenarios.select': 'Select Scenario',
    'scenarios.edit': 'Edit Scenario Values',
    'scenarios.save': 'Save Changes',
    
    // Settings
    'settings.title': 'Settings',
    'settings.comingSoon': 'Settings page coming soon...',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.profile': 'Profile',
    'settings.preferences': 'Preferences',
    
    // Export/Import
    'export.excel': 'Export to Excel',
    'export.pdf': 'Export to PDF',
    'export.history': 'Export History',
    'import.excel': 'Import from Excel',
    'import.data': 'Import Data',
    
    // Analytics
    'analytics.title': 'Analytics',
    'analytics.overview': 'Overview',
    'analytics.performance': 'Performance',
    'analytics.trends': 'Trends',
    'analytics.projections': 'Projections',
    
    // Team
    'team.title': 'Team',
    'team.members': 'Team Members',
    'team.addMember': 'Add Member',
    'team.permissions': 'Permissions',
    'team.roles': 'Roles',
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.projects': 'المشاريع',
    'nav.settings': 'الإعدادات',
    'nav.newProject': 'مشروع جديد',
    'nav.signOut': 'تسجيل الخروج',
    
    // Auth  
    'auth.loggedIn': 'مسجل الدخول',
    'auth.viewAccount': 'عرض الحساب',
    'auth.account': 'الحساب',
    'auth.user': 'المستخدم',
    
    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.welcome': 'مرحباً بعودتك! إليك نظرة عامة على مشاريعك ومحفظتك.',
    'dashboard.totalProjects': 'إجمالي المشاريع',
    'dashboard.totalAssets': 'إجمالي الأصول',
    'dashboard.portfolioValue': 'قيمة المحفظة',
    'dashboard.estimatedRevenue': 'الإيرادات المقدرة',
    'dashboard.avgIRR': 'متوسط معدل العائد الداخلي',
    'dashboard.kpiComparison': 'مقارنة مؤشرات الأداء الرئيسية',
    'dashboard.portfolioInsights': 'رؤى المحفظة',
    'dashboard.recentProjects': 'المشاريع الحديثة',
    'dashboard.revenueProjection': 'توقعات الإيرادات',
    'dashboard.filter': 'تصفية لوحة التحكم',
    'dashboard.allProjects': 'جميع المشاريع',
    'dashboard.allTime': 'كل الأوقات',
    'dashboard.noProjectsYet': 'لا توجد مشاريع بعد',
    'dashboard.createFirstProject': 'أنشئ مشروعك الأول للبدء في النمذجة المالية.',
    
    // Feasly Modules
    'nav.model': 'نموذج فيزلي',
    'nav.flow': 'تدفق فيزلي',
    'nav.finance': 'مالية فيزلي',
    'nav.consolidate': 'توحيد فيزلي',
    'nav.insights': 'رؤى فيزلي',
    
    // Feasly Model
    'feasly.model.title': 'نموذج فيزلي',
    'feasly.model.description': 'محرك الجدوى التطويرية للتخطيط والإدخال والتحليل.',
    'feasly.model.inputs': 'مدخلات نموذج فيزلي',
    'feasly.model.scenarios': 'سيناريوهات نموذج فيزلي',
    'feasly.model.kpis': 'مؤشرات أداء نموذج فيزلي',
    
    // Feasly Flow
    'feasly.flow.title': 'تدفق فيزلي',
    'feasly.flow.description': 'إدارة سير العمل وتحسين العمليات.',
    'feasly.flow.coming_soon': 'قريباً',
    
    // Feasly Finance - Extended
    'feasly.finance.title': 'مالية فيزلي',
    'feasly.finance.description': 'النمذجة المالية وتحليل هيكل رأس المال',
    'feasly.finance.capital_structure': 'هيكل رأس المال',
    'feasly.finance.capital_structure_desc': 'تحديد مصادر التمويل وتفاصيل الدين',
    'feasly.finance.equity_amount': 'مبلغ رأس المال',
    'feasly.finance.equity_amount_tooltip': 'إجمالي استثمار رأس المال في المشروع',
    'feasly.finance.debt_amount': 'مبلغ الدين',
    'feasly.finance.debt_amount_tooltip': 'إجمالي التمويل بالدين للمشروع',
    'feasly.finance.total_capital': 'إجمالي رأس المال',
    'feasly.finance.equity_percentage': 'نسبة رأس المال %',
    'feasly.finance.debt_percentage': 'نسبة الدين %',
    'feasly.finance.equity': 'رأس المال',
    'feasly.finance.debt': 'الدين',
    'feasly.finance.capital_summary': 'ملخص رأس المال',
    'feasly.finance.model_data_loaded': 'تم تحميل بيانات النموذج',
    'feasly.finance.model_data_loaded_desc': 'تم تحميل البيانات المالية من نموذج فيزلي',
    'feasly.finance.data_saved': 'تم حفظ البيانات',
    'feasly.finance.data_saved_desc': 'تم حفظ البيانات المالية بنجاح',
    'feasly.finance.debt_details': 'تفاصيل الدين',
    'feasly.finance.debt_details_desc': 'شروط القرض وهيكل السداد',
    'feasly.finance.interest_rate': 'معدل الفائدة (%)',
    'feasly.finance.loan_term_years': 'مدة القرض (سنوات)',
    'feasly.finance.grace_period_months': 'فترة السماح (أشهر)',
    'feasly.finance.repayment_type': 'نوع السداد',
    'feasly.finance.amortized': 'مطفأ',
    'feasly.finance.bullet': 'دفعة واحدة',
    'feasly.finance.payment_calculation': 'حساب الدفعة',
    'feasly.finance.monthly_payment': 'الدفعة الشهرية',
    'feasly.finance.payment_type': 'نوع الدفعة',
    'feasly.finance.interest_only': 'فائدة فقط',
    'feasly.finance.principal_interest': 'رأس المال والفائدة',
    'feasly.finance.grace_period': 'فترة السماح',
    'feasly.finance.months': 'أشهر',
    'feasly.finance.return_waterfall': 'شلال العوائد',
    'feasly.finance.waterfall_desc': 'توزيع التدفق النقدي وتحليل العوائد',
    'feasly.finance.preferred_irr': 'معدل العائد الداخلي المفضل (%)',
    'feasly.finance.hurdle_irr': 'معدل العائد الداخلي الحد الأدنى (%)',
    'feasly.finance.distribution_waterfall': 'شلال التوزيع',
    'feasly.finance.tier': 'المستوى',
    'feasly.finance.return_type': 'نوع العائد',
    'feasly.finance.threshold': 'العتبة',
    'feasly.finance.share': 'الحصة',
    'feasly.finance.waterfall_note': 'هذا هيكل شلال مبسط لأغراض التوضيح',
    'feasly.finance.preferred_return': 'العائد المفضل',
    'feasly.finance.return_of_capital': 'إعادة رأس المال',
    'feasly.finance.promoted_interest': 'الحصة المعززة',
    
    // Feasly Consolidate
    'feasly.consolidate.title': 'توحيد فيزلي',
    'feasly.consolidate.description': 'توحيد البيانات وإدارة المحفظة.',
    'feasly.consolidate.coming_soon': 'قريباً',
    
    // Feasly Insights
    'feasly.insights.title': 'رؤى فيزلي',
    'feasly.insights.description': 'لوحة تحكم التحليلات المتقدمة والرؤى.',
    'feasly.insights.coming_soon': 'قريباً',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.add': 'إضافة',
    'common.create': 'إنشاء',
    'common.update': 'تحديث',
    'common.submit': 'إرسال',
    'common.close': 'إغلاق',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.export': 'تصدير',
    'common.import': 'استيراد',
    'common.download': 'تحميل',
    'common.upload': 'رفع',
    'common.yes': 'نعم',
    'common.no': 'لا',
    
    // Auth
    'auth.login': 'تسجيل الدخول',
    'auth.signup': 'إنشاء حساب',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.fullName': 'الاسم الكامل',
    'auth.enterEmail': 'أدخل بريدك الإلكتروني',
    'auth.enterPassword': 'أدخل كلمة المرور',
    'auth.createPassword': 'إنشاء كلمة مرور',
    'auth.confirmYourPassword': 'تأكيد كلمة المرور',
    'auth.enterFullName': 'أدخل اسمك الكامل',
    'auth.showPassword': 'إظهار كلمة المرور',
    'auth.hidePassword': 'إخفاء كلمة المرور',
    'auth.alreadyHaveAccount': 'لديك حساب بالفعل؟',
    'auth.dontHaveAccount': 'ليس لديك حساب؟',
    'auth.signInHere': 'سجل دخولك هنا',
    'auth.signUpHere': 'سجل هنا',
    'auth.welcomeBack': 'مرحبًا بعودتك',
    'auth.loginToAccount': 'سجّل الدخول إلى حسابك',
    'auth.createAccount': 'إنشاء حسابك',
    'auth.getStarted': 'ابدأ مع منصة النمذجة المالية',
    
    // Projects
    'projects.title': 'المشاريع',
    'projects.newProject': 'مشروع جديد',
    'projects.projectName': 'اسم المشروع',
    'projects.projectType': 'نوع المشروع',
    'projects.description': 'الوصف',
    'projects.location': 'الموقع',
    'projects.totalInvestment': 'إجمالي الاستثمار',
    'projects.expectedROI': 'العائد المتوقع على الاستثمار',
    'projects.timeline': 'الجدول الزمني',
    'projects.status': 'الحالة',
    'projects.createdAt': 'تاريخ الإنشاء',
    'projects.updatedAt': 'تاريخ التحديث',
    'projects.enterProjectName': 'أدخل اسم المشروع',
    'projects.enterDescription': 'أدخل وصف المشروع',
    'projects.enterLocation': 'أدخل الموقع',
    'projects.selectProjectType': 'اختر نوع المشروع',
    'projects.comingSoon': 'صفحة المشاريع قادمة قريباً...',
    
    // Assets
    'assets.title': 'الأصول',
    'assets.addAsset': 'إضافة أصل',
    'assets.assetName': 'اسم الأصل',
    'assets.assetType': 'نوع الأصل',
    'assets.gfa': 'إجمالي مساحة الأرضية (متر مربع)',
    'assets.constructionCost': 'تكلفة البناء (درهم)',
    'assets.annualRevenue': 'إيرادات سنوية محتملة (درهم/سنة)',
    'assets.operatingCost': 'تكلفة التشغيل (درهم/سنة)',
    'assets.occupancyRate': 'معدل الإشغال (%)',
    'assets.capRate': 'معدل الرسملة (%)',
    'assets.developmentTimeline': 'الجدول الزمني للتطوير (شهر)',
    'assets.stabilizationPeriod': 'فترة الاستقرار (شهر)',
    'assets.enterAssetName': 'أدخل اسم الأصل',
    'assets.selectAssetType': 'اختر نوع الأصل',
    'assets.enterGFA': 'أدخل إجمالي مساحة الأرضية بالمتر المربع',
    'assets.enterConstructionCost': 'أدخل تكلفة البناء',
    'assets.enterAnnualRevenue': 'أدخل الإيرادات السنوية المحتملة',
    'assets.enterOperatingCost': 'أدخل تكلفة التشغيل السنوية',
    'assets.enterOccupancyRate': 'أدخل معدل الإشغال',
    'assets.enterCapRate': 'أدخل معدل الرسملة',
    'assets.enterDevelopmentTimeline': 'أدخل الجدول الزمني للتطوير',
    'assets.enterStabilizationPeriod': 'أدخل فترة الاستقرار',
    
    // Financial
    'financial.summary': 'الملخص المالي',
    'financial.revenue': 'الإيرادات',
    'financial.costs': 'التكاليف',
    'financial.profit': 'الربح',
    'financial.roi': 'العائد على الاستثمار',
    'financial.irr': 'معدل العائد الداخلي',
    'financial.npv': 'صافي القيمة الحالية',
    'financial.paybackPeriod': 'فترة الاسترداد',
    'financial.totalInvestment': 'إجمالي الاستثمار',
    'financial.totalRevenue': 'إجمالي الإيرادات',
    'financial.totalCosts': 'إجمالي التكاليف',
    'financial.netProfit': 'صافي الربح',
    
    // Scenarios
    'scenarios.title': 'السيناريوهات',
    'scenarios.baseCase': 'الحالة الأساسية',
    'scenarios.optimistic': 'متفائل',
    'scenarios.pessimistic': 'متشائم',
    'scenarios.custom': 'مخصص',
    'scenarios.select': 'اختر السيناريو',
    'scenarios.edit': 'تعديل قيم السيناريو',
    'scenarios.save': 'حفظ التغييرات',
    
    // Settings
    'settings.title': 'الإعدادات',
    'settings.comingSoon': 'صفحة الإعدادات قادمة قريباً...',
    'settings.language': 'اللغة',
    'settings.theme': 'المظهر',
    'settings.profile': 'الملف الشخصي',
    'settings.preferences': 'التفضيلات',
    
    // Export/Import
    'export.excel': 'تصدير إلى Excel',
    'export.pdf': 'تصدير إلى PDF',
    'export.history': 'تاريخ التصدير',
    'import.excel': 'استيراد من Excel',
    'import.data': 'استيراد البيانات',
    
    // Analytics
    'analytics.title': 'التحليلات',
    'analytics.overview': 'نظرة عامة',
    'analytics.performance': 'الأداء',
    'analytics.trends': 'الاتجاهات',
    'analytics.projections': 'التوقعات',
    
    // Team
    'team.title': 'الفريق',
    'team.members': 'أعضاء الفريق',
    'team.addMember': 'إضافة عضو',
    'team.permissions': 'الصلاحيات',
    'team.roles': 'الأدوار',
  }
};

// Use baseTranslations directly without external files for now
const translations = baseTranslations;

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const isRTL = language === 'ar';

  const t = (key: string): string => {
    // Look up the key directly from the flat translation object
    return translations[language][key] || key;
  };

  useEffect(() => {
    localStorage.setItem('language', language);
    
    // Update document direction and language
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Update body class for RTL styling
    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};