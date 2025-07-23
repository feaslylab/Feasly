import { Check, X, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FeaslyVsOldWay() {
  const { t } = useTranslation('marketing');

  const getComparisons = () => [
    {
      capability: t('home.feaslyVsOldWay.comparisons.realTimeScenarios'),
      feasly: true,
      traditional: false,
    },
    {
      capability: t('home.feaslyVsOldWay.comparisons.arabicRtl'), 
      feasly: true,
      traditional: false,
    },
    {
      capability: t('home.feaslyVsOldWay.comparisons.excelImport'),
      feasly: true,
      traditional: "limited",
    },
    {
      capability: t('home.feaslyVsOldWay.comparisons.legacyEdmf'),
      feasly: true,
      traditional: "limited",
    },
    {
      capability: t('home.feaslyVsOldWay.comparisons.publicDemo'),
      feasly: true,
      traditional: false,
    },
    {
      capability: t('home.feaslyVsOldWay.comparisons.auditExports'),
      feasly: true,
      traditional: "limited",
    },
  ];

  const comparisons = getComparisons();

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('home.feaslyVsOldWay.title')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('home.feaslyVsOldWay.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-background rounded-xl border border-border overflow-hidden shadow-lg">
            {/* Header */}
            <div className="bg-muted/50 p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center font-semibold">{t('home.feaslyVsOldWay.tableHeaders.capability')}</div>
                <div className="text-center font-semibold text-primary">{t('home.feaslyVsOldWay.tableHeaders.feasly')}</div>
                <div className="text-center font-semibold text-muted-foreground">{t('home.feaslyVsOldWay.tableHeaders.traditional')}</div>
              </div>
            </div>
            
            {/* Comparison rows */}
            <div className="divide-y divide-border">
              {comparisons.map((item, index) => (
                <div key={index} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    {/* Capability */}
                    <div className="text-sm md:text-base">{item.capability}</div>
                    
                    {/* Feasly */}
                    <div className="flex justify-center">
                      {item.feasly === true && (
                        <Check className="h-5 w-5 text-success" />
                      )}
                      {item.feasly === false && (
                        <X className="h-5 w-5 text-destructive" />
                      )}
                      {typeof item.feasly === 'string' && (
                        <span className="text-sm text-warning flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          {item.feasly}
                        </span>
                      )}
                    </div>
                    
                    {/* Traditional */}
                    <div className="flex justify-center">
                      {item.traditional === true && (
                        <Check className="h-5 w-5 text-success" />
                      )}
                      {item.traditional === false && (
                        <X className="h-5 w-5 text-destructive" />
                      )}
                      {typeof item.traditional === 'string' && (
                        <span className="text-sm text-warning flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          {item.traditional}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              {t('home.feaslyVsOldWay.legend')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}