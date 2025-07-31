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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm">
      <div className="flex items-center justify-between h-14 pl-20 lg:pl-20 pr-6">
        {/* Left side - Logo and utility controls */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
            <img 
              src="/lovable-uploads/c54aee74-e595-47d1-9bf8-b8efef6fae7d.png" 
              alt="Feasly Logo" 
              className="w-7 h-7 object-contain"
            />
          </div>
          <span className="text-xl font-bold text-foreground">Feasly</span>
          <div className="flex items-center gap-1 ml-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>

        {/* Centered selectors */}
        <div className="flex items-center gap-4">
          {/* ─ Project selector ───────────────────────────────── */}
          <Menu as="div" className="relative">
            <Menu.Button className="inline-flex items-center justify-center rounded-md text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              {projects.find(p=>p.id===projectId)?.name ?? "Select project"}
            </Menu.Button>
        <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left divide-y divide-gray-100 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[100]">
          <div className="px-1 py-1 bg-white dark:bg-gray-800">
            {projects.map(p=>(
              <Menu.Item key={p.id}>
                {({active})=>(
                  <button 
                    className={`${
                      active ? 'bg-violet-500 text-white' : 'text-gray-900'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    onClick={()=>{ setProject(p.id); setCurrent(null); }}
                  >
                    {p.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Menu>

          {/* ─ Scenario selector ─────────────────────────────── */}
          <Menu as="div" className="relative">
            <Menu.Button
              className="inline-flex items-center justify-center rounded-md text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-muted/50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              disabled={!projectId}
            >
              <span>{scenarios.find(s=>s.id===scenarioId)?.name ?? "Select scenario"}</span>
              <svg className="ml-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Menu.Button>
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-1 py-1">
            {scenarios.map(s=>(
              <Menu.Item key={s.id}>
                {({active})=>(
                  <button 
                    className={`${
                      active ? 'bg-violet-500 text-white' : 'text-gray-900'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    onClick={()=>{ setScenario(s.id); setCurrent(s); }}
                  >
                    {s.name}
                  </button>
                )}
              </Menu.Item>
            ))}
            
            {scenarioId && (
              <>
                <div className="border-t border-gray-200 my-1"></div>
                <Menu.Item>
                  {({ active }) => (
                    <button 
                      className={`${
                        active ? 'bg-violet-500 text-white' : 'text-gray-900'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      onClick={() => {
                        setSelectedScenarioForAction(scenarioId);
                        setRenameScenarioOpen(true);
                      }}
                    >
                      Rename scenario…
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button 
                      className={`${
                        active ? 'bg-red-500 text-white' : 'text-red-600'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      onClick={() => {
                        setSelectedScenarioForAction(scenarioId);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      Delete…
                    </button>
                  )}
                </Menu.Item>
                <div className="border-t border-gray-200 my-1"></div>
              </>
            )}
            
            <Menu.Item>
              {({ active }) => (
                <button 
                  className={`${
                    active ? 'bg-violet-500 text-white' : 'text-gray-900'
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  onClick={() => setNewScenarioOpen(true)}
                >
                  + New scenario
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
          </Menu>
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

      {/* Delete confirmation dialog */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg p-6 max-w-sm mx-4 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Delete Scenario</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete "{scenarios.find(s => s.id === selectedScenarioForAction)?.name}"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
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
                    // If we deleted the current scenario, clear selection
                    if (selectedScenarioForAction === scenarioId) {
                      setScenario('');
                    }
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}