import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  LineChart, Line, ScatterChart, Scatter, Cell, Tooltip as RechartsTooltip, Legend
} from "recharts";
import { 
  Building2, DollarSign, TrendingUp, TrendingDown, AlertTriangle, 
  Target, Users, PieChart, FileDown, Share2, CalendarIcon,
  Lightbulb, Shield, Search, BarChart3, Map
} from "lucide-react";
import { format, subMonths, isWithinInterval } from "date-fns";
import type { DateRange } from "react-day-picker";

// Import new components
import { ExportEngine } from "@/components/insights/ExportEngine";
import { ProjectDrillDown } from "@/components/insights/ProjectDrillDown";
import { NaturalLanguageSummary } from "@/components/insights/NaturalLanguageSummary";
import { GeographicMap } from "@/components/insights/GeographicMap";
import { FilterPresets } from "@/components/insights/FilterPresets";

// Mock project data structure
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

// Generate dummy data if localStorage is empty
const generateDummyData = (): Project[] => [
  {
    id: '1',
    name: 'Marina Heights Tower',
    totalGFA: 45000,
    constructionCost: 180000000,
    estimatedRevenue: 250000000,
    irr: 22.5,
    roi: 38.9,
    profitMargin: 28.0,
    netProfit: 70000000,
    status: 'Construction',
    currency: 'AED',
    createdAt: new Date(2024, 0, 15),
    scenario: 'Base',
    country: 'UAE',
    city: 'Dubai'
  },
  {
    id: '2',
    name: 'Business Bay Complex',
    totalGFA: 62000,
    constructionCost: 220000000,
    estimatedRevenue: 295000000,
    irr: 19.2,
    roi: 34.1,
    profitMargin: 25.4,
    netProfit: 75000000,
    status: 'Planning',
    currency: 'AED',
    createdAt: new Date(2024, 1, 20),
    scenario: 'Optimistic',
    country: 'UAE',
    city: 'Dubai'
  },
  {
    id: '3',
    name: 'Residential Villas',
    totalGFA: 28000,
    constructionCost: 95000000,
    estimatedRevenue: 135000000,
    irr: 16.8,
    roi: 42.1,
    profitMargin: 29.6,
    netProfit: 40000000,
    status: 'Development',
    currency: 'AED',
    createdAt: new Date(2024, 2, 10),
    scenario: 'Base',
    country: 'UAE',
    city: 'Abu Dhabi'
  },
  {
    id: '4',
    name: 'Commercial Plaza',
    totalGFA: 35000,
    constructionCost: 125000000,
    estimatedRevenue: 145000000,
    irr: 12.3,
    roi: 16.0,
    profitMargin: 13.8,
    netProfit: 20000000,
    status: 'Planning',
    currency: 'AED',
    createdAt: new Date(2024, 3, 5),
    scenario: 'Pessimistic',
    country: 'UAE',
    city: 'Sharjah'
  },
  {
    id: '5',
    name: 'Luxury Resort',
    totalGFA: 55000,
    constructionCost: 320000000,
    estimatedRevenue: 480000000,
    irr: 25.1,
    roi: 50.0,
    profitMargin: 33.3,
    netProfit: 160000000,
    status: 'Completed',
    currency: 'AED',
    createdAt: new Date(2023, 10, 12),
    scenario: 'Base',
    country: 'UAE',
    city: 'Dubai'
  },
  {
    id: '6',
    name: 'Office Tower Alpha',
    totalGFA: 40000,
    constructionCost: 150000000,
    estimatedRevenue: 200000000,
    irr: 18.7,
    roi: 33.3,
    profitMargin: 25.0,
    netProfit: 50000000,
    status: 'Construction',
    currency: 'AED',
    createdAt: new Date(2024, 4, 1),
    scenario: 'Base',
    country: 'UAE',
    city: 'Abu Dhabi'
  }
];

