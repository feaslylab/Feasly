import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export default function FeaslyFinance() {
  const { t, isRTL } = useLanguage();

  return (
    <div className={cn("p-8", isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-bold mb-4">{t('feasly.finance.title')}</h1>
      <p className="text-muted-foreground">{t('feasly.finance.description')}</p>

      <div className="mt-8">
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">{t('feasly.finance.coming_soon')}</h2>
          <p className="text-muted-foreground">Financial modeling and analysis tools will be implemented here.</p>
        </div>
      </div>
    </div>
  );
}