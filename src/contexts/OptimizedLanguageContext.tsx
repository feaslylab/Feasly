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

// Import the original translations for now to fix the immediate issue
const translations = {
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
    'nav.portfolio': 'Portfolio',
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
    'nav.portfolio': 'المحفظة',
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

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations[Language]] || key;
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
  }), [language, setLanguage, isRTL, t, isLoading]);

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