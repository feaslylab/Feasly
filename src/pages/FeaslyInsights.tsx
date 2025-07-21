import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon } from "lucide-react";
import { format, subMonths, isWithinInterval } from "date-fns";
import type { DateRange } from "react-day-picker";

// Import new components
import { ExportEngine } from "@/components/insights/ExportEngine";
import { ProjectDrillDown } from "@/components/insights/ProjectDrillDown";
import { NaturalLanguageSummary } from "@/components/insights/NaturalLanguageSummary";
import { GeographicMap } from "@/components/insights/GeographicMap";
import { FilterPresets } from "@/components/insights/FilterPresets";

// Import modular FeaslyInsights components
import ScenarioTabs from "@/components/FeaslyInsights/ScenarioTabs";
import InsightSummaryPanel from "@/components/FeaslyInsights/InsightSummaryPanel";
import ScenarioCharts from "@/components/FeaslyInsights/ScenarioCharts";
import AIInsightsPanel from "@/components/FeaslyInsights/AIInsightsPanel";

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
  const { isRTL } = useLanguage();
  const { t } = useTranslation('feasly.insights');
  
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


  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  return (
    <div className={cn("p-6 space-y-6", isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {t('title') || 'Feasly Insights'}
              <Badge className="ml-3 bg-blue-100 text-blue-800">v2 - Advanced Analytics</Badge>
            </h1>
            <p className="text-muted-foreground">
              {t('description') || 'Advanced analytics and insights for your portfolio'}
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
      <InsightSummaryPanel 
        summary={kpiMetrics} 
        currency={currencyFormat} 
        formatCurrency={formatCurrency}
      />

      {/* Tabbed Content */}
      <ScenarioTabs activeScenario={activeTab} setActiveScenario={setActiveTab}>
        <TabsContent value="overview" className="space-y-6">
          <ScenarioCharts 
            projects={filteredProjects} 
            onProjectClick={handleProjectClick}
          />
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <GeographicMap
            projects={filteredProjects}
            formatCurrency={formatCurrency}
            onProjectClick={handleProjectClick}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <AIInsightsPanel 
            projects={filteredProjects}
            allProjects={projects}
            onProjectClick={handleProjectClick}
          />
        </TabsContent>
      </ScenarioTabs>

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