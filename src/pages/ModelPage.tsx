import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useEngine } from "@/lib/engine/EngineContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FeaslyModel from "@/components/FeaslyModel/FeaslyModel";
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

  const projectId = searchParams.get('project');
  const scenarioId = searchParams.get('scenario');

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

  return (
    <div className="min-h-screen">
      {/* Project Banner */}
      {projectId && (
        <div className="border-b bg-muted/30 px-6 py-3">
          {projectLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-5 w-48" />
            </div>
          ) : projectError ? (
            <Alert variant="destructive" className="max-w-2xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {projectError}
              </AlertDescription>
            </Alert>
          ) : project ? (
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Loaded project:</span>
              <span className="text-primary font-semibold">{project.name}</span>
              {project.currency_code && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">currency {project.currency_code}</span>
                </>
              )}
              {scenarioId && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">scenario {scenarioId}</span>
                </>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Main Model Interface */}
      <FeaslyModel />
    </div>
  );
}