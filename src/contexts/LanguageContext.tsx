import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations object
const translations = {
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
    
    // Feasly Model
    'feasly.model.title': 'Feasly Model',
    'feasly.model.description': 'Development feasibility engine for planning, input, and analysis.',
    'feasly.model.inputs': 'Feasly Model Inputs',
    'feasly.model.scenarios': 'Feasly Model Scenarios',
    'feasly.model.kpis': 'Feasly Model KPIs',
    
    // Feasly Flow
    'feasly.flow.title': 'Feasly Flow',
    'feasly.flow.description': 'Workflow management and process optimization.',
    'feasly.flow.coming_soon': 'Coming Soon',
    
    // Feasly Finance
    'feasly.finance.title': 'Feasly Finance',
    'feasly.finance.description': 'Financial modeling and analysis tools.',
    'feasly.finance.coming_soon': 'Coming Soon',
    
    // Feasly Consolidate
    'feasly.consolidate.title': 'Feasly Consolidate',
    'feasly.consolidate.description': 'Data consolidation and portfolio management.',
    'feasly.consolidate.coming_soon': 'Coming Soon',
    
    // Feasly Insights
    'feasly.insights.title': 'Feasly Insights',
    'feasly.insights.description': 'Advanced analytics and insights dashboard.',
    'feasly.insights.coming_soon': 'Coming Soon',
    
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
    'auth.login': 'Login',
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
    'auth.welcomeBack': 'Welcome back',
    'auth.loginToAccount': 'Log in to your account to continue',
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
    
    // Feasly Finance
    'feasly.finance.title': 'مالية فيزلي',
    'feasly.finance.description': 'أدوات النمذجة المالية والتحليل.',
    'feasly.finance.coming_soon': 'قريباً',
    
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
    'auth.signUpHere': 'أنشئ حسابك هنا',
    'auth.welcomeBack': 'مرحباً بعودتك',
    'auth.loginToAccount': 'سجل دخولك إلى حسابك للمتابعة',
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