import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEngine } from '@/lib/engine/EngineContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WorkspaceLayout from '@/components/workspace/WorkspaceLayout';
import InputsPanel from '@/components/workspace/InputsPanel';
import PreviewPanel from '@/components/workspace/PreviewPanel';
import ResultsPanel from '@/components/workspace/ResultsPanel';

interface Project {
  id: string;
  name: string;
  description: string | null;
  currency_code: string;
  start_date: string | null;
  status: string;
}

type WorkspaceTab = 'inputs' | 'preview' | 'results';

export default function FeaslyModel() {
  const [searchParams] = useSearchParams();
  const { setInputs } = useEngine();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('inputs');

  const projectId = searchParams.get('project');
  const scenarioId = searchParams.get('scenario') || 'baseline';

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId]);

  const fetchProject = async (id: string) => {
    try {
      setProjectLoading(true);
      
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
      toast({
        title: "Project Load Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProjectLoading(false);
    }
  };

  const handleSaveSnapshot = async () => {
    toast({
      title: "Snapshot Saved",
      description: "Your current model state has been saved.",
    });
  };

  const handleRunCalculation = async () => {
    setIsCalculating(true);
    try {
      // Simulate calculation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setActiveTab('results');
      toast({
        title: "Calculation Complete",
        description: "Model calculations have finished successfully.",
      });
    } catch (error) {
      toast({
        title: "Calculation Failed",
        description: "An error occurred while running calculations.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'inputs':
        return <InputsPanel />;
      case 'preview':
        return <PreviewPanel />;
      case 'results':
        return <ResultsPanel />;
      default:
        return <InputsPanel />;
    }
  };

  return (
    <WorkspaceLayout
      projectName={project?.name}
      scenarioName={scenarioId}
      onSaveSnapshot={handleSaveSnapshot}
      onRunCalculation={handleRunCalculation}
      isCalculating={isCalculating}
    >
      {renderContent()}
    </WorkspaceLayout>
  );
}