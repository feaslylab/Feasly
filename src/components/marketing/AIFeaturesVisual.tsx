import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle, TrendingUp, BarChart3, Target, Zap } from "lucide-react";

const aiFeatures = [
  {
    title: "Smart Insights Panel",
    description: "Identify cost overruns, low-margin phases, or financial risks automatically.",
    icon: Brain,
    gradient: "from-primary/20 to-primary-light/20",
    mockupContent: {
      type: "insight",
      alerts: [
        { type: "warning", text: "Construction costs 12% above budget in Phase 2" },
        { type: "success", text: "Revenue projections on track for Q3" },
        { type: "info", text: "Consider value engineering for parking structure" }
      ]
    }
  },
  {
    title: "Automated KPI Alerts",
    description: "Set automated alerts for IRR drops, cost spikes, or delayed timelines.",
    icon: AlertTriangle,
    gradient: "from-warning/20 to-warning-light/20",
    mockupContent: {
      type: "alert",
      kpis: [
        { label: "IRR", value: "18.2%", change: "-2.1%", status: "warning" },
        { label: "NPV", value: "$45.2M", change: "+3.5%", status: "success" },
        { label: "Payback", value: "4.2 years", change: "+0.3", status: "neutral" }
      ]
    }
  },
  {
    title: "Optimization Recommendations",
    description: "Let Feasly suggest restructuring or value engineering options.",
    icon: TrendingUp,
    gradient: "from-success/20 to-success-light/20",
    mockupContent: {
      type: "optimization",
      suggestions: [
        { title: "Reduce parking ratio", impact: "+2.3% IRR", confidence: "High" },
        { title: "Optimize unit mix", impact: "+$1.2M NPV", confidence: "Medium" },
        { title: "Phase timing adjustment", impact: "-6 months", confidence: "High" }
      ]
    }
  }
];

function InsightMockup({ alerts }: { alerts: any[] }) {
  return (
    <div className="bg-background rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">AI Insights</span>
        <Badge variant="secondary" className="text-xs">Live</Badge>
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

function AlertMockup({ kpis }: { kpis: any[] }) {
  return (
    <div className="bg-background rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-4 w-4 text-warning" />
        <span className="text-sm font-medium">KPI Monitor</span>
        <Badge variant="outline" className="text-xs">Real-time</Badge>
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

function OptimizationMockup({ suggestions }: { suggestions: any[] }) {
  return (
    <div className="bg-background rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-success" />
        <span className="text-sm font-medium">Optimization</span>
        <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
      </div>
      {suggestions.map((suggestion, index) => (
        <div key={index} className="text-xs p-2 bg-muted/50 rounded border">
          <div className="font-medium mb-1">{suggestion.title}</div>
          <div className="flex justify-between text-muted-foreground">
            <span>{suggestion.impact}</span>
            <span>{suggestion.confidence} confidence</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AIFeaturesVisual() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Smarter decisions, instantly
          </h2>
          <p className="text-xl text-muted-foreground">
            AI-powered insights that help you optimize every aspect of your financial model.
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
                    <InsightMockup alerts={feature.mockupContent.alerts} />
                  )}
                  {feature.mockupContent.type === 'alert' && (
                    <AlertMockup kpis={feature.mockupContent.kpis} />
                  )}
                  {feature.mockupContent.type === 'optimization' && (
                    <OptimizationMockup suggestions={feature.mockupContent.suggestions} />
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
            <h3 className="text-xl font-bold mb-2">Ready to experience AI-powered modeling?</h3>
            <p className="text-muted-foreground mb-6">
              See how these features work in our interactive demo.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Try Live Demo
              </button>
              <button className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted/50 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}