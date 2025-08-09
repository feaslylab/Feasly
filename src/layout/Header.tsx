import { useState } from "react";
import { Menu } from "@headlessui/react";
import { Bell, Download } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProjectStore } from "@/hooks/useProjectStore";
import { useScenarioStore } from "@/hooks/useScenarioStore";
import { useSelectionStore } from "@/state/selectionStore";
import { useAlerts } from "@/hooks/useAlerts";
import { Button } from "@/components/ui/button";
import AlertDrawer from "@/components/dashboard/AlertDrawer";
import { exportModel } from "@/api/exportModel";
import { CommentButton } from "@/components/collaboration/CommentButton";
import NewScenarioDialog from '@/components/modals/NewScenarioDialog';
import ScenarioRenameDialog from '@/components/modals/ScenarioRenameDialog';
import GlobalActions from "@/components/layout/GlobalActions";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export default function Header() {
  const { user } = useAuth();
  const { projects } = useProjectStore();
  const { projectId, setProject, scenarioId, setScenario } = useSelectionStore();
  const { scenarios, create, rename, remove, setCurrent, reload } = useScenarioStore(projectId);
  const { unreadCount } = useAlerts();
  const [alertDrawerOpen, setAlertDrawerOpen] = useState(false);
  const [newScenarioOpen, setNewScenarioOpen] = useState(false);
  const [renameScenarioOpen, setRenameScenarioOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedScenarioForAction, setSelectedScenarioForAction] = useState<string | null>(null);

  const handleExportZip = async () => {
    if (!projectId || !scenarioId) {
      alert('Please select a project and scenario first');
      return;
    }

    try {
      const zipBlob = await exportModel(projectId, scenarioId);
      
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `model-${projectId}-${scenarioId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    }
  };

  if (!import.meta.env.PROD) console.log('Header render - projectId:', projectId, 'scenarioId:', scenarioId);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 feasly-nav">
      <div className="flex items-center justify-between h-16 pl-20 lg:pl-20 pr-6">
        {/* Professional Logo and Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/4b3d51a1-21a0-4d40-a32f-16a402b2a939.png" 
              alt="Feasly Logo" 
              className="w-12 h-12 object-contain flex-shrink-0 block dark:hidden"
            />
            <img 
              src="/lovable-uploads/a2e32a9e-3370-4f4c-a261-6d08e8a7834a.png" 
              alt="Feasly Logo - Dark" 
              className="w-12 h-12 object-contain flex-shrink-0 hidden dark:block"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground tracking-tight">
                Feasly
                <sup className="text-[8px] ml-1 opacity-70 font-medium">™</sup>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
                Financial Modeling
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>

         {/* Right side - Global Actions */}
         <GlobalActions onAlertsClick={() => setAlertDrawerOpen(true)} />
       </div>

      <AlertDrawer 
        isOpen={alertDrawerOpen} 
        onClose={() => setAlertDrawerOpen(false)} 
      />

      <NewScenarioDialog
        open={newScenarioOpen}
        onClose={() => setNewScenarioOpen(false)}
        onCreate={async (name) => {
          const s = await create(name);      // comes from useScenarioStore
          if (s) {
            setScenario(s.id);               // selectionStore
            setCurrent(s);                   // local store
            reload();                        // refresh items
            return true;                     // success
          }
          return false;                      // failure → dialog stays open
        }}
      />

      <ScenarioRenameDialog
        open={renameScenarioOpen}
        onClose={() => {
          setRenameScenarioOpen(false);
          setSelectedScenarioForAction(null);
        }}
        currentName={scenarios.find(s => s.id === selectedScenarioForAction)?.name || ''}
        onRename={async (name) => {
          if (!selectedScenarioForAction) return false;
          const success = await rename(selectedScenarioForAction, name);
          if (success) {
            reload();
            return true;
          }
          return false;
        }}
      />

      {/* Professional Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="feasly-card max-w-md mx-4 p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="feasly-heading-3">Delete Scenario</h3>
                <p className="feasly-body-sm mt-1">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="feasly-body mb-6">
              Are you sure you want to delete <strong>"{scenarios.find(s => s.id === selectedScenarioForAction)?.name}"</strong>? 
              All associated data will be permanently removed.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setSelectedScenarioForAction(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!selectedScenarioForAction) return;
                  const success = await remove(selectedScenarioForAction);
                  if (success) {
                    setDeleteConfirmOpen(false);
                    setSelectedScenarioForAction(null);
                    reload();
                    if (selectedScenarioForAction === scenarioId) {
                      setScenario('');
                    }
                  }
                }}
              >
                Delete Scenario
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}