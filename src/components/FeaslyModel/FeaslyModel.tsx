import { useEffect, useMemo, useState } from 'react';
import { FileBarChart2, BarChart3, Calculator, PieChart, Settings, History, LineChart } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEngine, useEngineNumbers } from '@/lib/engine/EngineContext';
import { useAutosave } from '@/lib/autosave/useAutosave';
import { useScenarioManager } from '@/hooks/useScenarioManager';
import { ScenarioSelector } from '@/components/scenarios/ScenarioSelector';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FLAGS } from '@/lib/flags';
import { useOnboardingTasks } from '@/lib/onboarding/tasks';
import WorkspaceLayout from '@/components/workspace/WorkspaceLayout';
import InputsPanel from '@/components/workspace/InputsPanel';
import PreviewPanel from '@/components/workspace/PreviewPanel';
import RevenuePreviewPanel from '@/components/workspace/preview/RevenuePreviewPanel';
import ExecutiveReportPanel from '@/components/workspace/ExecutiveReportPanel';
import ResultsPanel from '@/components/workspace/ResultsPanel';
import SnapshotHistoryPanel from '@/components/workspace/SnapshotHistoryPanel';
import PresetsPanel from '@/components/presets/PresetsPanel';
import InsightsDashboard from '@/components/workspace/InsightsDashboard';
import { PortfolioDashboard } from '@/components/portfolio/PortfolioDashboard';
import { OnboardingPanel } from '@/components/workspace/OnboardingPanel';
import { FirstRunOverlay } from '@/components/workspace/FirstRunOverlay';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface Project {
  id: string;
  name: string;
  description: string | null;
  currency_code: string;
  start_date: string | null;
  status: string;
}

type WorkspaceTab = 'inputs' | 'preview' | 'preview_revenue' | 'executive_report' | 'insights' | 'results' | 'snapshots' | 'presets' | 'portfolio';

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

  const projectId = searchParams.get('project') || 'default';
  const scenarioId = searchParams.get('scenario') || 'baseline';
  const tabFromUrl = searchParams.get('tab') as WorkspaceTab | null;
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(tabFromUrl || 'inputs');

  // Scenario management
  const scenarioManager = useScenarioManager(projectId);

  // Onboarding + checklist
  const { tasks, hasBlocking } = useOnboardingTasks();

  // AUTOSAVE (local) - now includes scenario isolation
  const { status: saveStatus, savedAt, forceSave } = useAutosave(projectId, scenarioManager.currentScenarioId, inputs);

  // Handle tab changes with URL persistence
  const handleTabChange = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams, { replace: true });
  };

  // Smooth scroll to Inputs section from query
  const section = searchParams.get('section');
  useEffect(() => {
    if (activeTab !== 'inputs') return;
    if (!section) return;
    const el = document.querySelector<HTMLElement>(`[data-section="${section}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeTab, section]);

  // Open checklist helper
  const openChecklist = () => {
    const p = new URLSearchParams(searchParams);
    p.set('tab', 'inputs');
    p.set('section', 'project');
    setSearchParams(p, { replace: true });
    console.log(`[Analytics] onboarding_open`, { source: 'header' });
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
        return (
          <ErrorBoundary name="InputsPanel">
            <InputsPanel />
          </ErrorBoundary>
        );
      case 'preview':
        return (
          <ErrorBoundary name="PreviewPanel">
            <PreviewPanel onBlockingChange={setPreviewBlocksRun} />
          </ErrorBoundary>
        );
      case 'preview_revenue':
        return (
          <ErrorBoundary name="RevenuePreviewPanel">
            <RevenuePreviewPanel />
          </ErrorBoundary>
        );
      case 'executive_report':
        return (
          <ErrorBoundary name="ExecutiveReportPanel">
            <ExecutiveReportPanel />
          </ErrorBoundary>
        );
      case 'insights':
        return (
          <ErrorBoundary name="InsightsDashboard">
            <InsightsDashboard />
          </ErrorBoundary>
        );
      case 'portfolio':
        return (
          <ErrorBoundary name="PortfolioDashboard">
            <PortfolioDashboard />
          </ErrorBoundary>
        );
      case 'results':
        return (
          <ErrorBoundary name="ResultsPanel">
            <ResultsPanel currency={project?.currency_code} />
          </ErrorBoundary>
        );
      case 'snapshots':
        return (
          <ErrorBoundary name="SnapshotHistoryPanel">
            <SnapshotHistoryPanel />
          </ErrorBoundary>
        );
      case 'presets':
        return (
          <ErrorBoundary name="PresetsPanel">
            <PresetsPanel />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary name="InputsPanel">
            <InputsPanel />
          </ErrorBoundary>
        );
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
        disableRun={hasBlocking}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenChecklist={FLAGS.onboardingChecklist ? openChecklist : undefined}
        scenarioSelector={
          <ScenarioSelector
            scenarios={scenarioManager.scenarios}
            currentScenario={scenarioManager.currentScenario}
            onScenarioChange={scenarioManager.switchScenario}
            onCreateScenario={scenarioManager.createNewScenario}
            onRenameScenario={scenarioManager.renameScenario}
            onDeleteScenario={(id: string) => {
              // Stub delete functionality - will be implemented in scenario manager
              toast({ title: 'Delete not implemented', description: 'Scenario deletion coming soon', variant: 'destructive' });
              return Promise.resolve(false);
            }}
          />
        }
      >
        <div className={FLAGS.onboardingChecklist ? "grid gap-6 lg:grid-cols-[1fr_320px]" : ""}>
          <div>{renderContent()}</div>
          {FLAGS.onboardingChecklist && <OnboardingPanel projectId={projectId} />}
        </div>
      </WorkspaceLayout>
      
      {FLAGS.onboardingChecklist && (
        <FirstRunOverlay projectId={projectId} onOpenChecklist={openChecklist} />
      )}
    </>
  );
}