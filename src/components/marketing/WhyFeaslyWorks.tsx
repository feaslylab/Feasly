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
    <section className="py-24">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step, index) => (
              <div key={index} className="bg-surface rounded-3xl p-8 shadow-lg hover:scale-[1.02] transition">
                {/* Icon container */}
                <div className="size-12 md:size-14 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                  <step.icon className="h-6 w-6 md:h-7 md:w-7" />
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-semibold mb-2 leading-tight">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}