import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart3, Download, Building2, TrendingUp, DollarSign, Target, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Project data interface
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
  status: 'planning' | 'development' | 'construction' | 'completed';
  currency: string;
  createdAt: string;
}

// Dummy project data (for demonstration)
const dummyProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'Marina Towers',
    totalGFA: 45000,
    constructionCost: 180000000,
    estimatedRevenue: 270000000,
    irr: 18.5,
    roi: 50.0,
    profitMargin: 33.3,
    netProfit: 90000000,
    status: 'development',
    currency: 'AED',
    createdAt: '2024-01-15'
  },
  {
    id: 'proj-002',
    name: 'City Center Mall',
    totalGFA: 80000,
    constructionCost: 320000000,
    estimatedRevenue: 400000000,
    irr: 15.2,
    roi: 25.0,
    profitMargin: 20.0,
    netProfit: 80000000,
    status: 'planning',
    currency: 'AED',
    createdAt: '2024-02-10'
  },
  {
    id: 'proj-003',
    name: 'Residential Complex A',
    totalGFA: 35000,
    constructionCost: 140000000,
    estimatedRevenue: 210000000,
    irr: 22.1,
    roi: 50.0,
    profitMargin: 33.3,
    netProfit: 70000000,
    status: 'construction',
    currency: 'AED',
    createdAt: '2024-03-05'
  },
  {
    id: 'proj-004',
    name: 'Office Tower Downtown',
    totalGFA: 25000,
    constructionCost: 100000000,
    estimatedRevenue: 130000000,
    irr: 12.8,
    roi: 30.0,
    profitMargin: 23.1,
    netProfit: 30000000,
    status: 'development',
    currency: 'AED',
    createdAt: '2024-01-20'
  },
  {
    id: 'proj-005',
    name: 'Luxury Villas Phase 1',
    totalGFA: 15000,
    constructionCost: 75000000,
    estimatedRevenue: 120000000,
    irr: 25.3,
    roi: 60.0,
    profitMargin: 37.5,
    netProfit: 45000000,
    status: 'completed',
    currency: 'AED',
    createdAt: '2023-12-01'
  },
];

