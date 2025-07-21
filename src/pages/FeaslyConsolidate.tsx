import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export default function FeaslyConsolidate() {
  const { t, isRTL } = useLanguage();

  return (
    <div className={cn("p-8", isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-bold mb-4">{t('feasly.consolidate.title')}</h1>
      <p className="text-muted-foreground">{t('feasly.consolidate.description')}</p>

      <div className="mt-8">
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">{t('feasly.consolidate.coming_soon')}</h2>
          <p className="text-muted-foreground">Data consolidation and portfolio management will be implemented here.</p>
        </div>
      </div>
    </div>
  );
}