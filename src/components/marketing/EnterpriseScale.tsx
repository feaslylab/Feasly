import { Shield, FileText, Globe2, Clock, Users, Layers } from "lucide-react";

const features = [
  {
    icon: Shield,
    text: "Secure cloud hosting (SOC2-ready)",
    color: "text-primary"
  },
  {
    icon: FileText,
    text: "Supports legacy .edmf and modern Excel", 
    color: "text-success"
  },
  {
    icon: Globe2,
    text: "Designed with Arabic-first compliance",
    color: "text-warning"
  },
  {
    icon: Clock,
    text: "Full audit logs and version control",
    color: "text-secondary"
  },
  {
    icon: Users,
    text: "Permission-based access and sharing",
    color: "text-primary"
  },
  {
    icon: Layers,
    text: "Modular structure — tailored to your org",
    color: "text-success"
  }
];

export function EnterpriseScale() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Built for Enterprise at Any Scale
          </h2>
          <p className="text-xl text-muted-foreground">
            From single projects to giga-scale portfolios
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
                Trusted by teams managing $100M+ portfolios across the GCC
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}