import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import ConsolidatedPortfolioTable from "@/components/FeaslyModel/ConsolidatedPortfolioTable";
import { BarChart3 } from "lucide-react";

export default function FeaslyConsolidate() {
  const { isRTL } = useLanguage();
  const { t } = useTranslation('feasly.consolidate');

  return (
    <div className={cn("px-4 py-6 md:px-8 lg:px-12 max-w-screen-xl mx-auto", isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <ConsolidatedPortfolioTable />
    </div>
  );
}