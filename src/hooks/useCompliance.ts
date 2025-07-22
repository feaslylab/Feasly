import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EscrowConfig, ZakatConfig, EscrowRelease, ZakatCalculation } from '@/lib/compliance/calculations';

export interface ComplianceSettings {
  escrow: EscrowConfig;
  zakat: ZakatConfig;
}

export const useCompliance = (projectId: string) => {
  const [settings, setSettings] = useState<ComplianceSettings>({
    escrow: {
      enabled: false,
      percentage: 20.0,
      triggerType: 'construction_percent',
      triggerDetails: '',
      releaseThreshold: 75.0
    },
    zakat: {
      applicable: false,
      rate: 2.5,
      calculationMethod: 'net_profit',
      excludeLosses: true
    }
  });
  const [escrowReleases, setEscrowReleases] = useState<EscrowRelease[]>([]);
  const [zakatCalculations, setZakatCalculations] = useState<ZakatCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch compliance settings from project
  const fetchComplianceSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select(`
          escrow_enabled,
          escrow_percent,
          release_trigger_type,
          release_rule_details,
          release_threshold,
          zakat_applicable,
          zakat_rate_percent,
          zakat_calculation_method,
          zakat_exclude_losses
        `)
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      if (project) {
        setSettings({
          escrow: {
            enabled: project.escrow_enabled || false,
            percentage: project.escrow_percent || 20.0,
            triggerType: (project.release_trigger_type as 'construction_percent' | 'month_based' | 'milestone_based') || 'construction_percent',
            triggerDetails: project.release_rule_details || '',
            releaseThreshold: project.release_threshold || 75.0
          },
          zakat: {
            applicable: project.zakat_applicable || false,
            rate: project.zakat_rate_percent || 2.5,
            calculationMethod: (project.zakat_calculation_method as 'net_profit' | 'gross_revenue' | 'asset_value') || 'net_profit',
            excludeLosses: project.zakat_exclude_losses !== false
          }
        });
      }
    } catch (err) {
      console.error('Error fetching compliance settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch compliance settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Update compliance settings
  const updateComplianceSettings = async (newSettings: Partial<ComplianceSettings>) => {
    try {
      const updates: any = {};

      if (newSettings.escrow) {
        updates.escrow_enabled = newSettings.escrow.enabled;
        updates.escrow_percent = newSettings.escrow.percentage;
        updates.release_trigger_type = newSettings.escrow.triggerType;
        updates.release_rule_details = newSettings.escrow.triggerDetails;
        updates.release_threshold = newSettings.escrow.releaseThreshold;
      }

      if (newSettings.zakat) {
        updates.zakat_applicable = newSettings.zakat.applicable;
        updates.zakat_rate_percent = newSettings.zakat.rate;
        updates.zakat_calculation_method = newSettings.zakat.calculationMethod;
        updates.zakat_exclude_losses = newSettings.zakat.excludeLosses;
      }

      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId);

      if (error) throw error;

      setSettings(prev => ({
        escrow: { ...prev.escrow, ...newSettings.escrow },
        zakat: { ...prev.zakat, ...newSettings.zakat }
      }));

      toast({
        title: 'Compliance Settings Updated',
        description: 'Your compliance settings have been saved successfully.',
      });
    } catch (err) {
      console.error('Error updating compliance settings:', err);
      toast({
        title: 'Error',
        description: 'Failed to update compliance settings. Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Fetch escrow releases
  const fetchEscrowReleases = async () => {
    try {
      const { data, error } = await supabase
        .from('escrow_releases')
        .select('*')
        .eq('project_id', projectId)
        .order('release_date');

      if (error) throw error;

      if (data) {
        const releases: EscrowRelease[] = data.map(release => ({
          id: release.id,
          projectId: release.project_id,
          releaseDate: new Date(release.release_date),
          releaseAmount: release.release_amount,
          releasePercentage: release.release_percentage,
          triggerType: release.trigger_type,
          triggerDetails: release.trigger_details || '',
          constructionProgress: release.construction_progress_percent,
          milestoneAchieved: release.milestone_achieved,
          isProjected: release.is_projected
        }));
        setEscrowReleases(releases);
      }
    } catch (err) {
      console.error('Error fetching escrow releases:', err);
    }
  };

  // Fetch zakat calculations
  const fetchZakatCalculations = async () => {
    try {
      const { data, error } = await supabase
        .from('zakat_calculations')
        .select('*')
        .eq('project_id', projectId)
        .order('period_start', { ascending: false });

      if (error) throw error;

      if (data) {
        const calculations: ZakatCalculation[] = data.map(calc => ({
          id: calc.id,
          projectId: calc.project_id,
          period: calc.calculation_period,
          periodStart: new Date(calc.period_start),
          periodEnd: new Date(calc.period_end),
          taxableBase: calc.taxable_base,
          zakatRate: calc.zakat_rate,
          zakatAmount: calc.zakat_amount,
          calculationMethod: calc.calculation_method,
          adjustments: (calc.adjustments as Record<string, any>) || {},
          isFinal: calc.is_final
        }));
        setZakatCalculations(calculations);
      }
    } catch (err) {
      console.error('Error fetching zakat calculations:', err);
    }
  };

  // Add escrow release
  const addEscrowRelease = async (release: Omit<EscrowRelease, 'id' | 'projectId'>) => {
    try {
      const { data, error } = await supabase
        .from('escrow_releases')
        .insert([{
          project_id: projectId,
          release_date: release.releaseDate.toISOString().split('T')[0],
          release_amount: release.releaseAmount,
          release_percentage: release.releasePercentage,
          trigger_type: release.triggerType,
          trigger_details: release.triggerDetails,
          construction_progress_percent: release.constructionProgress,
          milestone_achieved: release.milestoneAchieved,
          is_projected: release.isProjected
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newRelease: EscrowRelease = {
          id: data.id,
          projectId: data.project_id,
          releaseDate: new Date(data.release_date),
          releaseAmount: data.release_amount,
          releasePercentage: data.release_percentage,
          triggerType: data.trigger_type,
          triggerDetails: data.trigger_details || '',
          constructionProgress: data.construction_progress_percent,
          milestoneAchieved: data.milestone_achieved,
          isProjected: data.is_projected
        };
        setEscrowReleases(prev => [...prev, newRelease].sort((a, b) => a.releaseDate.getTime() - b.releaseDate.getTime()));
        
        toast({
          title: 'Escrow Release Added',
          description: 'Escrow release has been scheduled successfully.',
        });
      }

      return data;
    } catch (err) {
      console.error('Error adding escrow release:', err);
      toast({
        title: 'Error',
        description: 'Failed to add escrow release. Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Add zakat calculation
  const addZakatCalculation = async (calculation: Omit<ZakatCalculation, 'id' | 'projectId'>) => {
    try {
      const { data, error } = await supabase
        .from('zakat_calculations')
        .insert([{
          project_id: projectId,
          calculation_period: calculation.period,
          period_start: calculation.periodStart.toISOString().split('T')[0],
          period_end: calculation.periodEnd.toISOString().split('T')[0],
          taxable_base: calculation.taxableBase,
          zakat_rate: calculation.zakatRate,
          zakat_amount: calculation.zakatAmount,
          calculation_method: calculation.calculationMethod,
          adjustments: calculation.adjustments,
          is_final: calculation.isFinal
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newCalculation: ZakatCalculation = {
          id: data.id,
          projectId: data.project_id,
          period: data.calculation_period,
          periodStart: new Date(data.period_start),
          periodEnd: new Date(data.period_end),
          taxableBase: data.taxable_base,
          zakatRate: data.zakat_rate,
          zakatAmount: data.zakat_amount,
          calculationMethod: data.calculation_method,
          adjustments: (data.adjustments as Record<string, any>) || {},
          isFinal: data.is_final
        };
        setZakatCalculations(prev => [newCalculation, ...prev]);
        
        toast({
          title: 'Zakat Calculation Added',
          description: 'Zakat calculation has been recorded successfully.',
        });
      }

      return data;
    } catch (err) {
      console.error('Error adding zakat calculation:', err);
      toast({
        title: 'Error',
        description: 'Failed to add zakat calculation. Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchComplianceSettings();
      fetchEscrowReleases();
      fetchZakatCalculations();
    }
  }, [projectId]);

  return {
    settings,
    escrowReleases,
    zakatCalculations,
    isLoading,
    error,
    updateComplianceSettings,
    addEscrowRelease,
    addZakatCalculation,
    refetch: () => {
      fetchComplianceSettings();
      fetchEscrowReleases();
      fetchZakatCalculations();
    }
  };
};