import { Building2, FileText, Building } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "./ScrollReveal";

export function HowRealTeamsUseFeasly() {
  const { t } = useTranslation('marketing');

  const getUseCases = () => [
    {
      title: t('home.howRealTeams.useCases.residential.title'),
      description: t('home.howRealTeams.useCases.residential.description'),
      icon: Building2,
      color: "from-primary/10 to-primary-light/10",
      iconColor: "text-primary"
    },
    {
      title: t('home.howRealTeams.useCases.legacy.title'), 
      description: t('home.howRealTeams.useCases.legacy.description'),
      icon: FileText,
      color: "from-success/10 to-success-light/10",
      iconColor: "text-success"
    },
    {
      title: t('home.howRealTeams.useCases.hotel.title'),
      description: t('home.howRealTeams.useCases.hotel.description'),
      icon: Building,
      color: "from-warning/10 to-warning-light/10", 
      iconColor: "text-warning"
    }
  ];

  const useCases = getUseCases();

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('home.howRealTeams.title')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('home.howRealTeams.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-16">
          {useCases.map((useCase, index) => (
            <ScrollReveal key={index} delay={index * 0.2}>
              <div className="border-l-4 border-primary pl-6">
                {/* Icon */}
                <div className={`rounded-lg p-3 w-fit mb-4 bg-gradient-to-r ${useCase.color}`}>
                  <useCase.icon className={`h-6 w-6 ${useCase.iconColor}`} />
                </div>
                
                {/* Content */}
                <h3 className="text-2xl font-semibold mb-3 leading-tight">
                  {useCase.title}
                </h3>
                <p className="text-lg text-muted-foreground">
                  {useCase.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}