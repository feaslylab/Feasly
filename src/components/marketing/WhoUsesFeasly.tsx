import { BarChart4, Building2, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export function WhoUsesFeasly() {
  const { t } = useTranslation('marketing');

  const getPersonas = () => {
    const analystFeatures = t('home.whoUses.analysts.features', { returnObjects: true });
    const developerFeatures = t('home.whoUses.developers.features', { returnObjects: true });
    const enterpriseFeatures = t('home.whoUses.enterprises.features', { returnObjects: true });

    return [
      {
        title: t('home.whoUses.analysts.title'),
        icon: BarChart4,
        color: "from-primary/10 to-primary-light/10",
        iconColor: "text-primary",
        features: Array.isArray(analystFeatures) ? analystFeatures : []
      },
      {
        title: t('home.whoUses.developers.title'),
        icon: Building2,
        color: "from-success/10 to-success-light/10", 
        iconColor: "text-success",
        features: Array.isArray(developerFeatures) ? developerFeatures : []
      },
      {
        title: t('home.whoUses.enterprises.title'),
        icon: Users,
        color: "from-secondary/10 to-accent/10",
        iconColor: "text-secondary", 
        features: Array.isArray(enterpriseFeatures) ? enterpriseFeatures : []
      }
    ];
  };

  const personas = getPersonas();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('home.whoUses.title')}
          </h2>
          <p className="text-xl text-muted-foreground mb-4">
            {t('home.whoUses.subtitle')}
          </p>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            {t('home.whoUses.socialProof')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {personas.map((persona, index) => (
            <div
              key={index}
              className={`rounded-xl border border-border p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br ${persona.color}`}
            >
              {/* Icon */}
              <div className={`rounded-full p-4 w-fit mx-auto mb-6 bg-gradient-to-r ${persona.color}`}>
                <persona.icon className={`h-8 w-8 ${persona.iconColor}`} />
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-center mb-6">
                {persona.title}
              </h3>
              
              {/* Features */}
              <div className="space-y-4">
                {persona.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    <p className="text-muted-foreground">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}