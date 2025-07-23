import { Building2, FileText, Building } from "lucide-react";

const useCases = [
  {
    title: "500-unit residential feasibility",
    description: "Uploaded Excel. Built scenarios. Delivered 20-year projection with IRR.",
    icon: Building2,
    color: "from-primary/10 to-primary-light/10",
    iconColor: "text-primary"
  },
  {
    title: "Legacy .edmf model for Saudi project", 
    description: "Migrated old EstateMaster file. Feasly mapped it in seconds.",
    icon: FileText,
    color: "from-success/10 to-success-light/10",
    iconColor: "text-success"
  },
  {
    title: "Hotel development with 3 case stress test",
    description: "Used scenario tabs to compare equity IRR under market shifts.",
    icon: Building,
    color: "from-warning/10 to-warning-light/10", 
    iconColor: "text-warning"
  }
];

export function HowRealTeamsUseFeasly() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            How Real Teams Use Feasly
          </h2>
          <p className="text-xl text-muted-foreground">
            Practical stories from the field
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