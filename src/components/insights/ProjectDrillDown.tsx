import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, DollarSign, TrendingUp, TrendingDown, BarChart3, 
  MapPin, Calendar, ExternalLink, Target, PieChart 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";

interface Project {
  id: string;
  name: string;
  totalGFA: number;
  constructionCost: number;
  estimatedRevenue: number;
  irr: number;
  roi: number;
  profitMargin: number;
  netProfit: number;
  status: 'Planning' | 'Development' | 'Construction' | 'Completed';
  currency: string;
  createdAt: Date;
  scenario: 'Base' | 'Optimistic' | 'Pessimistic' | 'Custom';
  country?: string;
  city?: string;
}

interface ProjectDrillDownProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  allProjects: Project[];
}

export const ProjectDrillDown = ({ 
  project, 
  open, 
  onClose, 
  formatCurrency, 
  allProjects 
}: ProjectDrillDownProps) => {
  const { isRTL } = useLanguage();
  const { t } = useTranslation('feasly.insights');

  if (!project) return null;

  // Find other scenarios for the same project
  const projectScenarios = allProjects.filter(p => 
    p.name === project.name && p.id !== project.id
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Construction': return 'bg-blue-100 text-blue-800';
      case 'Development': return 'bg-yellow-100 text-yellow-800';
      case 'Planning': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case 'Optimistic': return 'bg-green-100 text-green-800';
      case 'Base': return 'bg-blue-100 text-blue-800';
      case 'Pessimistic': return 'bg-red-100 text-red-800';
      case 'Custom': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevel = (irr: number, profitMargin: number) => {
    if (irr >= 20 && profitMargin >= 25) return { level: 'Low', color: 'text-green-600' };
    if (irr >= 15 && profitMargin >= 15) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'High', color: 'text-red-600' };
  };

  const risk = getRiskLevel(project.irr, project.profitMargin);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-4xl max-h-[90vh] overflow-y-auto", isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {project.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Header Info */}
          <div className="flex flex-wrap gap-4 items-center">
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            <Badge className={getScenarioColor(project.scenario)}>
              {project.scenario} Scenario
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {project.city}, {project.country}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {project.createdAt.toLocaleDateString()}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total GFA</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {project.totalGFA.toLocaleString()} sqm
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Construction Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(project.constructionCost)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estimated Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(project.estimatedRevenue)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                {project.netProfit >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", 
                  project.netProfit >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(project.netProfit)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">IRR</span>
                    <span className="text-sm font-bold">{project.irr.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(project.irr, 30) * (100/30)} className="h-2" />
                  <div className="text-xs text-muted-foreground">Target: 20%+</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">ROI</span>
                    <span className="text-sm font-bold">{project.roi.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(project.roi, 50) * (100/50)} className="h-2" />
                  <div className="text-xs text-muted-foreground">Target: 30%+</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Profit Margin</span>
                    <span className="text-sm font-bold">{project.profitMargin.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(project.profitMargin, 40) * (100/40)} className="h-2" />
                  <div className="text-xs text-muted-foreground">Target: 25%+</div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Risk Level</span>
                <Badge className={cn("font-medium", 
                  risk.level === 'Low' ? 'bg-green-100 text-green-800' :
                  risk.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                )}>
                  {risk.level} Risk
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Scenario Comparison */}
          {projectScenarios.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Scenario Comparison</CardTitle>
                <CardDescription>
                  Comparing different scenarios for {project.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[project, ...projectScenarios].map((scenario, index) => (
                    <div key={scenario.id} className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      index === 0 ? "bg-accent/50" : ""
                    )}>
                      <div className="flex items-center gap-3">
                        <Badge className={getScenarioColor(scenario.scenario)}>
                          {scenario.scenario}
                        </Badge>
                        {index === 0 && <span className="text-xs text-muted-foreground">(Current)</span>}
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <span className="text-muted-foreground">IRR: </span>
                          <span className="font-medium">{scenario.irr.toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ROI: </span>
                          <span className="font-medium">{scenario.roi.toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Net Profit: </span>
                          <span className="font-medium">{formatCurrency(scenario.netProfit)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View in Model
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              View in Finance
            </Button>
            <Button variant="outline" size="sm">
              <PieChart className="h-4 w-4 mr-2" />
              View in Flow
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};