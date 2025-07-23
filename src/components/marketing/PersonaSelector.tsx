import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileSpreadsheet, Layers, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const personas = [
  {
    id: "excel-user",
    title: "I build models in Excel",
    icon: FileSpreadsheet,
    description: "Upload spreadsheets, get structured models instantly",
    action: {
      type: "link",
      href: "/demo",
      text: "See Excel Import Demo"
    }
  },
  {
    id: "multi-project",
    title: "I manage multiple projects", 
    icon: Layers,
    description: "Consolidate and compare across your portfolio",
    action: {
      type: "link",
      href: "/demo",
      text: "View Portfolio Demo"
    }
  },
  {
    id: "team-lead",
    title: "I lead a development team",
    icon: Building2,
    description: "Enterprise features for collaboration and control",
    action: {
      type: "link", 
      href: "/pricing",
      text: "Explore Enterprise"
    }
  }
];

export function PersonaSelector() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            What describes you best?
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose your path to get the most relevant experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {personas.map((persona) => (
            <Card
              key={persona.id}
              className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                selectedPersona === persona.id 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedPersona(persona.id)}
            >
              <div className="text-center space-y-4">
                <div className={`w-12 h-12 mx-auto rounded-lg flex items-center justify-center ${
                  selectedPersona === persona.id 
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary"
                }`}>
                  <persona.icon className="h-6 w-6" />
                </div>
                
                <h3 className="text-lg font-semibold">{persona.title}</h3>
                <p className="text-sm text-muted-foreground">{persona.description}</p>
                
                <Button 
                  variant={selectedPersona === persona.id ? "default" : "outline"}
                  className="w-full"
                  asChild
                >
                  <Link to={persona.action.href}>
                    {persona.action.text}
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}