export default function FeaslyInsights() {
  const { t, isRTL } = useLanguage();
  
  // Load projects from localStorage or use dummy data
  const [projects] = useState<Project[]>(() => {
    const stored = localStorage.getItem('feasly_projects');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt)
        }));
      } catch (e) {
        console.warn('Failed to parse stored projects, using dummy data');
      }
    }
    return generateDummyData();
  });

  // Filter states
  const [scenarioFilter, setScenarioFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 12),
    to: new Date()
  });
  const [currencyFormat, setCurrencyFormat] = useState('AED');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Handle filter changes from FilterPresets
  const handleFiltersChange = (filters: {
    scenarioFilter: string;
    statusFilter: string;
    countryFilter: string;
    dateRange: DateRange | undefined;
    currencyFormat: string;
  }) => {
    setScenarioFilter(filters.scenarioFilter);
    setStatusFilter(filters.statusFilter);
    setCountryFilter(filters.countryFilter);
    setDateRange(filters.dateRange);
    setCurrencyFormat(filters.currencyFormat);
  };

  // Filter projects based on current filters
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (scenarioFilter !== 'all' && project.scenario !== scenarioFilter) return false;
      if (statusFilter !== 'all' && project.status !== statusFilter) return false;
      if (countryFilter !== 'all' && project.country !== countryFilter) return false;
      if (dateRange?.from && dateRange?.to) {
        if (!isWithinInterval(project.createdAt, { start: dateRange.from, end: dateRange.to })) {
          return false;
        }
      }
      return true;
    });
  }, [projects, scenarioFilter, statusFilter, countryFilter, dateRange]);

  // Currency formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currencyFormat,
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  // Calculate KPI metrics
  const kpiMetrics = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const totalGFA = filteredProjects.reduce((sum, p) => sum + p.totalGFA, 0);
    const totalConstructionCost = filteredProjects.reduce((sum, p) => sum + p.constructionCost, 0);
    const totalEstimatedRevenue = filteredProjects.reduce((sum, p) => sum + p.estimatedRevenue, 0);
    const totalNetProfit = filteredProjects.reduce((sum, p) => sum + p.netProfit, 0);
    const avgIRR = totalProjects > 0 ? filteredProjects.reduce((sum, p) => sum + p.irr, 0) / totalProjects : 0;
    const avgROI = totalProjects > 0 ? filteredProjects.reduce((sum, p) => sum + p.roi, 0) / totalProjects : 0;
    const portfolioProfitMargin = totalEstimatedRevenue > 0 ? (totalNetProfit / totalEstimatedRevenue) * 100 : 0;
    
    // Risk level calculation
    let riskLevel = 'Low';
    if (avgIRR < 15 || portfolioProfitMargin < 15) riskLevel = 'High';
    else if (avgIRR < 20 || portfolioProfitMargin < 25) riskLevel = 'Medium';

    return {
      totalProjects,
      totalGFA,
      totalConstructionCost,
      totalEstimatedRevenue,
      totalNetProfit,
      avgIRR,
      avgROI,
      portfolioProfitMargin,
      riskLevel
    };
  }, [filteredProjects]);

  // Chart data preparations
  const bubbleChartData = filteredProjects.map(p => ({
    name: p.name,
    x: p.irr,
    y: p.roi,
    z: p.totalGFA / 1000, // Scale down for visualization
    status: p.status,
    id: p.id
  }));

  const lineChartData = useMemo(() => {
    const monthlyData: Record<string, { month: string; revenue: number; cost: number }> = {};
    
    filteredProjects.forEach(project => {
      const monthKey = format(project.createdAt, 'yyyy-MM');
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: format(project.createdAt, 'MMM yyyy'),
          revenue: 0,
          cost: 0
        };
      }
      monthlyData[monthKey].revenue += project.estimatedRevenue;
      monthlyData[monthKey].cost += project.constructionCost;
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredProjects]);

  const scenarioComparisonData = useMemo(() => {
    const scenarios = ['Base', 'Optimistic', 'Pessimistic', 'Custom'];
    return scenarios.map(scenario => {
      const scenarioProjects = filteredProjects.filter(p => p.scenario === scenario);
      const avgIRR = scenarioProjects.length > 0 ? 
        scenarioProjects.reduce((sum, p) => sum + p.irr, 0) / scenarioProjects.length : 0;
      const totalNetProfit = scenarioProjects.reduce((sum, p) => sum + p.netProfit, 0);
      const totalRevenue = scenarioProjects.reduce((sum, p) => sum + p.estimatedRevenue, 0);
      
      return {
        scenario,
        irr: avgIRR,
        netProfit: totalNetProfit / 1000000, // In millions
        revenue: totalRevenue / 1000000 // In millions
      };
    });
  }, [filteredProjects]);

  const topProjectsData = filteredProjects
    .sort((a, b) => b.irr - a.irr)
    .slice(0, 5)
    .map(p => ({
      name: p.name,
      irr: p.irr,
      id: p.id
    }));

  // AI Insight calculations
  const topOpportunities = filteredProjects
    .filter(p => p.irr > 18 && p.netProfit > 5000000)
    .sort((a, b) => b.irr - a.irr)
    .slice(0, 3);

  const riskAlerts = filteredProjects
    .filter(p => p.roi < 5 || p.profitMargin < 10 || p.netProfit < 0);

  const dataGaps = filteredProjects
    .filter(p => !p.totalGFA || !p.estimatedRevenue || !p.constructionCost);

  const scenarioSensitivity = filteredProjects.filter(p => {
    const optimisticVersion = projects.find(op => 
      op.name === p.name && op.scenario === 'Optimistic'
    );
    return optimisticVersion && optimisticVersion.irr >= p.irr * 1.2;
  });

  const getIRRColor = (irr: number) => {
    if (irr >= 20) return 'text-green-600';
    if (irr >= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  return (
    <div className={cn("p-6 space-y-6", isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {t('feasly.insights.title') || 'Feasly Insights'}
              <Badge className="ml-3 bg-blue-100 text-blue-800">v2 - Advanced Analytics</Badge>
            </h1>
            <p className="text-muted-foreground">
              {t('feasly.insights.description') || 'Advanced analytics and insights for your portfolio'}
            </p>
          </div>
          <ExportEngine 
            projects={filteredProjects}
            kpiMetrics={kpiMetrics}
            currencyFormat={currencyFormat}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>

      {/* Natural Language Summary */}
      <NaturalLanguageSummary 
        projects={filteredProjects}
        kpiMetrics={kpiMetrics}
        formatCurrency={formatCurrency}
      />

      {/* Filter Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Select value={scenarioFilter} onValueChange={setScenarioFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Scenario Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scenarios</SelectItem>
                  <SelectItem value="Base">Base</SelectItem>
                  <SelectItem value="Optimistic">Optimistic</SelectItem>
                  <SelectItem value="Pessimistic">Pessimistic</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Construction">Construction</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="UAE">UAE</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? format(dateRange.from, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => setDateRange(range)}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <Select value={currencyFormat} onValueChange={setCurrencyFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AED">AED</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Presets */}
            <FilterPresets
              scenarioFilter={scenarioFilter}
              statusFilter={statusFilter}
              countryFilter={countryFilter}
              dateRange={dateRange}
              currencyFormat={currencyFormat}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* KPI Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiMetrics.totalProjects}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total GFA</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat().format(kpiMetrics.totalGFA)} sqm
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Construction Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(kpiMetrics.totalConstructionCost)}
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(kpiMetrics.totalEstimatedRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", kpiMetrics.totalNetProfit < 0 ? "text-red-600" : "text-green-600")}>
              {formatCurrency(kpiMetrics.totalNetProfit)}
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average IRR</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getIRRColor(kpiMetrics.avgIRR))}>
              {kpiMetrics.avgIRR.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiMetrics.avgROI.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getRiskLevelColor(kpiMetrics.riskLevel)}>
              {kpiMetrics.riskLevel}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Charts Overview</TabsTrigger>
          <TabsTrigger value="geographic">Geographic View</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* IRR vs ROI Bubble Chart */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>IRR vs ROI Analysis</CardTitle>
                <CardDescription>Bubble size represents GFA. Click projects for details.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={bubbleChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" name="IRR" unit="%" />
                    <YAxis dataKey="y" name="ROI" unit="%" />
                    <RechartsTooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded shadow-lg">
                              <p className="font-medium">{data.name}</p>
                              <p>IRR: {data.x}%</p>
                              <p>ROI: {data.y}%</p>
                              <p>Status: {data.status}</p>
                              <p className="text-xs text-muted-foreground mt-1">Click to view details</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter 
                      dataKey="z" 
                      fill="hsl(var(--primary))" 
                      onClick={(data) => {
                        const project = filteredProjects.find(p => p.id === data.id);
                        if (project) handleProjectClick(project);
                      }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue vs Cost Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Cost Timeline</CardTitle>
                <CardDescription>Monthly cumulative values</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" name="Revenue" />
                    <Line type="monotone" dataKey="cost" stroke="hsl(var(--destructive))" name="Cost" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Scenario Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Scenario Comparison</CardTitle>
                <CardDescription>IRR and profit by scenario type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scenarioComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scenario" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="irr" fill="hsl(var(--primary))" name="IRR %" />
                    <Bar dataKey="netProfit" fill="hsl(var(--secondary))" name="Net Profit (M)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Projects by IRR</CardTitle>
                <CardDescription>Highest performing projects - click to view details</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProjectsData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <RechartsTooltip />
                    <Bar 
                      dataKey="irr" 
                      fill="hsl(var(--primary))"
                      onClick={(data) => {
                        const project = filteredProjects.find(p => p.id === data.id);
                        if (project) handleProjectClick(project);
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <GeographicMap
            projects={filteredProjects}
            formatCurrency={formatCurrency}
            onProjectClick={handleProjectClick}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* AI Insight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Lightbulb className="h-5 w-5 text-green-600 mr-2" />
                <CardTitle className="text-sm font-medium text-green-800">Top Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                {topOpportunities.length > 0 ? (
                  <div className="space-y-2">
                    {topOpportunities.map(project => (
                      <div 
                        key={project.id} 
                        className="text-sm cursor-pointer hover:bg-green-50 p-2 rounded"
                        onClick={() => handleProjectClick(project)}
                      >
                        <div className="font-medium">{project.name}</div>
                        <div className="text-green-600">IRR: {project.irr.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No high-opportunity projects found</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <CardTitle className="text-sm font-medium text-red-800">Risk Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {riskAlerts.length > 0 ? (
                  <div className="space-y-2">
                    {riskAlerts.slice(0, 3).map(project => (
                      <div 
                        key={project.id} 
                        className="text-sm cursor-pointer hover:bg-red-50 p-2 rounded"
                        onClick={() => handleProjectClick(project)}
                      >
                        <div className="font-medium">{project.name}</div>
                        <div className="text-red-600">
                          {project.netProfit < 0 ? 'Negative profit' : 
                           project.roi < 5 ? 'Low ROI' : 'Low margin'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No risk alerts</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Search className="h-5 w-5 text-yellow-600 mr-2" />
                <CardTitle className="text-sm font-medium text-yellow-800">Data Gaps</CardTitle>
              </CardHeader>
              <CardContent>
                {dataGaps.length > 0 ? (
                  <div className="space-y-2">
                    {dataGaps.slice(0, 3).map(project => (
                      <div 
                        key={project.id} 
                        className="text-sm cursor-pointer hover:bg-yellow-50 p-2 rounded"
                        onClick={() => handleProjectClick(project)}
                      >
                        <div className="font-medium">{project.name}</div>
                        <div className="text-yellow-600">Missing key data</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">All data complete</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle className="text-sm font-medium text-blue-800">Scenario Sensitivity</CardTitle>
              </CardHeader>
              <CardContent>
                {scenarioSensitivity.length > 0 ? (
                  <div className="space-y-2">
                    {scenarioSensitivity.slice(0, 3).map(project => (
                      <div 
                        key={project.id} 
                        className="text-sm cursor-pointer hover:bg-blue-50 p-2 rounded"
                        onClick={() => handleProjectClick(project)}
                      >
                        <div className="font-medium">{project.name}</div>
                        <div className="text-blue-600">High sensitivity</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Low scenario sensitivity</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Project Drill-Down Modal */}
      <ProjectDrillDown
        project={selectedProject}
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        formatCurrency={formatCurrency}
        allProjects={projects}
      />
    </div>
  );
}