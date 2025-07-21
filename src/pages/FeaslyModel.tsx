import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export default function FeaslyModel() {
  const { t, isRTL } = useLanguage();

  return (
    <div className={cn("p-8", isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-bold mb-4">{t('feasly.model.title')}</h1>
      <p className="text-muted-foreground">{t('feasly.model.description')}</p>

      {/* Future components to include here: 
          - Asset creation form
          - Project summary
          - Scenario toggles
          - Output metrics 
      */}
      
      <div className="mt-8 grid gap-6">
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">{t('feasly.model.inputs')}</h2>
          <p className="text-muted-foreground">Asset creation and project parameter inputs will go here.</p>
        </div>
        
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">{t('feasly.model.scenarios')}</h2>
          <p className="text-muted-foreground">Scenario toggles and analysis options will go here.</p>
        </div>
        
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">{t('feasly.model.kpis')}</h2>
          <p className="text-muted-foreground">Output metrics and KPI dashboard will go here.</p>
        </div>
      </div>
    </div>
  );
}