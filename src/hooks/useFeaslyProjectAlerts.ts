import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectAlert, generateProjectAlerts, ComplianceSettings } from "@/lib/alerts";
import { KPIResult } from "@/lib/forecast/engine";
import { useToast } from "@/hooks/use-toast";

interface DatabaseAlert {
  id: string;
  project_id: string;
  alert_type: string;
  title: string;
  body: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggered_at: string;
  resolved: boolean;
  resolved_at: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export function useFeaslyProjectAlerts(projectId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastGeneratedAt, setLastGeneratedAt] = useState<Date | null>(null);

  // Fetch alerts for project
  const {
    data: alerts,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['project-alerts', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feasly_alerts')
        .select('*')
        .eq('project_id', projectId)
        .order('triggered_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
        throw error;
      }

      return (data as DatabaseAlert[]).map(alert => ({
        ...alert,
        triggered_at: new Date(alert.triggered_at)
      }));
    },
    enabled: !!projectId
  });

  // Create alerts mutation
  const createAlerts = useMutation({
    mutationFn: async (newAlerts: ProjectAlert[]) => {
      if (newAlerts.length === 0) return [];

      const alertsData = newAlerts.map(alert => ({
        project_id: alert.project_id,
        alert_type: alert.alert_type,
        title: alert.title,
        body: alert.body,
        severity: alert.severity,
        triggered_at: alert.triggered_at.toISOString(),
        resolved: alert.resolved,
        metadata: alert.metadata || {}
      }));

      const { data, error } = await supabase
        .from('feasly_alerts')
        .insert(alertsData)
        .select();

      if (error) {
        console.error('Error creating alerts:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-alerts', projectId] });
      if (data && data.length > 0) {
        toast({
          title: "Alerts Generated",
          description: `${data.length} new alert${data.length > 1 ? 's' : ''} generated for project review.`,
        });
      }
    },
    onError: (error) => {
      console.error('Error in alerts creation:', error);
      toast({
        title: "Alert Generation Failed",
        description: "Could not generate project alerts. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Resolve alert mutation
  const resolveAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('feasly_alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        console.error('Error resolving alert:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-alerts', projectId] });
      toast({
        title: "Alert Resolved",
        description: "Alert has been marked as resolved.",
      });
    },
    onError: (error) => {
      console.error('Error resolving alert:', error);
      toast({
        title: "Resolution Failed",
        description: "Could not resolve alert. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete alert mutation
  const deleteAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('feasly_alerts')
        .delete()
        .eq('id', alertId);

      if (error) {
        console.error('Error deleting alert:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-alerts', projectId] });
      toast({
        title: "Alert Deleted",
        description: "Alert has been removed.",
      });
    },
    onError: (error) => {
      console.error('Error deleting alert:', error);
      toast({
        title: "Delete Failed",
        description: "Could not delete alert. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Generate new alerts based on current project state
  const generateAlerts = useCallback(async (
    project: any,
    kpis: KPIResult,
    compliance: ComplianceSettings
  ) => {
    try {
      // Generate alert recommendations
      const newAlerts = generateProjectAlerts(project, kpis, compliance);
      
      // Filter out alerts that are similar to existing unresolved ones
      const existingAlerts = alerts || [];
      const unresolvedAlerts = existingAlerts.filter(alert => !alert.resolved);
      
      const uniqueNewAlerts = newAlerts.filter(newAlert => {
        return !unresolvedAlerts.some(existing => 
          existing.alert_type === newAlert.alert_type &&
          existing.severity === newAlert.severity
        );
      });

      if (uniqueNewAlerts.length > 0) {
        await createAlerts.mutateAsync(uniqueNewAlerts);
        setLastGeneratedAt(new Date());
      }

      return uniqueNewAlerts;
    } catch (error) {
      console.error('Error generating alerts:', error);
      throw error;
    }
  }, [alerts, createAlerts]);

  // Auto-generate alerts when KPIs change significantly
  const autoGenerateAlerts = useCallback(async (
    project: any,
    kpis: KPIResult,
    compliance: ComplianceSettings
  ) => {
    // Only auto-generate if it's been more than 24 hours since last generation
    if (lastGeneratedAt && (Date.now() - lastGeneratedAt.getTime()) < 24 * 60 * 60 * 1000) {
      return;
    }

    return generateAlerts(project, kpis, compliance);
  }, [generateAlerts, lastGeneratedAt]);

  // Get alert counts by severity
  const getAlertCounts = useCallback(() => {
    if (!alerts) return { total: 0, critical: 0, high: 0, medium: 0, low: 0, resolved: 0 };

    return alerts.reduce((counts, alert) => {
      counts.total++;
      if (alert.resolved) {
        counts.resolved++;
      } else {
        counts[alert.severity]++;
      }
      return counts;
    }, { total: 0, critical: 0, high: 0, medium: 0, low: 0, resolved: 0 });
  }, [alerts]);

  // Get unresolved alerts
  const getUnresolvedAlerts = useCallback(() => {
    return (alerts || []).filter(alert => !alert.resolved);
  }, [alerts]);

  return {
    alerts: alerts || [],
    isLoading,
    error,
    refetch,
    generateAlerts,
    autoGenerateAlerts,
    resolveAlert: resolveAlert.mutate,
    deleteAlert: deleteAlert.mutate,
    isGenerating: createAlerts.isPending,
    isResolving: resolveAlert.isPending,
    isDeleting: deleteAlert.isPending,
    getAlertCounts,
    getUnresolvedAlerts,
    lastGeneratedAt
  };
}