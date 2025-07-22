import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import type { ExportData } from '@/lib/pdfExporter';

export function useExportData(projectId: string) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return useQuery({
    queryKey: ['export-data', projectId, i18n.language],
    queryFn: async (): Promise<ExportData | null> => {
      if (!projectId) return null;

      try {
        // Fetch project data
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (projectError || !project) {
          console.error('Error fetching project:', projectError);
          return null;
        }

        // Fetch KPIs from financial summaries
        const { data: financialSummary } = await supabase
          .from('financial_summaries')
          .select('*')
          .eq('project_id', projectId)
          .order('computed_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        let kpis;
        if (financialSummary) {
          kpis = {
            irr: financialSummary.irr || 0,
            roi: (financialSummary.profit_margin || 0) * 100,
            totalProfit: (financialSummary.total_revenue || 0) - (financialSummary.total_cost || 0),
            totalRevenue: financialSummary.total_revenue || 0,
            totalCost: financialSummary.total_cost || 0,
            paybackPeriod: financialSummary.payback_period || 0,
          };
        }

        // Fetch scenarios (we'll create mock scenarios for now since scenarios table might not have full data)
        const { data: scenarios } = await supabase
          .from('scenarios')
          .select('*')
          .eq('project_id', projectId);

        const mockScenarios = [
          {
            name: 'Base Case',
            type: 'base' as const,
            irr: kpis?.irr || 15.0,
            totalProfit: kpis?.totalProfit || 50000000,
            riskLevel: 'medium' as const
          },
          {
            name: 'Optimistic',
            type: 'optimistic' as const,
            irr: (kpis?.irr || 15.0) * 1.3,
            totalProfit: (kpis?.totalProfit || 50000000) * 1.4,
            riskLevel: 'low' as const
          },
          {
            name: 'Pessimistic',
            type: 'pessimistic' as const,
            irr: (kpis?.irr || 15.0) * 0.7,
            totalProfit: (kpis?.totalProfit || 50000000) * 0.6,
            riskLevel: 'high' as const
          }
        ];

        // Fetch milestones
        const { data: milestones } = await supabase
          .from('project_milestones')
          .select('*')
          .eq('project_id', projectId)
          .order('target_date', { ascending: true });

        // Fetch contractors
        const { data: contractors } = await supabase
          .from('project_contractors')
          .select('*')
          .eq('project_id', projectId)
          .order('amount', { ascending: false });

        // Fetch insights notes
        const { data: insightsNotes } = await supabase
          .from('feasly_insights_notes')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Fetch comments as additional insights
        const { data: comments } = await supabase
          .from('feasly_comments')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        const userNotes = comments?.map(c => c.comment).join('\n\n') || undefined;

        const exportData: ExportData = {
          project: {
            id: project.id,
            name: project.name,
            description: project.description || undefined,
            project_ai_summary: project.project_ai_summary || undefined,
            currency_code: project.currency_code || 'AED',
            created_at: project.created_at,
            tags: project.tags || [],
            status: project.status || 'draft'
          },
          kpis,
          scenarios: scenarios && scenarios.length > 0 ? scenarios.map(s => ({
            name: s.name,
            type: s.is_base ? 'base' as const : 'optimistic' as const,
            irr: kpis?.irr || 15.0,
            totalProfit: kpis?.totalProfit || 50000000,
            riskLevel: 'medium' as const
          })) : mockScenarios,
          milestones: milestones || [],
          contractors: contractors || [],
          insights: {
            userNotes,
            generatedInsights: insightsNotes?.generated_insights
          },
          language: i18n.language as 'en' | 'ar',
          isRTL
        };

        return exportData;
      } catch (error) {
        console.error('Error fetching export data:', error);
        return null;
      }
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}