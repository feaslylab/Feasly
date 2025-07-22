import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export interface ProjectVersion {
  id: string;
  project_id: string;
  version_label: string;
  is_latest: boolean;
  created_at: string;
  created_by?: string;
  version_notes?: string;
  scenario_types: string[];
  kpi_snapshot?: {
    irr: number;
    roi: number;
    totalProfit: number;
    totalRevenue: number;
    totalCost: number;
  };
}

export interface VersionComparison {
  baseVersion: ProjectVersion;
  compareVersion: ProjectVersion;
  differences: {
    irr: { base: number; compare: number; change: number; changePercent: number };
    roi: { base: number; compare: number; change: number; changePercent: number };
    totalProfit: { base: number; compare: number; change: number; changePercent: number };
    totalRevenue: { base: number; compare: number; change: number; changePercent: number };
    totalCost: { base: number; compare: number; change: number; changePercent: number };
  };
}

export function useProjectVersions(projectId: string) {
  return useQuery({
    queryKey: ['project-versions', projectId],
    queryFn: async (): Promise<ProjectVersion[]> => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('feasly_versions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching project versions:', error);
        throw error;
      }

      return data as ProjectVersion[];
    },
    enabled: !!projectId,
  });
}

export function useLatestVersion(projectId: string) {
  return useQuery({
    queryKey: ['latest-version', projectId],
    queryFn: async (): Promise<ProjectVersion | null> => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from('feasly_versions')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_latest', true)
        .single();

      if (error) {
        console.error('Error fetching latest version:', error);
        return null;
      }

      return data as ProjectVersion;
    },
    enabled: !!projectId,
  });
}

export function useVersionComparison() {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({
      baseVersionId,
      compareVersionId
    }: {
      baseVersionId: string;
      compareVersionId: string;
    }): Promise<VersionComparison> => {
      // Fetch both versions
      const { data: versions, error } = await supabase
        .from('feasly_versions')
        .select('*')
        .in('id', [baseVersionId, compareVersionId]);

      if (error || !versions || versions.length !== 2) {
        throw new Error('Could not fetch versions for comparison');
      }

      const baseVersion = versions.find(v => v.id === baseVersionId) as ProjectVersion;
      const compareVersion = versions.find(v => v.id === compareVersionId) as ProjectVersion;

      if (!baseVersion.kpi_snapshot || !compareVersion.kpi_snapshot) {
        throw new Error('KPI data not available for comparison');
      }

      // Calculate differences
      const calculateChange = (base: number, compare: number) => ({
        base,
        compare,
        change: compare - base,
        changePercent: base !== 0 ? ((compare - base) / base) * 100 : 0
      });

      const differences = {
        irr: calculateChange(baseVersion.kpi_snapshot.irr, compareVersion.kpi_snapshot.irr),
        roi: calculateChange(baseVersion.kpi_snapshot.roi, compareVersion.kpi_snapshot.roi),
        totalProfit: calculateChange(baseVersion.kpi_snapshot.totalProfit, compareVersion.kpi_snapshot.totalProfit),
        totalRevenue: calculateChange(baseVersion.kpi_snapshot.totalRevenue, compareVersion.kpi_snapshot.totalRevenue),
        totalCost: calculateChange(baseVersion.kpi_snapshot.totalCost, compareVersion.kpi_snapshot.totalCost),
      };

      return {
        baseVersion,
        compareVersion,
        differences
      };
    },
  });
}

export function useVersionRestore() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      versionId,
      newVersionLabel
    }: {
      projectId: string;
      versionId: string;
      newVersionLabel: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // First, mark all existing versions as not latest
      const { error: updateError } = await supabase
        .from('feasly_versions')
        .update({ is_latest: false })
        .eq('project_id', projectId);

      if (updateError) throw updateError;

      // Get the version to restore
      const { data: versionToRestore, error: fetchError } = await supabase
        .from('feasly_versions')
        .select('*')
        .eq('id', versionId)
        .single();

      if (fetchError || !versionToRestore) throw new Error('Version not found');

      // Create new version based on the restored one
      const { data: newVersion, error: createError } = await supabase
        .from('feasly_versions')
        .insert({
          project_id: projectId,
          version_label: newVersionLabel,
          is_latest: true,
          created_by: user.id,
          version_notes: `Restored from ${versionToRestore.version_label}`,
          scenario_types: versionToRestore.scenario_types,
          kpi_snapshot: versionToRestore.kpi_snapshot
        })
        .select()
        .single();

      if (createError) throw createError;

      return newVersion;
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['project-versions', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['latest-version', variables.projectId] });
    },
  });
}

export function useCreateVersion() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      versionLabel,
      versionNotes,
      scenarioTypes,
      kpiSnapshot
    }: {
      projectId: string;
      versionLabel: string;
      versionNotes?: string;
      scenarioTypes: string[];
      kpiSnapshot: any;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Mark all existing versions as not latest
      const { error: updateError } = await supabase
        .from('feasly_versions')
        .update({ is_latest: false })
        .eq('project_id', projectId);

      if (updateError) throw updateError;

      // Create new version
      const { data: newVersion, error: createError } = await supabase
        .from('feasly_versions')
        .insert({
          project_id: projectId,
          version_label: versionLabel,
          is_latest: true,
          created_by: user.id,
          version_notes: versionNotes,
          scenario_types: scenarioTypes,
          kpi_snapshot: kpiSnapshot
        })
        .select()
        .single();

      if (createError) throw createError;

      return newVersion;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-versions', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['latest-version', variables.projectId] });
    },
  });
}