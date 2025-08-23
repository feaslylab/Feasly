import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useEngine } from "@/lib/engine/EngineContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FeaslyModel from "@/components/FeaslyModel/FeaslyModel";
import { useConsolidation } from "@/hooks/useConsolidation";
import { ConsolidatedResultsPanel } from "@/components/consolidation/ConsolidatedResultsPanel";
import { ConsolidationSettingsDialog } from "@/components/consolidation/ConsolidationSettingsDialog";
import { Building2, AlertCircle } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  currency_code: string;
  start_date: string | null;
  status: string;
}

export default function ModelPage() {
  const [searchParams] = useSearchParams();
  const { setInputs } = useEngine();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const projectId = searchParams.get('project');
  const scenarioId = searchParams.get('scenario');

  // Consolidation hook
  const {
    isConsolidationProject,
    consolidatedResult,
    consolidationSettings,
    updateConsolidationSettings,
    isUpdatingSettings,
    isLoading: consolidationLoading
  } = useConsolidation({ projectId: projectId || '', enabled: !!projectId });

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId]);

  const fetchProject = async (id: string) => {
    try {
      setProjectLoading(true);
      setProjectError(null);
      
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, currency_code, start_date, status')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Project not found');
        }
        throw error;
      }

      setProject(data);
      
      // Seed the engine with project data
      if (setInputs) {
        setInputs((prevInputs: any) => ({
          ...prevInputs,
          project: {
            ...prevInputs.project,
            start_date: data.start_date || new Date().toISOString().slice(0, 10),
            periods: prevInputs.project?.periods || 60,
            periodicity: prevInputs.project?.periodicity || 'monthly',
          },
        }));
      }
      
    } catch (error: any) {
      console.error('Error fetching project:', error);
      setProjectError(error.message);
      toast({
        title: "Project Load Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProjectLoading(false);
    }
  };

  // Show loading state
  if (projectLoading || consolidationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Building2 className="h-8 w-8 animate-pulse mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (projectError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{projectError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render consolidation interface if this is a consolidation project
  if (isConsolidationProject && consolidatedResult && consolidationSettings) {
    return (
      <div className="min-h-screen">
        <ConsolidatedResultsPanel
          result={consolidatedResult}
          onChildProjectClick={(projectId) => {
            window.location.href = `/model?project=${projectId}`;
          }}
          onSettingsClick={() => setSettingsDialogOpen(true)}
        />
        
        <ConsolidationSettingsDialog
          open={settingsDialogOpen}
          onClose={() => setSettingsDialogOpen(false)}
          settings={consolidationSettings}
          onSave={(newSettings) => {
            updateConsolidationSettings(newSettings);
          }}
          isLoading={isUpdatingSettings}
        />
      </div>
    );
  }

  // Otherwise render standard model interface
  return (
    <div className="min-h-screen">
      {/* Main Model Interface - Full Height */}
      <FeaslyModel />
    </div>
  );
}