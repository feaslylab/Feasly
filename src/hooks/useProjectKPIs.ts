import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProjectKPI {
  irr: number;
  roi: number;
  totalProfit: number;
  totalRevenue: number;
  totalCost: number;
  paybackPeriod: number;
}

export function useProjectKPIs(projectId: string) {
  return useQuery({
    queryKey: ['project-kpis', projectId],
    queryFn: async (): Promise<ProjectKPI | null> => {
      // Try to get the most recent financial summary for this project
      const { data, error } = await supabase
        .from('financial_summaries')
        .select('*')
        .eq('project_id', projectId)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching project KPIs:', error);
        return null;
      }

      if (!data) return null;

      return {
        irr: data.irr || 0,
        roi: (data.profit_margin || 0) * 100, // Convert to percentage
        totalProfit: (data.total_revenue || 0) - (data.total_cost || 0),
        totalRevenue: data.total_revenue || 0,
        totalCost: data.total_cost || 0,
        paybackPeriod: data.payback_period || 0,
      };
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

export function useAllProjectsKPIs(projectIds: string[]) {
  return useQuery({
    queryKey: ['all-projects-kpis', projectIds],
    queryFn: async (): Promise<Record<string, ProjectKPI>> => {
      if (projectIds.length === 0) return {};

      const { data, error } = await supabase
        .from('financial_summaries')
        .select('*')
        .in('project_id', projectIds)
        .order('computed_at', { ascending: false });

      if (error) {
        console.error('Error fetching all projects KPIs:', error);
        return {};
      }

      // Group by project_id and take the most recent for each
      const kpisByProject: Record<string, ProjectKPI> = {};
      const processedProjects = new Set<string>();

      data.forEach(summary => {
        if (!processedProjects.has(summary.project_id)) {
          processedProjects.add(summary.project_id);
          kpisByProject[summary.project_id] = {
            irr: summary.irr || 0,
            roi: (summary.profit_margin || 0) * 100,
            totalProfit: (summary.total_revenue || 0) - (summary.total_cost || 0),
            totalRevenue: summary.total_revenue || 0,
            totalCost: summary.total_cost || 0,
            paybackPeriod: summary.payback_period || 0,
          };
        }
      });

      return kpisByProject;
    },
    enabled: projectIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}