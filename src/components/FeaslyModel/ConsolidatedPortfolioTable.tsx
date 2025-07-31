import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { KPIBenchmarkBadge } from "@/components/ui/kpi-benchmark-badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Building2, TrendingUp, Filter, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBenchmarks } from "@/hooks/useBenchmarks";
import { toast } from "sonner";

interface ProjectSummary {
  projectId: string;
  projectName: string;
  assetType: string;
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  roi: number;
  irr: number;
  profitMargin: number;
  finalCashBalance: number;
  lastUpdated: string;
  scenario: string;
}

interface ConsolidatedPortfolioTableProps {
  className?: string;
}

export default function ConsolidatedPortfolioTable({ className }: ConsolidatedPortfolioTableProps) {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<keyof ProjectSummary>("totalProfit");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedScenario, setSelectedScenario] = useState<string>("base");
  
  const { benchmarks, getBenchmarkByAssetType } = useBenchmarks();

  useEffect(() => {
    loadPortfolioData();
  }, [selectedScenario]);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchTerm, sortBy, sortOrder]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);

      // Get user's projects
      const { data: userProjects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, updated_at')
        .eq('is_demo', false);

      if (projectsError) throw projectsError;

      if (!userProjects || userProjects.length === 0) {
        setProjects([]);
        return;
      }

      // Get cashflow data for all projects
      const projectIds = userProjects.map(p => p.id);
      const { data: cashflowData, error: cashflowError } = await supabase
        .from('feasly_cashflows')
        .select('*')
        .in('project_id', projectIds)
        .eq('scenario', selectedScenario);

      if (cashflowError) throw cashflowError;

      // Group cashflow data by project
      const projectSummaries: ProjectSummary[] = userProjects.map(project => {
        const projectCashflows = cashflowData?.filter(cf => cf.project_id === project.id) || [];
        
        if (projectCashflows.length === 0) {
          return {
            projectId: project.id,
            projectName: project.name,
            assetType: "Commercial", // Default for now, could be enhanced to get from project data
            totalRevenue: 0,
            totalCosts: 0,
            totalProfit: 0,
            roi: 0,
            irr: 0,
            profitMargin: 0,
            finalCashBalance: 0,
            lastUpdated: project.updated_at,
            scenario: selectedScenario,
          };
        }

        // Calculate totals
        const totalRevenue = projectCashflows.reduce((sum, cf) => sum + (cf.revenue || 0), 0);
        const totalCosts = projectCashflows.reduce((sum, cf) => 
          sum + (cf.construction_cost || 0) + (cf.land_cost || 0) + (cf.soft_costs || 0), 0);
        const totalProfit = totalRevenue - totalCosts;
        const roi = totalCosts > 0 ? (totalProfit / totalCosts) * 100 : 0;
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
        const irr = 15.0; // Placeholder IRR calculation - this would need proper NPV calculation
        
        // Get final cash balance (last month)
        const sortedCashflows = [...projectCashflows].sort((a, b) => a.month.localeCompare(b.month));
        const finalCashBalance = sortedCashflows.length > 0 ? 
          sortedCashflows[sortedCashflows.length - 1].cash_balance || 0 : 0;

        return {
          projectId: project.id,
          projectName: project.name,
          assetType: "Commercial", // Default for now, could be enhanced to get from project metadata
          totalRevenue,
          totalCosts,
          totalProfit,
          roi,
          irr,
          profitMargin,
          finalCashBalance,
          lastUpdated: project.updated_at,
          scenario: selectedScenario,
        };
      });

      setProjects(projectSummaries);

    } catch (error) {
      console.error('Error loading portfolio data:', error);
      toast.error("Failed to load portfolio data");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProjects = () => {
    let filtered = [...projects];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    setFilteredProjects(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: Math.abs(amount) > 1000000 ? 'compact' : 'standard'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const exportToCSV = () => {
    const headers = [
      "Project Name",
      "Total Revenue",
      "Total Costs", 
      "Total Profit",
      "ROI %",
      "Final Cash Balance",
      "Last Updated",
      "Scenario"
    ];

    const rows = filteredProjects.map(project => [
      project.projectName,
      project.totalRevenue,
      project.totalCosts,
      project.totalProfit,
      project.roi,
      project.finalCashBalance,
      formatDate(project.lastUpdated),
      project.scenario
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-summary-${selectedScenario}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getChartData = () => {
    return filteredProjects.slice(0, 10).map(project => ({
      name: project.projectName.length > 15 ? 
        project.projectName.substring(0, 15) + '...' : project.projectName,
      profit: project.totalProfit,
      roi: project.roi,
      revenue: project.totalRevenue,
    }));
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading portfolio data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Portfolio Consolidation Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={loadPortfolioData}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{projects.length}</div>
              <div className="text-sm text-muted-foreground">Total Projects</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(projects.reduce((sum, p) => sum + p.totalRevenue, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(projects.reduce((sum, p) => sum + p.totalProfit, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Profit</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {projects.length > 0 ? formatPercentage(
                  projects.reduce((sum, p) => sum + p.roi, 0) / projects.length
                ) : "0%"}
              </div>
              <div className="text-sm text-muted-foreground">Average ROI</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedScenario} onValueChange={setSelectedScenario}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="base">Base</SelectItem>
                <SelectItem value="optimistic">Optimistic</SelectItem>
                <SelectItem value="pessimistic">Pessimistic</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-');
              setSortBy(field as keyof ProjectSummary);
              setSortOrder(order as "asc" | "desc");
            }}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalProfit-desc">Profit (High to Low)</SelectItem>
                <SelectItem value="totalProfit-asc">Profit (Low to High)</SelectItem>
                <SelectItem value="roi-desc">ROI (High to Low)</SelectItem>
                <SelectItem value="roi-asc">ROI (Low to High)</SelectItem>
                <SelectItem value="projectName-asc">Name (A to Z)</SelectItem>
                <SelectItem value="projectName-desc">Name (Z to A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      {filteredProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'roi') {
                      return [formatPercentage(value), 'ROI'];
                    }
                    return [formatCurrency(value), name];
                  }}
                />
                <Bar dataKey="profit" fill="hsl(var(--chart-revenue))" name="Profit" />
                <Bar dataKey="roi" fill="hsl(var(--chart-profit))" name="ROI %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Project Portfolio ({filteredProjects.length} projects)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold">No projects found</p>
              <p className="text-muted-foreground">
                {projects.length === 0 
                  ? "Create your first Feasly project to see portfolio data"
                  : "Try adjusting your search or filters"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                   <TableRow>
                     <TableHead>Project Name</TableHead>
                     <TableHead className="text-right">Revenue</TableHead>
                     <TableHead className="text-right">Costs</TableHead>
                     <TableHead className="text-right">Profit</TableHead>
                     <TableHead className="text-right">ROI vs Benchmark</TableHead>
                     <TableHead className="text-right">IRR vs Benchmark</TableHead>
                     <TableHead className="text-right">Final Balance</TableHead>
                     <TableHead>Last Updated</TableHead>
                     <TableHead>Status</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {filteredProjects.map((project) => {
                     const benchmark = getBenchmarkByAssetType(project.assetType);
                     
                     return (
                       <TableRow key={project.projectId}>
                         <TableCell className="font-medium">{project.projectName}</TableCell>
                         <TableCell className="text-right">{formatCurrency(project.totalRevenue)}</TableCell>
                         <TableCell className="text-right">{formatCurrency(project.totalCosts)}</TableCell>
                         <TableCell className={`text-right font-semibold ${
                           project.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                         }`}>
                           {formatCurrency(project.totalProfit)}
                         </TableCell>
                         <TableCell className="text-right space-y-1">
                           <div className={`${
                             project.roi >= 15 ? 'text-green-600' : 
                             project.roi >= 10 ? 'text-yellow-600' : 'text-red-600'
                           }`}>
                             {formatPercentage(project.roi)}
                           </div>
                           {benchmark && (
                             <KPIBenchmarkBadge
                               actualValue={project.roi}
                               benchmarkValue={benchmark.avg_roi}
                               metricType="roi"
                               className="block"
                             />
                           )}
                         </TableCell>
                         <TableCell className="text-right space-y-1">
                           <div>{formatPercentage(project.irr)}</div>
                           {benchmark && (
                             <KPIBenchmarkBadge
                               actualValue={project.irr}
                               benchmarkValue={benchmark.avg_irr}
                               metricType="irr"
                               className="block"
                             />
                           )}
                         </TableCell>
                         <TableCell className="text-right">{formatCurrency(project.finalCashBalance)}</TableCell>
                         <TableCell>{formatDate(project.lastUpdated)}</TableCell>
                         <TableCell>
                           <Badge variant={
                             project.totalProfit > 0 ? "default" : 
                             project.totalRevenue > 0 ? "secondary" : "outline"
                           }>
                             {project.totalProfit > 0 ? "Profitable" : 
                              project.totalRevenue > 0 ? "Break-even" : "Planning"}
                           </Badge>
                         </TableCell>
                       </TableRow>
                     );
                   })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}