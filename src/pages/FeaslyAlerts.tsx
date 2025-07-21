import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Search, 
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import { useFeaslyAlerts, ProjectAlertSummary, AlertSeverity } from '@/hooks/useFeaslyAlerts';

const AlertIcon = ({ severity, className = "h-4 w-4" }: { severity: AlertSeverity; className?: string }) => {
  switch (severity) {
    case 'red':
      return <AlertTriangle className={`${className} text-red-600`} />;
    case 'yellow':
      return <AlertCircle className={`${className} text-yellow-600`} />;
    case 'green':
      return <CheckCircle className={`${className} text-green-600`} />;
    default:
      return <AlertCircle className={`${className} text-gray-400`} />;
  }
};

const AlertBadge = ({ severity, count }: { severity: AlertSeverity; count: number }) => {
  const variants = {
    red: 'destructive',
    yellow: 'secondary',
    green: 'default'
  };

  return (
    <Badge variant={variants[severity] as any} className="flex items-center gap-1">
      <AlertIcon severity={severity} className="h-3 w-3" />
      {count}
    </Badge>
  );
};

const ProjectCard = ({ project }: { project: ProjectAlertSummary }) => {
  const { t } = useTranslation('feasly.alerts');
  const [expandedScenarios, setExpandedScenarios] = useState<Record<string, boolean>>({});

  const toggleScenario = (scenario: string) => {
    setExpandedScenarios(prev => ({
      ...prev,
      [scenario]: !prev[scenario]
    }));
  };

  const scenarios = [...new Set([
    ...project.redAlerts.map(a => a.scenario),
    ...project.yellowAlerts.map(a => a.scenario),
    ...project.greenAlerts.map(a => a.scenario)
  ])];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertIcon severity={project.worstSeverity} className="h-5 w-5" />
            <CardTitle className="text-lg">{project.projectName}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {project.redAlerts.length > 0 && <AlertBadge severity="red" count={project.redAlerts.length} />}
            {project.yellowAlerts.length > 0 && <AlertBadge severity="yellow" count={project.yellowAlerts.length} />}
            {project.greenAlerts.length > 0 && <AlertBadge severity="green" count={project.greenAlerts.length} />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {scenarios.map(scenario => {
          const scenarioRedAlerts = project.redAlerts.filter(a => a.scenario === scenario);
          const scenarioYellowAlerts = project.yellowAlerts.filter(a => a.scenario === scenario);
          const scenarioGreenAlerts = project.greenAlerts.filter(a => a.scenario === scenario);
          
          if (scenarioRedAlerts.length === 0 && scenarioYellowAlerts.length === 0 && scenarioGreenAlerts.length === 0) {
            return null;
          }

          return (
            <div key={scenario} className="border rounded-lg p-3">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleScenario(scenario)}
              >
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{scenario}</h4>
                  <div className="flex gap-1">
                    {scenarioRedAlerts.length > 0 && <AlertBadge severity="red" count={scenarioRedAlerts.length} />}
                    {scenarioYellowAlerts.length > 0 && <AlertBadge severity="yellow" count={scenarioYellowAlerts.length} />}
                    {scenarioGreenAlerts.length > 0 && <AlertBadge severity="green" count={scenarioGreenAlerts.length} />}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  {expandedScenarios[scenario] ? '−' : '+'}
                </Button>
              </div>

              {expandedScenarios[scenario] && (
                <div className="mt-3 space-y-2">
                  {[...scenarioRedAlerts, ...scenarioYellowAlerts, ...scenarioGreenAlerts].map(alert => (
                    <div key={alert.id} className="flex items-start gap-3 p-2 bg-muted/30 rounded text-sm">
                      <AlertIcon severity={alert.severity} className="h-4 w-4 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-muted-foreground text-xs">{alert.description}</div>
                        <div className="flex gap-4 mt-1 text-xs">
                          <span><strong>Value:</strong> {alert.value}</span>
                          <span><strong>Threshold:</strong> {alert.threshold}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

const StatCard = ({ title, value, icon: Icon, trend }: { 
  title: string; 
  value: number; 
  icon: any; 
  trend?: 'up' | 'down' | 'neutral'; 
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="flex items-center gap-2">
          {trend && (
            trend === 'up' ? <TrendingUp className="h-4 w-4 text-red-600" /> :
            trend === 'down' ? <TrendingDown className="h-4 w-4 text-green-600" /> :
            <BarChart3 className="h-4 w-4 text-blue-600" />
          )}
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function FeaslyAlerts() {
  const { t } = useTranslation('feasly.alerts');
  const { portfolioAlerts, isLoading, getProjectsByRisk, getAlertStatistics, getAlertsByScenario } = useFeaslyAlerts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('all');
  const [sortBy, setSortBy] = useState('risk'); // 'risk', 'name', 'alerts'

  const stats = getAlertStatistics();
  
  // Filter and sort projects
  let filteredProjects = portfolioAlerts;
  
  if (searchTerm) {
    filteredProjects = filteredProjects.filter(project =>
      project.projectName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (selectedScenario !== 'all') {
    filteredProjects = getAlertsByScenario(selectedScenario);
  }

  switch (sortBy) {
    case 'risk':
      filteredProjects = getProjectsByRisk().filter(p => 
        !searchTerm || p.projectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      break;
    case 'name':
      filteredProjects = [...filteredProjects].sort((a, b) => a.projectName.localeCompare(b.projectName));
      break;
    case 'alerts':
      filteredProjects = [...filteredProjects].sort((a, b) => b.totalAlerts - a.totalAlerts);
      break;
  }

  const exportToCSV = () => {
    const headers = ['Project Name', 'Scenario', 'Alert Type', 'Severity', 'Title', 'Description', 'Value', 'Threshold'];
    const rows = portfolioAlerts.flatMap(project => 
      [...project.redAlerts, ...project.yellowAlerts, ...project.greenAlerts].map(alert => [
        project.projectName,
        alert.scenario,
        alert.alertType,
        alert.severity,
        alert.title,
        alert.description,
        alert.value,
        alert.threshold
      ])
    );

    const csvContent = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `portfolio-alerts-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          {t('export_csv')}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title={t('total_projects')}
          value={stats.totalProjects}
          icon={BarChart3}
          trend="neutral"
        />
        <StatCard
          title={t('critical_projects')}
          value={stats.redProjects}
          icon={AlertTriangle}
          trend="up"
        />
        <StatCard
          title={t('warning_projects')}
          value={stats.yellowProjects}
          icon={AlertCircle}
          trend="neutral"
        />
        <StatCard
          title={t('healthy_projects')}
          value={stats.greenProjects}
          icon={CheckCircle}
          trend="down"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('search_projects')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedScenario} onValueChange={setSelectedScenario}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t('filter_scenario')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_scenarios')}</SelectItem>
                <SelectItem value="Base">{t('scenario_base')}</SelectItem>
                <SelectItem value="Optimistic">{t('scenario_optimistic')}</SelectItem>
                <SelectItem value="Pessimistic">{t('scenario_pessimistic')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t('sort_by')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="risk">{t('sort_by_risk')}</SelectItem>
                <SelectItem value="name">{t('sort_by_name')}</SelectItem>
                <SelectItem value="alerts">{t('sort_by_alerts')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">{t('no_projects_found')}</h3>
              <p className="text-muted-foreground">{t('no_projects_description')}</p>
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map(project => (
            <ProjectCard key={project.projectId} project={project} />
          ))
        )}
      </div>
    </div>
  );
}