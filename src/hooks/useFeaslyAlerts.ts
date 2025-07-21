import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFeaslyCalculation } from './useFeaslyCalculation';

export type AlertSeverity = 'green' | 'yellow' | 'red';
export type AlertType = 'profit_margin' | 'roi' | 'cash_balance' | 'negative_cashflow';

export interface ProjectAlert {
  id: string;
  projectId: string;
  projectName: string;
  scenario: string;
  severity: AlertSeverity;
  alertType: AlertType;
  title: string;
  description: string;
  value: string;
  threshold: string;
}

export interface ProjectAlertSummary {
  projectId: string;
  projectName: string;
  currency: string;
  redAlerts: ProjectAlert[];
  yellowAlerts: ProjectAlert[];
  greenAlerts: ProjectAlert[];
  totalAlerts: number;
  worstSeverity: AlertSeverity;
}

// Alert evaluation rules
const evaluateProjectAlerts = (
  projectId: string,
  projectName: string,
  currency: string,
  scenarios: any[]
): ProjectAlertSummary => {
  const allAlerts: ProjectAlert[] = [];

  scenarios.forEach(({ scenario, summary, data }) => {
    if (!summary || !data) return;

    const profitMargin = summary.totalRevenue > 0 
      ? ((summary.totalProfit / summary.totalRevenue) * 100) 
      : 0;
    
    const roi = summary.totalCosts > 0 
      ? ((summary.totalProfit / summary.totalCosts) * 100) 
      : 0;
    
    const finalCashBalance = data[data.length - 1]?.cash_balance || 0;
    
    // Check for negative cash flow months
    const negativeMonths = data.filter((month: any) => month.net_cashflow < 0).length;
    
    // Evaluate Red Alerts
    if (finalCashBalance < 0) {
      allAlerts.push({
        id: `${projectId}-${scenario}-cash-negative`,
        projectId,
        projectName,
        scenario,
        severity: 'red',
        alertType: 'cash_balance',
        title: 'Negative Final Cash Balance',
        description: `Project ends with negative cash balance in ${scenario} scenario`,
        value: `${finalCashBalance.toLocaleString()} ${currency}`,
        threshold: '> 0'
      });
    }

    if (profitMargin < 10) {
      allAlerts.push({
        id: `${projectId}-${scenario}-margin-low`,
        projectId,
        projectName,
        scenario,
        severity: 'red',
        alertType: 'profit_margin',
        title: 'Low Profit Margin',
        description: `Profit margin below 10% threshold in ${scenario} scenario`,
        value: `${profitMargin.toFixed(1)}%`,
        threshold: '≥ 10%'
      });
    }

    // Evaluate Yellow Alerts
    if (roi >= 10 && roi <= 15) {
      allAlerts.push({
        id: `${projectId}-${scenario}-roi-borderline`,
        projectId,
        projectName,
        scenario,
        severity: 'yellow',
        alertType: 'roi',
        title: 'Borderline ROI',
        description: `ROI between 10-15% range in ${scenario} scenario`,
        value: `${roi.toFixed(1)}%`,
        threshold: '> 15%'
      });
    }

    if (negativeMonths > 0) {
      allAlerts.push({
        id: `${projectId}-${scenario}-cashflow-negative`,
        projectId,
        projectName,
        scenario,
        severity: 'yellow',
        alertType: 'negative_cashflow',
        title: 'Negative Monthly Cashflow',
        description: `${negativeMonths} month(s) with negative cashflow in ${scenario} scenario`,
        value: `${negativeMonths} months`,
        threshold: '0 months'
      });
    }

    // Evaluate Green Alerts (Good Performance)
    if (roi > 15 && finalCashBalance > 0 && profitMargin > 20) {
      allAlerts.push({
        id: `${projectId}-${scenario}-performance-excellent`,
        projectId,
        projectName,
        scenario,
        severity: 'green',
        alertType: 'roi',
        title: 'Excellent Performance',
        description: `Strong metrics across all indicators in ${scenario} scenario`,
        value: `ROI: ${roi.toFixed(1)}%, Margin: ${profitMargin.toFixed(1)}%`,
        threshold: 'ROI > 15%, Margin > 20%'
      });
    }
  });

  const redAlerts = allAlerts.filter(a => a.severity === 'red');
  const yellowAlerts = allAlerts.filter(a => a.severity === 'yellow');
  const greenAlerts = allAlerts.filter(a => a.severity === 'green');

  // Determine worst severity
  let worstSeverity: AlertSeverity = 'green';
  if (redAlerts.length > 0) worstSeverity = 'red';
  else if (yellowAlerts.length > 0) worstSeverity = 'yellow';

  return {
    projectId,
    projectName,
    currency,
    redAlerts,
    yellowAlerts,
    greenAlerts,
    totalAlerts: allAlerts.length,
    worstSeverity
  };
};

