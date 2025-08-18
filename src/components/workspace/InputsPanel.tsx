import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building2, DollarSign, Users, Calendar } from 'lucide-react';
import ProjectSection from './inputs/ProjectSection';
import UnitsSection from './inputs/UnitsSection';

export default function InputsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Project Inputs</h2>
        <p className="text-muted-foreground">
          Configure your project parameters and assumptions
        </p>
      </div>

      <Tabs defaultValue="project" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="project" className="gap-2">
            <Building2 className="h-4 w-4" />
            Project
          </TabsTrigger>
          <TabsTrigger value="units" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Units
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
            <UnitsSection />
          </section>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <section id="section-costs" data-section="costs">
            <Card>
              <CardHeader>
                <CardTitle>Cost Items</CardTitle>
                <CardDescription>
                  Project costs and construction schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  No cost items configured yet
                </div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="financing" className="space-y-4">
          <section id="section-financing" data-section="financing">
            <Card>
              <CardHeader>
                <CardTitle>Financing Structure</CardTitle>
                <CardDescription>
                  Debt and equity configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  No financing configured yet
                </div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}