import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InsightItem {
  id: string;
  type: 'opportunity' | 'risk' | 'caution' | 'note';
  title: string;
  description: string;
  value?: string;
}

export interface FeaslyInsight {
  id: string;
  project_id: string;
  scenario: string;
  generated_insights?: InsightItem[];
  user_notes?: string;
  created_at: string;
  updated_at: string;
}

export const useFeaslyInsights = (projectId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch insights for a project
  const { data: insights = [], isLoading, error } = useQuery({
    queryKey: ['feasly-insights', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('feasly_insights_notes')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(item => ({
        ...item,
        generated_insights: (item.generated_insights as any) || []
      })) as FeaslyInsight[];
    },
    enabled: !!projectId
  });

  // Save or update insights
  const saveInsightsMutation = useMutation({
    mutationFn: async ({ 
      projectId, 
      scenario, 
      generatedInsights, 
      userNotes 
    }: {
      projectId: string;
      scenario: string;
      generatedInsights?: InsightItem[];
      userNotes?: string;
    }) => {
      // Check if record exists
      const { data: existing } = await supabase
        .from('feasly_insights_notes')
        .select('id')
        .eq('project_id', projectId)
        .eq('scenario', scenario)
        .maybeSingle();

      const payload = {
        project_id: projectId,
        scenario,
        generated_insights: generatedInsights as any,
        user_notes: userNotes,
      };

      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('feasly_insights_notes')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('feasly_insights_notes')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feasly-insights', projectId] });
      toast({
        title: "Success",
        description: "Insights saved successfully",
      });
    },
    onError: (error) => {
      console.error('Error saving insights:', error);
      toast({
        title: "Error",
        description: "Failed to save insights",
        variant: "destructive",
      });
    }
  });

  // Generate insights based on form data - memoized properly
  const generateInsights = useCallback((formData: any): Record<string, InsightItem[]> => {
    const insights: Record<string, InsightItem[]> = {};
    const scenarios = ['Base', 'Optimistic', 'Pessimistic'];

    scenarios.forEach(scenario => {
      const scenarioInsights: InsightItem[] = [];

      // Only generate insights if we have meaningful data
      if (!formData || Object.keys(formData).length === 0) {
        insights[scenario] = scenarioInsights;
        return;
      }

      // Example insight generation logic
      const totalRevenue = formData.assets?.reduce((sum: number, asset: any) => 
        sum + (asset.annual_revenue_aed || 0), 0) || 0;
      
      const totalCosts = formData.assets?.reduce((sum: number, asset: any) => 
        sum + (asset.construction_cost_aed || 0) + (asset.operating_cost_aed || 0), 0) || 0;

      const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;

      // Revenue insights
      if (totalRevenue > 1000000) {
        scenarioInsights.push({
          id: `revenue-${scenario}`,
          type: 'opportunity',
          title: 'Strong Revenue Potential',
          description: `Annual revenue of ${(totalRevenue / 1000000).toFixed(1)}M AED shows strong market potential`,
          value: `${(totalRevenue / 1000000).toFixed(1)}M AED`
        });
      }

      // Profit margin insights
      if (profitMargin > 20) {
        scenarioInsights.push({
          id: `margin-${scenario}`,
          type: 'opportunity',
          title: 'Healthy Profit Margins',
          description: `Profit margin of ${profitMargin.toFixed(1)}% indicates strong financial performance`,
          value: `${profitMargin.toFixed(1)}%`
        });
      } else if (profitMargin < 10 && profitMargin > 0) {
        scenarioInsights.push({
          id: `margin-${scenario}`,
          type: 'caution',
          title: 'Narrow Profit Margins',
          description: `Profit margin of ${profitMargin.toFixed(1)}% may indicate tight cost control needed`,
          value: `${profitMargin.toFixed(1)}%`
        });
      } else if (profitMargin <= 0 && totalRevenue > 0) {
        scenarioInsights.push({
          id: `margin-${scenario}`,
          type: 'risk',
          title: 'Negative Profitability',
          description: 'Current projections show negative profitability - review cost structure',
          value: `${profitMargin.toFixed(1)}%`
        });
      }

      // Zakat insights
      if (formData.zakat_applicable) {
        const zakatRate = formData.zakat_rate_percent || 2.5;
        scenarioInsights.push({
          id: `zakat-${scenario}`,
          type: 'caution',
          title: 'Zakat Compliance',
          description: `Zakat obligation at ${zakatRate}% will impact cash flow`,
          value: `${zakatRate}%`
        });
      }

      insights[scenario] = scenarioInsights;
    });

    return insights;
  }, []); // Empty dependency array is correct here - function is pure

  const saveInsights = saveInsightsMutation.mutate;
  const isSaving = saveInsightsMutation.isPending;

  return {
    insights,
    isLoading,
    error,
    saveInsights,
    isSaving,
    generateInsights
  };
};