export const useFeaslyAlerts = () => {
  // Fetch all user projects
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['user-projects-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, currency_code')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Get alerts for all projects
  const { data: portfolioAlerts = [], isLoading: isLoadingAlerts } = useQuery({
    queryKey: ['portfolio-alerts', projects.map(p => p.id)],
    queryFn: async () => {
      if (projects.length === 0) return [];

      const alerts: ProjectAlertSummary[] = [];

      // For each project, get calculation data and evaluate alerts
      for (const project of projects) {
        try {
          // Get calculation hook data for this project
          const { data: cashflowData } = await supabase
            .from('feasly_cashflows')
            .select('*')
            .eq('project_id', project.id)
            .eq('is_latest', true)
            .order('created_at', { ascending: false });

          if (!cashflowData || cashflowData.length === 0) continue;

          // Group by scenario and version
          const scenarioData: Record<string, any[]> = {};
          cashflowData.forEach(row => {
            if (!scenarioData[row.scenario]) {
              scenarioData[row.scenario] = [];
            }
            scenarioData[row.scenario].push(row);
          });

          // Calculate summaries for each scenario
          const scenarios = Object.entries(scenarioData).map(([scenario, data]) => {
            const totalRevenue = data.reduce((sum, month) => sum + (month.revenue || 0), 0);
            const totalCosts = data.reduce((sum, month) => 
              sum + (month.construction_cost || 0) + (month.land_cost || 0) + (month.soft_costs || 0), 0
            );
            const totalProfit = totalRevenue - totalCosts;

            return {
              scenario,
              data,
              summary: {
                totalRevenue,
                totalCosts,
                totalProfit
              }
            };
          });

          const projectAlerts = evaluateProjectAlerts(
            project.id,
            project.name,
            project.currency_code || 'AED',
            scenarios
          );

          alerts.push(projectAlerts);
        } catch (error) {
          console.error(`Error processing alerts for project ${project.id}:`, error);
        }
      }

      return alerts;
    },
    enabled: projects.length > 0
  });

  // Helper functions for filtering and sorting
  const getAlertsByScenario = (scenario: string) => {
    return portfolioAlerts.map(project => ({
      ...project,
      redAlerts: project.redAlerts.filter(a => a.scenario === scenario),
      yellowAlerts: project.yellowAlerts.filter(a => a.scenario === scenario),
      greenAlerts: project.greenAlerts.filter(a => a.scenario === scenario)
    })).filter(project => 
      project.redAlerts.length > 0 || 
      project.yellowAlerts.length > 0 || 
      project.greenAlerts.length > 0
    );
  };

  const getProjectsByRisk = () => {
    return [...portfolioAlerts].sort((a, b) => {
      // Sort by severity (red first, then yellow, then green)
      const severityOrder = { red: 3, yellow: 2, green: 1 };
      if (a.worstSeverity !== b.worstSeverity) {
        return severityOrder[b.worstSeverity] - severityOrder[a.worstSeverity];
      }
      // Then by total alert count
      return b.totalAlerts - a.totalAlerts;
    });
  };

  const getAlertStatistics = () => {
    const stats = {
      totalProjects: portfolioAlerts.length,
      redProjects: portfolioAlerts.filter(p => p.worstSeverity === 'red').length,
      yellowProjects: portfolioAlerts.filter(p => p.worstSeverity === 'yellow').length,
      greenProjects: portfolioAlerts.filter(p => p.worstSeverity === 'green').length,
      totalAlerts: portfolioAlerts.reduce((sum, p) => sum + p.totalAlerts, 0)
    };

    return stats;
  };

  return {
    portfolioAlerts,
    isLoading: isLoadingProjects || isLoadingAlerts,
    projects,
    getAlertsByScenario,
    getProjectsByRisk,
    getAlertStatistics
  };
};