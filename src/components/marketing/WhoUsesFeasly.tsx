import { BarChart4, Building2, Users } from "lucide-react";

const personas = [
  {
    title: "For Analysts",
    icon: BarChart4,
    color: "from-primary/10 to-primary-light/10",
    iconColor: "text-primary",
    features: [
      "Upload Excel & run cases",
      "Compare IRR & metrics", 
      "Export investor-ready reports"
    ]
  },
  {
    title: "For Developers",
    icon: Building2,
    color: "from-success/10 to-success-light/10", 
    iconColor: "text-success",
    features: [
      "Import feasibility plans",
      "Share project snapshots",
      "Toggle Arabic & English"
    ]
  },
  {
    title: "For Enterprises",
    icon: Users,
    color: "from-secondary/10 to-accent/10",
    iconColor: "text-secondary", 
    features: [
      "Consolidate giga-projects",
      "Control access & auditing",
      "Request custom modules"
    ]
  }
];

export function WhoUsesFeasly() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Who Uses Feasly?
          </h2>
          <p className="text-xl text-muted-foreground">
            Built for every role in real estate development
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