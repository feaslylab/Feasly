import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEngine, useEngineNumbers } from '@/lib/engine/EngineContext';
import { useAutosave } from '@/lib/autosave/useAutosave';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { inputs, setInputs } = useEngine();
  const numbers = useEngineNumbers();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [previewBlocksRun, setPreviewBlocksRun] = useState(false);
  const [draftConflict, setDraftConflict] = useState<string | null>(null);

  const projectId = searchParams.get('project');
  const scenarioId = searchParams.get('scenario') || 'baseline';
  const tabFromUrl = searchParams.get('tab') as WorkspaceTab | null;
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(tabFromUrl || 'inputs');

  // AUTOSAVE (local)
  const { status: saveStatus, savedAt, forceSave } = useAutosave(projectId, inputs);

  // Handle tab changes with URL persistence
  const handleTabChange = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams, { replace: true });
  };

  // Reset to baseline inputs
  const handleResetToBaseline = () => {
    if (setInputs) {
      setInputs({
        project: { 
          start_date: new Date().toISOString().slice(0, 10), 
          periods: 60,
          periodicity: 'monthly'
        },
        unit_types: [],
        cost_items: [],
        debt: []
      });
      toast({ title: 'Reset to Baseline', description: 'Inputs have been reset to default values.' });
    }
  };

  // Check for newer drafts from other tabs
  useEffect(() => {
    if (!projectId) return;
    
    const checkForNewerDraft = () => {
      try {
        const stored = localStorage.getItem(`draft:${projectId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          const storedTime = parsed?.savedAt || 0;
          const currentTime = Date.now();
          
          // If draft is newer than 10 seconds ago and we haven't seen this conflict
          if (storedTime > currentTime - 10000 && storedTime > (savedAt || 0) && !draftConflict) {
            setDraftConflict(stored);
          }
        }
      } catch (e) {
        // ignore
      }
    };

    const interval = setInterval(checkForNewerDraft, 5000);
    return () => clearInterval(interval);
  }, [projectId, savedAt, draftConflict]);

  // Load newer draft
  const handleLoadNewerDraft = () => {
    if (draftConflict && setInputs) {
      try {
        const parsed = JSON.parse(draftConflict);
        setInputs(parsed.data);
        setDraftConflict(null);
        toast({ title: 'Draft Loaded', description: 'Newer draft has been loaded.' });
      } catch (e) {
        toast({ title: 'Load Error', description: 'Failed to load newer draft.', variant: 'destructive' });
      }
    }
  };

  // Instrument events
  const trackEvent = (event: string, data?: any) => {
    // Simple console logging for now - can be replaced with analytics
    console.log(`[Analytics] ${event}`, data);
  };

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

  // RUN
  const onRunCalculation = async () => {
    if (previewBlocksRun) return;
    setIsCalculating(true);
    trackEvent('run_model', { projectId, scenarioId });
    try {
      // engine recalcs on setInputs; we simulate a cycle for UX
      await new Promise((r) => setTimeout(r, 800));
      handleTabChange('results');
      toast({ title: 'Calculation Complete' });
    } catch (e: any) {
      trackEvent('run_model_error', { error: e?.message });
      toast({ title: 'Run failed', description: e?.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setIsCalculating(false);
    }
  };

  // SNAPSHOT
  const onSaveSnapshot = () => {
    const eq = numbers?.equity;
    const T = eq?.calls_total?.length ?? 0;
    const last = Math.max(0, T - 1);

    // For now, just save to localStorage - can be upgraded to DB later
    const snapshot = {
      id: crypto.randomUUID(),
      name: `Snapshot ${new Date().toLocaleString()}`,
      createdAt: new Date().toISOString(),
      inputs,
      summary: {
        irr_pa: eq?.kpis?.irr_pa ?? null,
        tvpi: Number(eq?.kpis?.tvpi ?? 0),
        dpi: Number(eq?.kpis?.dpi ?? 0),
        rvpi: Number(eq?.kpis?.rvpi ?? 0),
        moic: Number(eq?.kpis?.moic ?? 0),
        gp_clawback_last: Number(eq?.gp_clawback?.[last] ?? 0),
      },
      traces: {
        T,
        calls_total: (eq?.calls_total ?? []).map(Number),
        dists_total: (eq?.dists_total ?? []).map(Number),
        gp_promote: (eq?.gp_promote ?? []).map(Number),
        gp_clawback: (eq?.gp_clawback ?? []).map(Number),
      },
    };

    localStorage.setItem(`snapshot:${snapshot.id}`, JSON.stringify(snapshot));
    trackEvent('save_snapshot', { snapshotId: snapshot.id, projectId });
    toast({ title: 'Snapshot saved' });
  };

  // simple project title (optional, replace with fetched project name if you have it)
  const projectName = useMemo(() => project?.name || `Project ${projectId?.slice(0, 6) ?? '—'}`, [project?.name, projectId]);

  const renderContent = () => {
    switch (activeTab) {
      case 'inputs':
        return <InputsPanel />;
      case 'preview':
        return <PreviewPanel onBlockingChange={setPreviewBlocksRun} />;
      case 'results':
        return <ResultsPanel />;
      default:
        return <InputsPanel />;
    }
  };

  return (
    <>
      {draftConflict && (
        <div className="bg-amber-50 border-amber-200 border-b px-4 py-2 flex items-center justify-between text-sm">
          <span>Newer draft detected from another tab</span>
          <div className="flex gap-2">
            <button
              onClick={handleLoadNewerDraft}
              className="text-amber-700 underline hover:no-underline"
            >
              Load
            </button>
            <button
              onClick={() => setDraftConflict(null)}
              className="text-amber-700 underline hover:no-underline"
            >
              Ignore
            </button>
          </div>
        </div>
      )}
      
      <WorkspaceLayout
        projectName={projectName}
        scenarioName={scenarioId}
        onSaveSnapshot={onSaveSnapshot}
        onRunCalculation={onRunCalculation}
        onResetToBaseline={handleResetToBaseline}
        isCalculating={isCalculating}
        savedAt={savedAt}
        saveStatus={saveStatus}
        disableRun={previewBlocksRun}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        {renderContent()}
      </WorkspaceLayout>
    </>
  );
}