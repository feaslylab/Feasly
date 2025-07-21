import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export default function FeaslyInsights() {
  const { t, isRTL } = useLanguage();

  return (
    <div className={cn("p-8", isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-bold mb-4">{t('feasly.insights.title')}</h1>
      <p className="text-muted-foreground">{t('feasly.insights.description')}</p>

      <div className="mt-8">
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">{t('feasly.insights.coming_soon')}</h2>
          <p className="text-muted-foreground">Advanced analytics and insights dashboard will be implemented here.</p>
        </div>
      </div>
    </div>
  );
}