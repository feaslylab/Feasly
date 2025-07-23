import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileSpreadsheet, Layers, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function PersonaSelector() {
  const { t } = useTranslation('marketing');
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const getPersonas = () => [
    {
      id: "excel-user",
      title: t('home.personaSelector.personas.excelUser.title'),
      icon: FileSpreadsheet,
      description: t('home.personaSelector.personas.excelUser.description'),
      action: {
        type: "link",
        href: "/demo",
        text: t('home.personaSelector.personas.excelUser.actionText')
      }
    },
    {
      id: "multi-project",
      title: t('home.personaSelector.personas.multiProject.title'), 
      icon: Layers,
      description: t('home.personaSelector.personas.multiProject.description'),
      action: {
        type: "link",
        href: "/demo",
        text: t('home.personaSelector.personas.multiProject.actionText')
      }
    },
    {
      id: "team-lead",
      title: t('home.personaSelector.personas.teamLead.title'),
      icon: Building2,
      description: t('home.personaSelector.personas.teamLead.description'),
      action: {
        type: "link", 
        href: "/pricing",
        text: t('home.personaSelector.personas.teamLead.actionText')
      }
    }
  ];

  const personas = getPersonas();

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {t('home.personaSelector.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('home.personaSelector.subtitle')}
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