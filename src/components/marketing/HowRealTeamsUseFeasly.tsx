import { Building2, FileText, Building } from "lucide-react";
import { useTranslation } from "react-i18next";

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className={`rounded-xl border border-border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br ${useCase.color}`}
            >
              {/* Icon */}
              <div className={`rounded-lg p-3 w-fit mb-4 bg-gradient-to-r ${useCase.color}`}>
                <useCase.icon className={`h-6 w-6 ${useCase.iconColor}`} />
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-semibold mb-3 leading-tight">
                {useCase.title}
              </h3>
              <p className="text-muted-foreground">
                {useCase.description}
              </p>
              
              {/* Visual placeholder */}
              <div className="mt-6 aspect-[16/10] bg-gradient-to-br from-background/80 to-muted/60 rounded-lg flex items-center justify-center">
                <useCase.icon className={`h-8 w-8 opacity-40 ${useCase.iconColor}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}