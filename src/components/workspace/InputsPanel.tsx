import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building2, DollarSign, Users, Calendar } from 'lucide-react';

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
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>
                Basic project configuration and timeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <div className="mt-1 text-sm text-muted-foreground">2025-01-01</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Periods</label>
                  <div className="mt-1 text-sm text-muted-foreground">60 months</div>
                </div>
              </div>
              <Badge variant="secondary">Configuration loaded from project</Badge>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="units" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unit Types</CardTitle>
              <CardDescription>
                Define the different unit types in your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No unit types configured yet
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="financing" className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}