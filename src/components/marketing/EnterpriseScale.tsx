import { Shield, FileText, Globe2, Clock, Users, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";

export function EnterpriseScale() {
  const { t } = useTranslation('marketing');

  const getFeatures = () => [
    {
      icon: Shield,
      text: t('home.enterpriseScale.features.secureHosting'),
      color: "text-primary"
    },
    {
      icon: FileText,
      text: t('home.enterpriseScale.features.legacySupport'), 
      color: "text-success"
    },
    {
      icon: Globe2,
      text: t('home.enterpriseScale.features.arabicCompliance'),
      color: "text-warning"
    },
    {
      icon: Clock,
      text: t('home.enterpriseScale.features.auditLogs'),
      color: "text-secondary"
    },
    {
      icon: Users,
      text: t('home.enterpriseScale.features.permissionAccess'),
      color: "text-primary"
    },
    {
      icon: Layers,
      text: t('home.enterpriseScale.features.modularStructure'),
      color: "text-success"
    }
  ];

  const features = getFeatures();

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('home.enterpriseScale.title')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('home.enterpriseScale.subtitle')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-xl border border-border bg-background hover:shadow-md transition-all duration-300"
              >
                <div className="bg-muted/50 p-3 rounded-lg flex-shrink-0">
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <div className="bg-primary/10 rounded-xl border border-primary/20 p-6">
              <p className="text-primary font-medium">
                {t('home.enterpriseScale.trustBanner')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}