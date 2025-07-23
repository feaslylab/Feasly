import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle, TrendingUp, BarChart3, Target, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

const getAiFeatures = (t: (key: string) => string) => [
  {
    title: t('aiFeatures.smartInsights.title'),
    description: t('aiFeatures.smartInsights.description'),
    icon: Brain,
    gradient: "from-primary/20 to-primary-light/20",
    mockupContent: {
      type: "insight",
      alerts: [
        { type: "warning", text: t('aiFeatures.smartInsights.alerts.constructionCost') },
        { type: "success", text: t('aiFeatures.smartInsights.alerts.revenueTrack') },
        { type: "info", text: t('aiFeatures.smartInsights.alerts.valueEngineering') }
      ]
    }
  },
  {
    title: t('aiFeatures.automatedAlerts.title'),
    description: t('aiFeatures.automatedAlerts.description'),
    icon: AlertTriangle,
    gradient: "from-warning/20 to-warning-light/20",
    mockupContent: {
      type: "alert",
      kpis: [
        { label: "IRR", value: "18.2%", change: "-2.1%", status: "warning" },
        { label: "NPV", value: "$45.2M", change: "+3.5%", status: "success" },
        { label: t('aiFeatures.automatedAlerts.kpis.payback'), value: "4.2 years", change: "+0.3", status: "neutral" }
      ]
    }
  },
  {
    title: t('aiFeatures.optimization.title'),
    description: t('aiFeatures.optimization.description'),
    icon: TrendingUp,
    gradient: "from-success/20 to-success-light/20",
    mockupContent: {
      type: "optimization",
      suggestions: [
        { title: t('aiFeatures.optimization.suggestions.parkingRatio'), impact: "+2.3% IRR", confidence: t('aiFeatures.optimization.confidence.high') },
        { title: t('aiFeatures.optimization.suggestions.unitMix'), impact: "+$1.2M NPV", confidence: t('aiFeatures.optimization.confidence.medium') },
        { title: t('aiFeatures.optimization.suggestions.phaseTiming'), impact: "-6 months", confidence: t('aiFeatures.optimization.confidence.high') }
      ]
    }
  }
];

function InsightMockup({ alerts, t }: { alerts: any[], t: (key: string) => string }) {
  return (
    <div className="bg-background rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{t('aiFeatures.labels.aiInsights')}</span>
        <Badge variant="secondary" className="text-xs">{t('aiFeatures.labels.live')}</Badge>
      </div>
      {alerts.map((alert, index) => (
        <div key={index} className={`text-xs p-2 rounded border-l-2 ${
          alert.type === 'warning' ? 'bg-warning/10 border-warning' :
          alert.type === 'success' ? 'bg-success/10 border-success' :
          'bg-primary/10 border-primary'
        }`}>
          {alert.text}
        </div>
      ))}
    </div>
  );
}

function AlertMockup({ kpis, t }: { kpis: any[], t: (key: string) => string }) {
  return (
    <div className="bg-background rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-4 w-4 text-warning" />
        <span className="text-sm font-medium">{t('aiFeatures.labels.kpiMonitor')}</span>
        <Badge variant="outline" className="text-xs">{t('aiFeatures.labels.realTime')}</Badge>
      </div>
      {kpis.map((kpi, index) => (
        <div key={index} className="flex items-center justify-between text-xs">
          <span className="font-medium">{kpi.label}</span>
          <div className="text-right">
            <div className="font-bold">{kpi.value}</div>
            <div className={`text-xs ${
              kpi.status === 'success' ? 'text-success' :
              kpi.status === 'warning' ? 'text-warning' :
              'text-muted-foreground'
            }`}>
              {kpi.change}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function OptimizationMockup({ suggestions, t }: { suggestions: any[], t: (key: string) => string }) {
  return (
    <div className="bg-background rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-success" />
        <span className="text-sm font-medium">{t('aiFeatures.labels.optimization')}</span>
        <Badge variant="secondary" className="text-xs">{t('aiFeatures.labels.aiPowered')}</Badge>
      </div>
      {suggestions.map((suggestion, index) => (
        <div key={index} className="text-xs p-2 bg-muted/50 rounded border">
          <div className="font-medium mb-1">{suggestion.title}</div>
          <div className="flex justify-between text-muted-foreground">
            <span>{suggestion.impact}</span>
            <span>{suggestion.confidence} {t('aiFeatures.labels.confidence')}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AIFeaturesVisual() {
  const { t } = useTranslation('marketing');
  const aiFeatures = getAiFeatures(t);
  
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('aiFeatures.section.title')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('aiFeatures.section.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {aiFeatures.map((feature, index) => (
            <Card key={index} className={`p-6 bg-gradient-to-br ${feature.gradient} border-border hover:shadow-lg transition-all duration-300`}>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-background/80 backdrop-blur-sm">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>

                {/* Visual Mockup */}
                <div className="mt-6">
                  {feature.mockupContent.type === 'insight' && (
                    <InsightMockup alerts={feature.mockupContent.alerts} t={t} />
                  )}
                  {feature.mockupContent.type === 'alert' && (
                    <AlertMockup kpis={feature.mockupContent.kpis} t={t} />
                  )}
                  {feature.mockupContent.type === 'optimization' && (
                    <OptimizationMockup suggestions={feature.mockupContent.suggestions} t={t} />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 rounded-xl p-8 border border-primary/20">
            <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{t('aiFeatures.cta.title')}</h3>
            <p className="text-muted-foreground mb-6">
              {t('aiFeatures.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                {t('aiFeatures.cta.tryDemo')}
              </button>
              <button className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted/50 transition-colors">
                {t('aiFeatures.cta.learnMore')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}