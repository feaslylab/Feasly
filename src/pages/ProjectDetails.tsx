import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ArrowLeft, Plus, Building2, TrendingUp, Calendar, FileText, Download } from "lucide-react";
import * as XLSX from "xlsx";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { AddAssetForm } from "@/components/assets/AddAssetForm";
import { AssetsList } from "@/components/assets/AssetsList";
import { ScenarioSelector } from "@/components/scenarios/ScenarioSelector";
import { FinancialSummaryCards } from "@/components/financial/FinancialSummaryCards";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Project {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
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

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      if (!id || !user) return null;
      
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data as Project;
    },
    enabled: !!id && !!user,
  });

  const { data: assets } = useQuery({
    queryKey: ["assets", id],
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
    enabled: !!id,
  });

  const { data: scenarios } = useQuery({
    queryKey: ["scenarios", id],
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
    enabled: !!id,
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
  const totalValue = assets?.reduce((sum, asset) => sum + asset.construction_cost_aed, 0) || 0;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-10 w-32 mb-4" />
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

  if (error || !project) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/projects")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Project not found</h2>
            <p className="text-muted-foreground">
              The project you're looking for doesn't exist or you don't have access to it.
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

  const exportToExcel = async () => {
    if (!project || !selectedScenario || !assets) return;

    // Fetch scenario overrides for the selected scenario
    const { data: overrides } = await supabase
      .from("scenario_asset_overrides")
      .select("*")
      .eq("scenario_id", selectedScenarioId);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Prepare data for export
    const excelData = assets.map(asset => {
      // Find override values for this asset in the selected scenario
      const override = overrides?.find(o => o.asset_id === asset.id);
      
      return {
        "Asset Name": asset.name,
        "Type": asset.type,
        "GFA (sqm)": override?.gfa_sqm || asset.gfa_sqm,
        "Construction Cost (AED)": override?.construction_cost_aed || asset.construction_cost_aed,
        "Annual Revenue Potential (AED)": override?.annual_revenue_potential_aed || asset.annual_revenue_potential_aed,
        "Annual Operating Cost (AED)": override?.annual_operating_cost_aed || asset.annual_operating_cost_aed,
        "Occupancy Rate (%)": override?.occupancy_rate_percent || asset.occupancy_rate_percent,
        "Cap Rate (%)": override?.cap_rate_percent || asset.cap_rate_percent,
        "Development Timeline (months)": override?.development_timeline_months || asset.development_timeline_months,
        "Stabilization Period (months)": override?.stabilization_period_months || asset.stabilization_period_months,
      };
    });

    // Add project and scenario information at the top
    const headerData = [
      { "Asset Name": "Project:", "Type": project.name },
      { "Asset Name": "Scenario:", "Type": selectedScenario.name },
      { "Asset Name": "", "Type": "" }, // Empty row
    ];

    const finalData = [...headerData, ...excelData];

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(finalData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assets Export");

    // Generate filename
    const filename = `${project.name}-${selectedScenario.name}.xlsx`;

    // Save file
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/projects")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            <p className="text-muted-foreground text-lg">
              {project.description || "No description provided"}
            </p>
          </div>
          <div className="flex gap-3">
            {selectedScenario && assets && assets.length > 0 && (
              <Button
                variant="outline"
                onClick={exportToExcel}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export to Excel
              </Button>
            )}
            {id && <AddAssetForm projectId={id} />}
          </div>
        </div>
      </div>

      {/* Scenario Selector */}
      {id && scenarios && scenarios.length > 0 && (
        <div className="mb-6">
          <ScenarioSelector 
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

      {/* Legacy Summary Cards (keeping for assets count and project timeline) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              {totalAssets === 0 ? "No assets added yet" : `${totalAssets} asset${totalAssets === 1 ? "" : "s"} in project`}
            </p>
          </CardContent>
        </Card>

        <Card>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">{formatDate(project.created_at)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your project efficiently</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {id && (
                  <AddAssetForm 
                    projectId={id} 
                    trigger={
                      <Button className="w-full justify-start" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Asset
                      </Button>
                    } 
                  />
                )}
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Financial Model
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Assets</CardTitle>
                <CardDescription>Manage project assets and their financial details</CardDescription>
              </div>
              {id && <AddAssetForm projectId={id} />}
            </CardHeader>
            <CardContent>
              {id && <AssetsList projectId={id} selectedScenarioId={selectedScenarioId} selectedScenario={selectedScenario} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Scenarios</CardTitle>
              <CardDescription>Compare different financial outcomes for your project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Base Case</CardTitle>
                      <Badge variant="secondary">Default</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Conservative estimates based on market data
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>ROI:</span>
                        <span className="font-medium">-</span>
                      </div>
                      <div className="flex justify-between">
                        <span>NPV:</span>
                        <span className="font-medium">-</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Optimistic</CardTitle>
                      <Badge variant="default" className="bg-green-100 text-green-800">Best Case</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Favorable market conditions and performance
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>ROI:</span>
                        <span className="font-medium">-</span>
                      </div>
                      <div className="flex justify-between">
                        <span>NPV:</span>
                        <span className="font-medium">-</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Pessimistic</CardTitle>
                      <Badge variant="destructive">Worst Case</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Conservative estimates with risk factors
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>ROI:</span>
                        <span className="font-medium">-</span>
                      </div>
                      <div className="flex justify-between">
                        <span>NPV:</span>
                        <span className="font-medium">-</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Analytics</CardTitle>
              <CardDescription>Detailed analysis and projections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Add assets to see detailed financial analytics and projections
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetails;