import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, DollarSign, Users, Calendar } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ProjectSection from "./inputs/ProjectSection";
import ProductMixSection from "./inputs/ProductMixSection";
import CostSection from "./inputs/CostSection";
import FinancingSection from "./inputs/FinancingSection";
import FeaslyValidationPanel from './validation/FeaslyValidationPanel';

export default function InputsPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get('section') || 'project';

  const handleSectionClick = (section: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('tab', 'inputs');
      newParams.set('section', section);
      return newParams;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Project Inputs</h2>
        <p className="text-muted-foreground">
          Configure your project parameters and assumptions
        </p>
      </div>

      {/* Validation Panel */}
      <FeaslyValidationPanel 
        projectId="current-project" 
        onSectionClick={handleSectionClick}
      />

      <Tabs value={activeSection} onValueChange={handleSectionClick} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="project" className="gap-2">
            <Building2 className="h-4 w-4" />
            Project
          </TabsTrigger>
          <TabsTrigger value="units" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Product Mix
          </TabsTrigger>
          <TabsTrigger value="costs" className="gap-2">
            <Calendar className="h-4 w-4" />
            Costs
          </TabsTrigger>
          <TabsTrigger value="financing" className="gap-2">
            <Users className="h-4 w-4" />
            Financing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="project" className="space-y-4">
          <section id="section-project">
            <ProjectSection />
          </section>
        </TabsContent>

        <TabsContent value="units" className="space-y-4">
          <section id="section-units">
            <ProductMixSection />
          </section>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <section id="section-costs" data-section="costs">
            <CostSection />
          </section>
        </TabsContent>

        <TabsContent value="financing" className="space-y-4">
          <section id="section-financing" data-section="financing">
            <FinancingSection />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}