import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Building2, Calendar, FileText, Globe } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { ReadOnlyScenarioSelector } from "@/components/scenarios/ReadOnlyScenarioSelector";
import { FinancialSummaryCards } from "@/components/financial/FinancialSummaryCards";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Project {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_public: boolean;
}

interface Asset {
  id: string;
  project_id: string;
  name: string;
  type: 'Residential' | 'Mixed Use' | 'Retail' | 'Hospitality' | 'Infrastructure';
  gfa_sqm: number;
  construction_cost_aed: number;
  annual_operating_cost_aed: number;
  annual_revenue_potential_aed: number;
  occupancy_rate_percent: number;
  cap_rate_percent: number;
  development_timeline_months: number;
  stabilization_period_months: number;
  created_at: string;
  updated_at: string;
}

const ProjectPublic = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project-public", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .eq("is_public", true)
        .single();

      if (error) throw error;
      return data as Project;
    },
    enabled: !!id,
  });

  const { data: assets } = useQuery({
    queryKey: ["assets-public", id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Asset[];
    },
    enabled: !!id && !!project,
  });

  const { data: scenarios } = useQuery({
    queryKey: ["scenarios-public", id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from("scenarios")
        .select("*")
        .eq("project_id", id)
        .order("is_base", { ascending: false }); // Base scenario first

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!project,
  });

  // Set default scenario to base case when scenarios are loaded
  useEffect(() => {
    if (scenarios && scenarios.length > 0 && !selectedScenarioId) {
      const baseScenario = scenarios.find(s => s.is_base) || scenarios[0];
      setSelectedScenarioId(baseScenario.id);
    }
  }, [scenarios, selectedScenarioId]);

  const selectedScenario = scenarios?.find(s => s.id === selectedScenarioId) || null;
  const totalAssets = assets?.length || 0;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (error || !project || !project.is_public) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Project not available</h2>
            <p className="text-muted-foreground">
              This project is not publicly accessible or doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Public Showcase Header */}
      <Alert className="mb-6">
        <Globe className="h-4 w-4" />
        <AlertDescription>
          <strong>Public Showcase</strong> - This is a read-only view of this project.
        </AlertDescription>
      </Alert>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        <p className="text-muted-foreground text-lg">
          {project.description || "No description provided"}
        </p>
      </div>

      {/* Scenario Selector */}
      {id && scenarios && scenarios.length > 0 && (
        <div className="mb-6">
          <ReadOnlyScenarioSelector 
            projectId={id}
            selectedScenarioId={selectedScenarioId}
            onScenarioChange={setSelectedScenarioId}
          />
        </div>
      )}

      {/* Financial Summary Cards */}
      {assets && assets.length > 0 && (
        <div className="mb-6">
          <FinancialSummaryCards 
            projectId={id || ""}
            selectedScenarioId={selectedScenarioId}
            assets={assets}
          />
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              {totalAssets === 0 ? "No assets" : `${totalAssets} asset${totalAssets === 1 ? "" : "s"} in project`}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Timeline</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.start_date && project.end_date
                ? `${Math.ceil(
                    (new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) /
                    (1000 * 60 * 60 * 24 * 30)
                  )} months`
                : "Not set"
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDate(project.start_date)} - {formatDate(project.end_date)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full min-w-fit grid-cols-2 md:w-full">
            <TabsTrigger value="overview" className="whitespace-nowrap">Overview</TabsTrigger>
            <TabsTrigger value="assets" className="whitespace-nowrap">Assets</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Project Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Project Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project Name</label>
                  <p className="text-lg">{project.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm">{project.description || "No description provided"}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                    <p className="text-sm">{formatDate(project.start_date)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">End Date</label>
                    <p className="text-sm">{formatDate(project.end_date)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scenario Information */}
            {selectedScenario && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Scenario</CardTitle>
                  <CardDescription>Financial scenario being viewed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Scenario Name</label>
                    <p className="text-lg">{selectedScenario.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <Badge variant={selectedScenario.is_base ? "default" : "secondary"}>
                      {selectedScenario.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assets</CardTitle>
              <CardDescription>Project assets with current scenario values</CardDescription>
            </CardHeader>
            <CardContent>
              {assets && assets.length > 0 ? (
                <div className="space-y-4">
                  {/* Desktop Table - hidden on mobile */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Name</th>
                          <th className="text-left p-2 font-medium">Type</th>
                          <th className="text-right p-2 font-medium">GFA (sqm)</th>
                          <th className="text-right p-2 font-medium">Construction Cost</th>
                          <th className="text-right p-2 font-medium">Annual Revenue</th>
                          <th className="text-right p-2 font-medium">Occupancy %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assets.map((asset) => (
                          <tr key={asset.id} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-medium">{asset.name}</td>
                            <td className="p-2">
                              <Badge variant="outline">{asset.type}</Badge>
                            </td>
                            <td className="p-2 text-right">{asset.gfa_sqm.toLocaleString()}</td>
                            <td className="p-2 text-right">{formatCurrency(asset.construction_cost_aed)}</td>
                            <td className="p-2 text-right">{formatCurrency(asset.annual_revenue_potential_aed)}</td>
                            <td className="p-2 text-right">{asset.occupancy_rate_percent}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards - hidden on desktop */}
                  <div className="md:hidden space-y-4">
                    {assets.map((asset) => (
                      <Card key={asset.id} className="shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-lg">{asset.name}</h3>
                              <Badge variant="outline" className="mt-1">{asset.type}</Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">GFA:</span>
                              <div className="font-medium">{asset.gfa_sqm.toLocaleString()} sqm</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Occupancy:</span>
                              <div className="font-medium">{asset.occupancy_rate_percent}%</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Construction Cost:</span>
                              <div className="font-medium">{formatCurrency(asset.construction_cost_aed)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Annual Revenue:</span>
                              <div className="font-medium">{formatCurrency(asset.annual_revenue_potential_aed)}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Assets</h3>
                  <p className="text-muted-foreground">This project doesn't have any assets yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectPublic;