import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReportOptions {
  reportType?: 'standard' | 'detailed';
}

interface UseReportGenerationResult {
  generateReport: (projectId: string, scenarioId: string, options?: ReportOptions) => Promise<string>;
  isGenerating: boolean;
  error: string | null;
}

export function useReportGeneration(): UseReportGenerationResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateReport = useCallback(async (
    projectId: string, 
    scenarioId: string,
    options: ReportOptions = {}
  ): Promise<string> => {
    if (!projectId || !scenarioId) {
      throw new Error('Project ID and scenario ID are required');
    }

    setIsGenerating(true);
    setError(null);

    try {
      toast({
        title: 'Generating Report',
        description: 'Creating PDF report, this may take a moment...',
      });

      const { data, error } = await supabase.functions.invoke('report', {
        body: {
          projectId,
          scenarioId,
          reportType: options.reportType || 'standard'
        }
      });

      if (error) {
        throw error;
      }

      if (!data || !data.reportUrl) {
        throw new Error('Invalid response format');
      }

      if (data.cached) {
        toast({
          title: 'Report Ready',
          description: 'Using cached report from previous generation',
        });
      } else {
        toast({
          title: 'Report Generated',
          description: 'Your PDF report is ready for download',
        });
      }

      return data.reportUrl;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: 'Generation Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  return {
    generateReport,
    isGenerating,
    error
  };
}