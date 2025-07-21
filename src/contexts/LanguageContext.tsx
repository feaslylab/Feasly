import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (key: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple translations object
const translations: Record<Language, Record<string, string>> = {
  en: {
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
    'auth.loggedIn': 'Logged in',
    'auth.viewAccount': 'View Account',
    'auth.account': 'Account',
    'auth.user': 'User',
    'auth.signOut': 'Sign Out',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.projects': 'Projects',
    'nav.settings': 'Settings',
    'nav.newProject': 'New Project',
    'nav.model': 'Feasly Model',
    'nav.flow': 'Feasly Flow',
    'nav.finance': 'Feasly Finance',
    'nav.consolidate': 'Feasly Consolidate',
    'nav.insights': 'Feasly Insights',

    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    
    // Feasly Model
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
    'feasly.model.currency_code': 'Currency',
    'feasly.model.language': 'Language',
    'feasly.model.timeline_phases': 'Timeline & Phases',
    'feasly.model.timeline_phases_desc': 'Project schedule and phasing information',
    'feasly.model.start_date': 'Start Date',
    'feasly.model.duration_months': 'Duration (Months)',
    'feasly.model.completion_date': 'Completion Date',
    'feasly.model.construction_start_date': 'Construction Start Date',
    'feasly.model.construction_start': 'Construction Start Date',
    'feasly.model.stabilization_period': 'Stabilization Period (Months)',
    'feasly.model.phasing_enabled': 'Enable Phasing',
    'feasly.model.phasing_enabled_desc': 'Break down the project into multiple phases',
    'feasly.model.site_area_metrics': 'Site & Area Metrics',
    'feasly.model.site_area_metrics_desc': 'Land and building area calculations',
    'feasly.model.site_area_sqm': 'Site Area (sqm)',
    'feasly.model.total_gfa_sqm': 'Total GFA (sqm)',
    'feasly.model.efficiency_ratio': 'Efficiency Ratio (%)',
    'feasly.model.far_ratio': 'FAR Ratio',
    'feasly.model.height_stories': 'Height (Stories)',
    'feasly.model.plot_number': 'Plot Number',
    'feasly.model.buildable_ratio': 'Buildable Ratio',
    'feasly.model.calculated_end_date': 'Calculated End Date',
    'feasly.model.calculated_end_date_tooltip': 'Automatically calculated based on start date and duration',
    'feasly.model.select_date': 'Select date',
    'feasly.model.financial_inputs': 'Financial Inputs',
    'feasly.model.financial_inputs_desc': 'Project costs and investment details',
    'feasly.model.land_cost': 'Land Cost',
    'feasly.model.construction_cost': 'Construction Cost',
    'feasly.model.soft_costs': 'Soft Costs',
    'feasly.model.marketing_cost': 'Marketing Cost',
    'feasly.model.contingency_percent': 'Contingency (%)',
    'feasly.model.contingency_value': 'Contingency Value',
    'feasly.model.total_investment': 'Total Investment',
    'feasly.model.zakat_applicable': 'Zakat Applicable',
    'feasly.model.zakat_rate_percent': 'Zakat Rate (%)',
    'feasly.model.escrow_required': 'Escrow Required',
    'feasly.model.funding_capital': 'Funding & Capital',
    'feasly.model.funding_capital_desc': 'Funding sources and capital structure',
    'feasly.model.funding_type': 'Funding Type',
    'feasly.model.total_funding': 'Total Funding',
    'feasly.model.equity_contribution': 'Equity Contribution',
    'feasly.model.loan_amount': 'Loan Amount',
    'feasly.model.funding_gap': 'Funding Gap',
    'feasly.model.interest_rate': 'Interest Rate (%)',
    'feasly.model.loan_term_years': 'Loan Term (Years)',
    'feasly.model.grace_period_months': 'Grace Period (Months)',
    'feasly.model.loan_repayment_type': 'Loan Repayment Type',
    'feasly.model.revenue_projections': 'Revenue Projections',
    'feasly.model.revenue_projections_desc': 'Sales and revenue estimates',
    'feasly.model.average_sale_price': 'Average Sale Price',
    'feasly.model.expected_sale_rate': 'Expected Sale Rate (sqm/month)',
    'feasly.model.expected_lease_rate': 'Expected Lease Rate',
    'feasly.model.yield_estimate': 'Yield Estimate (%)',
    'feasly.model.target_irr': 'Target IRR (%)',
    'feasly.model.target_roi': 'Target ROI (%)',
    'feasly.model.scenario_analysis': 'Scenario Analysis',
    'feasly.model.scenario_analysis_desc': 'Compare different scenarios and assumptions',
    'feasly.model.scenario_base': 'Base',
    'feasly.model.scenario_optimistic': 'Optimistic',
    'feasly.model.scenario_pessimistic': 'Pessimistic',
    'feasly.model.scenario_custom': 'Custom',
    'feasly.model.edit_scenario': 'Edit Scenario',
    'feasly.model.kpi_dashboard': 'KPI Dashboard',
    'feasly.model.kpi_dashboard_desc': 'Key performance indicators and financial metrics',
    'feasly.model.total_cost': 'Total Cost',
    'feasly.model.total_revenue': 'Total Revenue',
    'feasly.model.profit': 'Profit',
    'feasly.model.profit_margin': 'Profit Margin (%)',
    'feasly.model.roi': 'ROI (%)',
    'feasly.model.irr': 'IRR (%)',
    'feasly.model.payback_period': 'Payback Period (Years)',
    'feasly.model.zakat_due': 'Zakat Due',
    'feasly.model.save_project': 'Save Project',
    'feasly.model.export_data': 'Export Data',
    'feasly.model.reset_form': 'Reset Form',
  },
  ar: {
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
    'auth.alreadyHaveAccount': 'هل لديك حساب بالفعل؟',
    'auth.dontHaveAccount': 'ليس لديك حساب؟',
    'auth.signInHere': 'سجل دخولك هنا',
    'auth.signUpHere': 'أنشئ حسابك هنا',
    'auth.welcomeBack': 'مرحباً بعودتك',
    'auth.loginToAccount': 'سجل دخولك إلى حسابك',
    'auth.createAccount': 'أنشئ حسابك',
    'auth.getStarted': 'ابدأ مع منصة النمذجة المالية',
    'auth.loggedIn': 'مسجل الدخول',
    'auth.viewAccount': 'عرض الحساب',
    'auth.account': 'الحساب',
    'auth.user': 'المستخدم',
    'auth.signOut': 'تسجيل الخروج',

    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.projects': 'المشاريع',
    'nav.settings': 'الإعدادات',
    'nav.newProject': 'مشروع جديد',
    'nav.model': 'نموذج فيزلي',
    'nav.flow': 'تدفق فيزلي',
    'nav.finance': 'مالية فيزلي',
    'nav.consolidate': 'توحيد فيزلي',
    'nav.insights': 'رؤى فيزلي',

    // Common
    'common.loading': 'جاري التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.edit': 'تحرير',
    'common.delete': 'حذف',
    
    // Feasly Model (Arabic)
    'feasly.model.title': 'نموذج فيزلي',
    'feasly.model.description': 'محرك الجدوى التطويرية للتخطيط والإدخال والتحليل',
    'feasly.model.project_metadata': 'بيانات المشروع الأساسية',
    'feasly.model.project_metadata_desc': 'معلومات المشروع الأساسية وتفاصيل الموقع',
    'feasly.model.project_name': 'اسم المشروع',
    'feasly.model.project_name_placeholder': 'أدخل اسم المشروع',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(false);

  const isRTL = useMemo(() => language === 'ar', [language]);

  const setLanguage = (lang: Language) => {
    setIsLoading(true);
    setLanguageState(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    setIsLoading(false);
  };

  const t = (key: string): string => {
    const translation = translations[language]?.[key];
    return translation || key;
  };

  // Set initial HTML attributes
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRTL, language]);

  // Memoize context value
  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    isRTL,
    t,
    isLoading,
  }), [language, isRTL, isLoading]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    console.warn('useLanguage called outside LanguageProvider, using fallback');
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      isRTL: false,
      t: (key: string) => key,
      isLoading: false,
    };
  }
  return context;
};