export default function FeaslyConsolidate() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

  // Load projects from localStorage or use dummy data
  useEffect(() => {
    try {
      // Try to load from localStorage first
      const storedProjects = localStorage.getItem('feasly_projects');
      if (storedProjects) {
        const parsed = JSON.parse(storedProjects);
        setProjects(parsed);
      } else {
        // Use dummy data if no stored projects
        setProjects(dummyProjects);
        // Also check for individual project data
        const individualProject = localStorage.getItem('feasly_model_data');
        if (individualProject) {
          try {
            const projectData = JSON.parse(individualProject);
            const newProject: Project = {
              id: 'imported-' + Date.now(),
              name: projectData.project_name || 'Imported Project',
              totalGFA: projectData.total_gfa_sqm || 0,
              constructionCost: projectData.construction_cost || 0,
              estimatedRevenue: projectData.estimated_revenue || 0,
              irr: projectData.target_irr || 0,
              roi: projectData.target_roi || 0,
              profitMargin: projectData.profit_margin || 0,
              netProfit: (projectData.estimated_revenue || 0) - (projectData.construction_cost || 0),
              status: 'planning',
              currency: projectData.currency_code || 'AED',
              createdAt: new Date().toISOString(),
            };
            setProjects(prev => [...prev, newProject]);
          } catch (error) {
            console.error('Error parsing individual project data:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects(dummyProjects);
    }
  }, []);

  // Handle project selection
  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedProjects.size === projects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(projects.map(p => p.id)));
    }
  };

  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    const selectedProjectsList = projects.filter(p => selectedProjects.has(p.id));
    
    if (selectedProjectsList.length === 0) {
      return {
        totalProjects: 0,
        totalGFA: 0,
        totalConstructionCost: 0,
        totalEstimatedRevenue: 0,
        averageIRR: 0,
        portfolioProfitMargin: 0,
        totalNetProfit: 0,
      };
    }

    const totalGFA = selectedProjectsList.reduce((sum, p) => sum + p.totalGFA, 0);
    const totalConstructionCost = selectedProjectsList.reduce((sum, p) => sum + p.constructionCost, 0);
    const totalEstimatedRevenue = selectedProjectsList.reduce((sum, p) => sum + p.estimatedRevenue, 0);
    const totalNetProfit = selectedProjectsList.reduce((sum, p) => sum + p.netProfit, 0);
    
    // Weighted average IRR by construction cost
    const weightedIRR = selectedProjectsList.reduce((sum, p) => sum + (p.irr * p.constructionCost), 0) / totalConstructionCost;
    const portfolioProfitMargin = totalEstimatedRevenue > 0 ? (totalNetProfit / totalEstimatedRevenue) * 100 : 0;

    return {
      totalProjects: selectedProjectsList.length,
      totalGFA,
      totalConstructionCost,
      totalEstimatedRevenue,
      averageIRR: isNaN(weightedIRR) ? 0 : weightedIRR,
      portfolioProfitMargin,
      totalNetProfit,
    };
  }, [projects, selectedProjects]);

  // Get IRR status color
  const getIRRStatusColor = (irr: number) => {
    if (irr >= 20) return 'bg-green-100 text-green-800';
    if (irr >= 15) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getIRRStatusText = (irr: number) => {
    if (irr >= 20) return t('feasly.consolidate.high_performance');
    if (irr >= 15) return t('feasly.consolidate.moderate_performance');
    return t('feasly.consolidate.low_performance');
  };

  // Export functionality (mock)
  const handleExport = () => {
    const selectedProjectsList = projects.filter(p => selectedProjects.has(p.id));
    
    if (selectedProjectsList.length === 0) {
      toast({
        title: t('feasly.consolidate.export_error'),
        description: t('feasly.consolidate.no_projects_selected'),
        variant: "destructive",
      });
      return;
    }

    // Mock export functionality
    console.log('Exporting projects:', selectedProjectsList);
    console.log('Portfolio metrics:', portfolioMetrics);

    toast({
      title: t('feasly.consolidate.export_success'),
      description: t('feasly.consolidate.export_success_desc'),
    });
  };

  const getStatusBadge = (status: Project['status']) => {
    const variants = {
      planning: 'secondary',
      development: 'default',
      construction: 'outline',
      completed: 'secondary',
    } as const;

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {t(`feasly.consolidate.status_${status}`)}
      </Badge>
    );
  };

  return (
    <div className={cn("p-8 max-w-7xl mx-auto", isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          {t('feasly.consolidate.title')}
        </h1>
        <p className="text-muted-foreground">{t('feasly.consolidate.description')}</p>
      </div>

      <div className="grid gap-8">
        
        {/* 1. Project Import Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {t('feasly.consolidate.project_portfolio')}
                </CardTitle>
                <CardDescription>{t('feasly.consolidate.project_portfolio_desc')}</CardDescription>
              </div>
              <Button onClick={handleExport} disabled={selectedProjects.size === 0}>
                <Download className="mr-2 h-4 w-4" />
                {t('feasly.consolidate.export')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedProjects.size === projects.length && projects.length > 0}
                        onCheckedChange={toggleSelectAll}
                        aria-label={t('feasly.consolidate.select_all')}
                      />
                    </TableHead>
                    <TableHead>{t('feasly.consolidate.project_name')}</TableHead>
                    <TableHead>{t('feasly.consolidate.total_gfa')}</TableHead>
                    <TableHead>{t('feasly.consolidate.construction_cost')}</TableHead>
                    <TableHead>{t('feasly.consolidate.estimated_revenue')}</TableHead>
                    <TableHead>{t('feasly.consolidate.irr')}</TableHead>
                    <TableHead>{t('feasly.consolidate.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow 
                      key={project.id}
                      className={cn(
                        "cursor-pointer hover:bg-muted/50",
                        selectedProjects.has(project.id) && "bg-muted"
                      )}
                      onClick={() => toggleProjectSelection(project.id)}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedProjects.has(project.id)}
                          onCheckedChange={() => toggleProjectSelection(project.id)}
                          aria-label={`Select ${project.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.totalGFA.toLocaleString()} sqm</TableCell>
                      <TableCell>{project.currency} {project.constructionCost.toLocaleString()}</TableCell>
                      <TableCell>{project.currency} {project.estimatedRevenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{project.irr.toFixed(1)}%</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className={cn("w-2 h-2 rounded-full", getIRRStatusColor(project.irr))} />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getIRRStatusText(project.irr)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 2. Portfolio Summary Panel */}
        {selectedProjects.size > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t('feasly.consolidate.portfolio_summary')}
              </CardTitle>
              <CardDescription>{t('feasly.consolidate.portfolio_summary_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('feasly.consolidate.total_projects')}</p>
                  <p className="text-2xl font-bold">{portfolioMetrics.totalProjects}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('feasly.consolidate.total_gfa')}</p>
                  <p className="text-2xl font-bold">{portfolioMetrics.totalGFA.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">sqm</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('feasly.consolidate.total_cost')}</p>
                  <p className="text-2xl font-bold">AED {portfolioMetrics.totalConstructionCost.toLocaleString()}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('feasly.consolidate.total_revenue')}</p>
                  <p className="text-2xl font-bold">AED {portfolioMetrics.totalEstimatedRevenue.toLocaleString()}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('feasly.consolidate.average_irr')}</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    portfolioMetrics.averageIRR >= 20 ? "text-green-600" :
                    portfolioMetrics.averageIRR >= 15 ? "text-yellow-600" : "text-red-600"
                  )}>
                    {portfolioMetrics.averageIRR.toFixed(1)}%
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('feasly.consolidate.profit_margin')}</p>
                  <p className="text-2xl font-bold">{portfolioMetrics.portfolioProfitMargin.toFixed(1)}%</p>
                </div>
                
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('feasly.consolidate.total_net_profit')}</span>
                  <span className={cn(
                    "text-lg font-bold",
                    portfolioMetrics.totalNetProfit >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    AED {portfolioMetrics.totalNetProfit.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3. KPI Comparison Table */}
        {selectedProjects.size > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('feasly.consolidate.kpi_comparison')}
              </CardTitle>
              <CardDescription>{t('feasly.consolidate.kpi_comparison_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('feasly.consolidate.project')}</TableHead>
                      <TableHead>{t('feasly.consolidate.irr')}</TableHead>
                      <TableHead>{t('feasly.consolidate.roi')}</TableHead>
                      <TableHead>{t('feasly.consolidate.profit_margin')}</TableHead>
                      <TableHead>{t('feasly.consolidate.revenue')}</TableHead>
                      <TableHead>{t('feasly.consolidate.cost')}</TableHead>
                      <TableHead>{t('feasly.consolidate.net_profit')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects
                      .filter(p => selectedProjects.has(p.id))
                      .sort((a, b) => b.irr - a.irr)
                      .map((project) => (
                        <TableRow 
                          key={project.id}
                          className={cn(
                            "hover:bg-muted/50",
                            getIRRStatusColor(project.irr).replace('text-', 'border-l-4 border-l-')
                          )}
                        >
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>
                            <span className={cn(
                              "font-medium",
                              project.irr >= 20 ? "text-green-600" :
                              project.irr >= 15 ? "text-yellow-600" : "text-red-600"
                            )}>
                              {project.irr.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell>{project.roi.toFixed(1)}%</TableCell>
                          <TableCell>{project.profitMargin.toFixed(1)}%</TableCell>
                          <TableCell>{project.currency} {project.estimatedRevenue.toLocaleString()}</TableCell>
                          <TableCell>{project.currency} {project.constructionCost.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={cn(
                              "font-medium",
                              project.netProfit >= 0 ? "text-green-600" : "text-red-600"
                            )}>
                              {project.currency} {project.netProfit.toLocaleString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {projects.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('feasly.consolidate.no_projects')}</h3>
              <p className="text-muted-foreground">{t('feasly.consolidate.no_projects_desc')}</p>
            </CardContent>
          </Card>
        )}

        {/* Selection Empty State */}
        {projects.length > 0 && selectedProjects.size === 0 && (
          <Card className="border-dashed">
            <CardContent className="text-center py-8">
              <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">{t('feasly.consolidate.select_projects_desc')}</p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}