import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ArrowLeft, Plus, Building2, TrendingUp, Calendar, FileText, Download, FileDown, Copy, Link, Globe } from "lucide-react";
import * as XLSX from "xlsx";
import { calculateFinancialMetrics } from "@/lib/financialCalculations";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { AddAssetForm } from "@/components/assets/AddAssetForm";
import { AssetsList } from "@/components/assets/AssetsList";
import { ScenarioSelector } from "@/components/scenarios/ScenarioSelector";
import { FinancialSummaryCards } from "@/components/financial/FinancialSummaryCards";
import { ProjectTeam } from "@/components/projects/ProjectTeam";
import { ProjectAnalytics } from "@/components/projects/ProjectAnalytics";
import { ExportHistory } from "@/components/projects/ExportHistory";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

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

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [userRole, setUserRole] = useState<'Owner' | 'Editor' | 'Viewer' | null>(null);

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

  // Fetch user's role for this project
  const { data: userRoleData } = useQuery({
    queryKey: ["user-project-role", id, user?.id],
    queryFn: async () => {
      if (!id || !user) return null;
      
      // Check if user is the project owner
      if (project && project.user_id === user.id) {
        return { role: 'Owner' as const };
      }

      // Check project_team table for role
      const { data, error } = await supabase
        .from("project_team")
        .select("role")
        .eq("project_id", id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        // User is not in project_team table and not owner
        return null;
      }

      return { role: data.role as 'Owner' | 'Editor' | 'Viewer' };
    },
    enabled: !!id && !!user && !!project,
  });

  // Update user role when data changes
  useEffect(() => {
    if (userRoleData) {
      setUserRole(userRoleData.role);
    } else if (project && user && project.user_id === user.id) {
      setUserRole('Owner');
    } else {
      setUserRole(null);
    }
  }, [userRoleData, project, user]);

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

  // Permission helpers
  const canEdit = userRole === 'Owner' || userRole === 'Editor';
  const canManageTeam = userRole === 'Owner';
  const canExport = userRole === 'Owner' || userRole === 'Editor';
  const canDuplicate = userRole === 'Owner';
  const hasAccess = userRole !== null;
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
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
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

  // Check access permissions
  if (!hasAccess && !isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to view this project.
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
      .from("scenario_overrides")
      .select("*")
      .eq("scenario_id", selectedScenarioId);

    // Calculate financial metrics using the same logic as summary cards
    const metrics = calculateFinancialMetrics(assets, overrides || []);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // === Assets Data Worksheet ===
    const excelData = assets.map(asset => {
      // Find override values for this asset in the selected scenario
      const getOverrideValue = (fieldName: string) => {
        const override = overrides?.find(o => o.asset_id === asset.id && o.field_name === fieldName);
        return override ? override.override_value : null;
      };
      
      return {
        "Asset Name": asset.name,
        "Type": asset.type,
        "GFA (sqm)": getOverrideValue('gfa_sqm') || asset.gfa_sqm,
        "Construction Cost (AED)": getOverrideValue('construction_cost_aed') || asset.construction_cost_aed,
        "Annual Revenue Potential (AED)": getOverrideValue('annual_revenue_potential_aed') || asset.annual_revenue_potential_aed,
        "Annual Operating Cost (AED)": getOverrideValue('annual_operating_cost_aed') || asset.annual_operating_cost_aed,
        "Occupancy Rate (%)": getOverrideValue('occupancy_rate_percent') || asset.occupancy_rate_percent,
        "Cap Rate (%)": getOverrideValue('cap_rate_percent') || asset.cap_rate_percent,
        "Development Timeline (months)": getOverrideValue('development_timeline_months') || asset.development_timeline_months,
        "Stabilization Period (months)": getOverrideValue('stabilization_period_months') || asset.stabilization_period_months,
      };
    });

    // Add project and scenario information at the top
    const headerData = [
      { "Asset Name": "Project:", "Type": project.name },
      { "Asset Name": "Scenario:", "Type": selectedScenario.name },
      { "Asset Name": "", "Type": "" }, // Empty row
    ];

    const finalData = [...headerData, ...excelData];

    // Create Assets worksheet
    const assetsWorksheet = XLSX.utils.json_to_sheet(finalData);
    XLSX.utils.book_append_sheet(workbook, assetsWorksheet, "Assets");

    // === Summary Worksheet ===
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const formatPercentage = (value: number) => {
      return `${value.toFixed(1)}%`;
    };

    const formatYears = (years: number) => {
      if (years < 0) return "No payback";
      if (years > 10) return ">10 years";
      return `${years.toFixed(1)} years`;
    };

    const projectDurationMonths = project.start_date && project.end_date
      ? Math.ceil((new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))
      : 0;

    const summaryData = [
      { "Metric": "Project Name", "Value": project.name },
      { "Metric": "Scenario Name", "Value": selectedScenario.name },
      { "Metric": "", "Value": "" }, // Empty row
      { "Metric": "Total Construction Cost (AED)", "Value": formatCurrency(metrics.totalConstructionCost) },
      { "Metric": "Total Annual Revenue (AED)", "Value": formatCurrency(metrics.totalRevenue) },
      { "Metric": "Total Annual Operating Cost (AED)", "Value": formatCurrency(metrics.totalOperatingCost) },
      { "Metric": "Profit Margin (%)", "Value": formatPercentage(metrics.profitMargin) },
      { "Metric": "IRR (%)", "Value": formatPercentage(metrics.irr) },
      { "Metric": "Payback Period (years)", "Value": formatYears(metrics.paybackPeriod) },
      { "Metric": "Number of Assets", "Value": assets.length.toString() },
      { "Metric": "Project Duration (months)", "Value": projectDurationMonths > 0 ? projectDurationMonths.toString() : "Not set" },
    ];

    // Create Summary worksheet
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");

    // Generate filename
    const filename = `${project.name}-${selectedScenario.name}.xlsx`;

    // Save file
    XLSX.writeFile(workbook, filename);

    // Track export in history
    await trackExportHistory(project.id, selectedScenarioId, 'excel', filename);
  };

  const downloadPDFReport = async () => {
    if (!project || !selectedScenario || !assets) return;

    // Fetch scenario overrides for the selected scenario
    const { data: overrides } = await supabase
      .from("scenario_overrides")
      .select("*")
      .eq("scenario_id", selectedScenarioId);

    // Calculate financial metrics using the same logic as summary cards
    const metrics = calculateFinancialMetrics(assets, overrides || []);

    // Create PDF document
    const doc = new jsPDF();
    
    // Set font
    doc.setFont("helvetica");
    
    // Title
    doc.setFontSize(20);
    doc.text("Project Financial Report", 20, 30);
    
    // Project and Scenario Info
    doc.setFontSize(14);
    doc.text(`Project: ${project.name}`, 20, 50);
    doc.text(`Scenario: ${selectedScenario.name}`, 20, 65);
    
    // Financial Summary Section
    doc.setFontSize(16);
    doc.text("Financial Summary", 20, 90);
    
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const formatPercentage = (value: number) => {
      return `${value.toFixed(1)}%`;
    };

    const formatYears = (years: number) => {
      if (years < 0) return "No payback";
      if (years > 10) return ">10 years";
      return `${years.toFixed(1)} years`;
    };

    const projectDurationMonths = project.start_date && project.end_date
      ? Math.ceil((new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))
      : 0;

    // Financial Summary Table
    const summaryData = [
      ["Total Construction Cost", formatCurrency(metrics.totalConstructionCost)],
      ["Total Annual Revenue", formatCurrency(metrics.totalRevenue)],
      ["Total Annual Operating Cost", formatCurrency(metrics.totalOperatingCost)],
      ["Profit Margin", formatPercentage(metrics.profitMargin)],
      ["IRR (10-year)", formatPercentage(metrics.irr)],
      ["Payback Period", formatYears(metrics.paybackPeriod)],
      ["Number of Assets", assets.length.toString()],
      ["Project Duration", projectDurationMonths > 0 ? `${projectDurationMonths} months` : "Not set"],
    ];

    autoTable(doc, {
      startY: 100,
      head: [["Metric", "Value"]],
      body: summaryData,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 20, right: 20 },
    });

    // Assets Section
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(16);
    doc.text("Assets Details", 20, finalY + 30);

    // Prepare assets data with scenario overrides
    const assetsTableData = assets.map(asset => {
      const getOverrideValue = (fieldName: string) => {
        const override = overrides?.find(o => o.asset_id === asset.id && o.field_name === fieldName);
        return override ? override.override_value : null;
      };

      return [
        asset.name,
        asset.type,
        (getOverrideValue('gfa_sqm') || asset.gfa_sqm).toLocaleString(),
        formatCurrency(getOverrideValue('construction_cost_aed') || asset.construction_cost_aed),
        formatCurrency(getOverrideValue('annual_revenue_potential_aed') || asset.annual_revenue_potential_aed),
        formatCurrency(getOverrideValue('annual_operating_cost_aed') || asset.annual_operating_cost_aed),
        `${getOverrideValue('occupancy_rate_percent') || asset.occupancy_rate_percent}%`,
        `${getOverrideValue('cap_rate_percent') || asset.cap_rate_percent}%`,
      ];
    });

    autoTable(doc, {
      startY: finalY + 40,
      head: [["Asset Name", "Type", "GFA (sqm)", "Construction Cost", "Revenue Potential", "Operating Cost", "Occupancy %", "Cap Rate %"]],
      body: assetsTableData,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 15 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 15 },
        7: { cellWidth: 15 },
      },
    });

    // Generate filename and save
    const filename = `${project.name}-${selectedScenario.name}.pdf`;
    doc.save(filename);

    // Track export in history
    await trackExportHistory(project.id, selectedScenarioId, 'pdf', filename);
  };

  const duplicateProject = async () => {
    if (!project || !newProjectName.trim() || !user) return;

    try {
      setIsDuplicating(true);

      // Step 1: Create new project
      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert({
          name: newProjectName.trim(),
          description: project.description,
          start_date: project.start_date,
          end_date: project.end_date,
          user_id: user.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Step 2: Clone all assets and create mapping
      const assetMapping = new Map<string, string>(); // old asset ID -> new asset ID

      if (assets && assets.length > 0) {
        const assetsToClone = assets.map(asset => ({
          project_id: newProject.id,
          name: asset.name,
          type: asset.type,
          gfa_sqm: asset.gfa_sqm,
          construction_cost_aed: asset.construction_cost_aed,
          annual_operating_cost_aed: asset.annual_operating_cost_aed,
          annual_revenue_potential_aed: asset.annual_revenue_potential_aed,
          occupancy_rate_percent: asset.occupancy_rate_percent,
          cap_rate_percent: asset.cap_rate_percent,
          development_timeline_months: asset.development_timeline_months,
          stabilization_period_months: asset.stabilization_period_months,
        }));

        const { data: newAssets, error: assetsError } = await supabase
          .from("assets")
          .insert(assetsToClone)
          .select();

        if (assetsError) throw assetsError;

        // Create asset mapping
        assets.forEach((oldAsset, index) => {
          if (newAssets && newAssets[index]) {
            assetMapping.set(oldAsset.id, newAssets[index].id);
          }
        });
      }

      // Step 3: Clone all scenarios and create mapping
      const scenarioMapping = new Map<string, string>(); // old scenario ID -> new scenario ID

      if (scenarios && scenarios.length > 0) {
        const scenariosToClone = scenarios.map(scenario => ({
          project_id: newProject.id,
          name: scenario.name,
          type: scenario.type,
          is_base: scenario.is_base,
        }));

        const { data: newScenarios, error: scenariosError } = await supabase
          .from("scenarios")
          .insert(scenariosToClone)
          .select();

        if (scenariosError) throw scenariosError;

        // Create scenario mapping
        scenarios.forEach((oldScenario, index) => {
          if (newScenarios && newScenarios[index]) {
            scenarioMapping.set(oldScenario.id, newScenarios[index].id);
          }
        });
      }

      // Step 4: Clone all scenario overrides with proper mappings
      if (scenarioMapping.size > 0 && assetMapping.size > 0) {
        // Get all overrides for all scenarios in the original project
        const { data: allOverrides, error: overridesError } = await supabase
          .from("scenario_overrides")
          .select("*")
          .in("scenario_id", Array.from(scenarioMapping.keys()));

        if (overridesError) throw overridesError;

        if (allOverrides && allOverrides.length > 0) {
          const overridesToClone = allOverrides
            .filter(override => 
              scenarioMapping.has(override.scenario_id) && 
              assetMapping.has(override.asset_id)
            )
            .map(override => ({
              scenario_id: scenarioMapping.get(override.scenario_id)!,
              asset_id: assetMapping.get(override.asset_id)!,
              field_name: override.field_name,
              override_value: override.override_value,
            }));

          if (overridesToClone.length > 0) {
            const { error: insertOverridesError } = await supabase
              .from("scenario_overrides")
              .insert(overridesToClone);

            if (insertOverridesError) throw insertOverridesError;
          }
        }
      }

      // Success - show toast and redirect to new project
      toast({
        title: "Project Duplicated",
        description: `"${newProjectName}" has been created successfully.`,
      });

      // Reset dialog state
      setIsDuplicateDialogOpen(false);
      setNewProjectName("");

      // Redirect to new project
      navigate(`/projects/${newProject.id}`);

    } catch (error) {
      console.error("Error duplicating project:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDuplicateClick = () => {
    setNewProjectName(`${project.name} Copy`);
    setIsDuplicateDialogOpen(true);
  };

  const copyShareableLink = async () => {
    if (!id) return;

    const shareableUrl = `${window.location.origin}/projects/${id}/view`;
    
    try {
      await navigator.clipboard.writeText(shareableUrl);
      toast({
        title: "Link Copied",
        description: "Anyone with access can view this project in read-only mode.",
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = shareableUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      
      toast({
        title: "Link Copied",
        description: "Anyone with access can view this project in read-only mode.",
      });
    }
  };

  const copyPublicLink = async () => {
    if (!id) return;

    const publicUrl = `${window.location.origin}/projects/${id}/public`;
    
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast({
        title: "Public Link Copied",
        description: "Anyone can view this project showcase without logging in.",
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = publicUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      
      toast({
        title: "Public Link Copied",
        description: "Anyone can view this project showcase without logging in.",
      });
    }
  };

  const togglePublicShowcase = async (isPublic: boolean) => {
    if (!project || !canManageTeam) return;

    try {
      const { error } = await supabase
        .from("projects")
        .update({ is_public: isPublic })
        .eq("id", project.id);

      if (error) throw error;

      // Refresh project data
      await queryClient.invalidateQueries({ queryKey: ["project", id] });

      toast({
        title: isPublic ? "Project Made Public" : "Project Made Private",
        description: isPublic 
          ? "Your project is now publicly accessible via the showcase link."
          : "Your project is no longer publicly accessible.",
      });

    } catch (error) {
      console.error("Error updating project visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update project visibility. Please try again.",
        variant: "destructive",
      });
    }
  };

  const trackExportHistory = async (projectId: string, scenarioId: string | null, exportType: 'pdf' | 'excel', filename: string) => {
    if (!user || !scenarioId) return;

    try {
      const { error } = await supabase
        .from('export_history')
        .insert({
          project_id: projectId,
          user_id: user.id,
          scenario_id: scenarioId,
          export_type: exportType,
          filename: filename,
        });

      if (error) {
        console.error('Error tracking export history:', error);
        // Don't show error to user as this is background tracking
      }
    } catch (error) {
      console.error('Error tracking export history:', error);
      // Don't show error to user as this is background tracking
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            <p className="text-muted-foreground text-lg">
              {project.description || "No description provided"}
            </p>
          </div>
          <div className="flex gap-3">
            {canDuplicate && (
              <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleDuplicateClick}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Duplicate Project</DialogTitle>
                    <DialogDescription>
                      Create a copy of this project with all its assets, scenarios, and override values.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="project-name">New Project Name</Label>
                      <Input
                        id="project-name"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Enter project name"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDuplicateDialogOpen(false)}
                      disabled={isDuplicating}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={duplicateProject}
                      disabled={!newProjectName.trim() || isDuplicating}
                    >
                      {isDuplicating ? "Duplicating..." : "Duplicate Project"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            {canEdit && (
              <Button
                variant="outline"
                onClick={copyShareableLink}
                className="flex items-center gap-2"
              >
                <Link className="w-4 h-4" />
                Copy Shareable Link
              </Button>
            )}
            {canManageTeam && project.is_public && (
              <Button
                variant="outline"
                onClick={copyPublicLink}
                className="flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                Copy Public Link
              </Button>
            )}
            {canExport && selectedScenario && assets && assets.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={downloadPDFReport}
                  className="flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={exportToExcel}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export to Excel
                </Button>
              </>
            )}
            {canEdit && id && <AddAssetForm projectId={id} />}
          </div>
        </div>
      </div>

      {/* Public Showcase Toggle */}
      {canManageTeam && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Public Showcase
            </CardTitle>
            <CardDescription>
              Make your project publicly accessible without requiring login
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="public-toggle" className="text-base">
                  Enable Public Access
                </Label>
                <div className="text-sm text-muted-foreground">
                  {project.is_public 
                    ? "Anyone can view this project without logging in"
                    : "Project is private and requires team access"
                  }
                </div>
              </div>
              <Switch
                id="public-toggle"
                checked={project.is_public}
                onCheckedChange={togglePublicShowcase}
              />
            </div>
          </CardContent>
        </Card>
      )}

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
        <TabsList className={`grid w-full ${canManageTeam ? 'grid-cols-5' : 'grid-cols-4'}`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          {canManageTeam && <TabsTrigger value="team">Team</TabsTrigger>}
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
                {canEdit && id && (
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
                {canEdit && (
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Financial Model
                </Button>
                )}
                {canEdit && (
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                )}
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
              {canEdit && id && <AddAssetForm projectId={id} />}
            </CardHeader>
            <CardContent>
              {id && <AssetsList projectId={id} selectedScenarioId={selectedScenarioId} selectedScenario={selectedScenario} canEdit={canEdit} />}
            </CardContent>
          </Card>
        </TabsContent>

        {canManageTeam && (
          <TabsContent value="team" className="space-y-6">
            <ProjectTeam projectId={id || ""} projectOwnerId={project.user_id} userRole={userRole} />
          </TabsContent>
        )}

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
          {assets && assets.length > 0 ? (
            <ProjectAnalytics projectId={id || ""} assets={assets} />
          ) : (
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
          )}
        </TabsContent>

        {/* Export History Section - Only visible to Owners and Editors */}
        {canExport && (
          <div className="mt-6">
            <ExportHistory projectId={id || ""} />
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default ProjectDetails;