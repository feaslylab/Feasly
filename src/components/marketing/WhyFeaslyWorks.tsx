import { Upload, Expand, Languages, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function WhyFeaslyWorks() {
  const { t } = useTranslation('marketing');

  const getSteps = () => [
    {
      number: "01",
      title: t('home.whyFeaslyWorks.steps.uploadExcel.title'),
      description: t('home.whyFeaslyWorks.steps.uploadExcel.description'),
      icon: Upload,
      color: "from-primary/20 to-primary-light/20",
      iconColor: "text-primary"
    },
    {
      number: "02", 
      title: t('home.whyFeaslyWorks.steps.toggleScenarios.title'),
      description: t('home.whyFeaslyWorks.steps.toggleScenarios.description'),
      icon: Expand,
      color: "from-success/20 to-success-light/20",
      iconColor: "text-success"
    },
    {
      number: "03",
      title: t('home.whyFeaslyWorks.steps.switchArabic.title'), 
      description: t('home.whyFeaslyWorks.steps.switchArabic.description'),
      icon: Languages,
      color: "from-warning/20 to-warning-light/20",
      iconColor: "text-warning"
    },
    {
      number: "04",
      title: t('home.whyFeaslyWorks.steps.generateExport.title'),
      description: t('home.whyFeaslyWorks.steps.generateExport.description'),
      icon: Share2,
      color: "from-secondary/20 to-accent/20", 
      iconColor: "text-secondary"
    }
  ];

  const steps = getSteps();

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('home.whyFeaslyWorks.title')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('home.whyFeaslyWorks.subtitle')}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Connection line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 left-full w-8 h-px bg-border z-10 transform -translate-y-1/2" />
                )}
                
                <div className="bg-background rounded-xl border border-border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative z-20">
                  {/* Step number */}
                  <div className="text-sm font-mono text-muted-foreground mb-4">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className={cn(
                    "rounded-lg p-3 w-fit mb-4 bg-gradient-to-r",
                    step.color
                  )}>
                    <step.icon className={cn("h-6 w-6", step.iconColor)} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-semibold mb-2 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                  
                  {/* Visual placeholder */}
                  <div className="mt-6 aspect-[4/3] bg-gradient-to-br from-muted/50 to-muted rounded-lg flex items-center justify-center">
                    <step.icon className={cn("h-8 w-8 opacity-50", step.iconColor)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}