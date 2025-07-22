import { supabase } from "@/integrations/supabase/client";
import { generateAndSaveProjectSummary } from "@/lib/projectAI";
import type { ProjectKPI } from "@/hooks/useProjectKPIs";

/**
 * Regenerate AI summary for a project when KPIs are updated
 */
export async function regenerateProjectSummary(
  projectId: string, 
  kpis?: ProjectKPI
): Promise<string | null> {
  try {
    // Fetch the current project data
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error || !project) {
      console.error('Error fetching project for summary regeneration:', error);
      return null;
    }

    // Generate new summary with KPIs
    const newSummary = await generateAndSaveProjectSummary(project, kpis);
    
    return newSummary;
  } catch (error) {
    console.error('Error regenerating project summary:', error);
    return null;
  }
}

/**
 * Hook into financial summary updates to regenerate AI summaries
 */
export async function onFinancialSummaryUpdate(projectId: string): Promise<void> {
  try {
    // Fetch the latest financial summary
    const { data: summary, error } = await supabase
      .from('financial_summaries')
      .select('*')
      .eq('project_id', projectId)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching financial summary for AI update:', error);
      return;
    }

    if (!summary) return;

    // Convert to ProjectKPI format
    const kpis: ProjectKPI = {
      irr: summary.irr || 0,
      roi: (summary.profit_margin || 0) * 100,
      totalProfit: (summary.total_revenue || 0) - (summary.total_cost || 0),
      totalRevenue: summary.total_revenue || 0,
      totalCost: summary.total_cost || 0,
      paybackPeriod: summary.payback_period || 0,
    };

    // Regenerate summary
    await regenerateProjectSummary(projectId, kpis);
  } catch (error) {
    console.error('Error in financial summary update handler:', error);
  }
}

/**
 * Batch regenerate summaries for multiple projects
 */
export async function batchRegenerateProjectSummaries(
  projectIds: string[]
): Promise<void> {
  const promises = projectIds.map(async (projectId) => {
    try {
      await onFinancialSummaryUpdate(projectId);
    } catch (error) {
      console.error(`Error regenerating summary for project ${projectId}:`, error);
    }
  });

  await Promise.allSettled(promises);
}