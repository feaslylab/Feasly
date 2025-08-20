import { useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { LayoutDashboard, FolderOpen, Calculator, BarChart3, Play } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProjectStore } from "@/hooks/useProjectStore";
import { useScenarioStore } from "@/hooks/useScenarioStore";
import { useSelectionStore } from "@/state/selectionStore";
import { useAlerts } from "@/hooks/useAlerts";
import { Button } from "@/components/ui/button";
import AlertDrawer from "@/components/dashboard/AlertDrawer";
import { exportModel } from "@/api/exportModel";
import NewScenarioDialog from '@/components/modals/NewScenarioDialog';
import ScenarioRenameDialog from '@/components/modals/ScenarioRenameDialog';
import GlobalActions from "@/components/layout/GlobalActions";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import ScenarioPickerV2 from "@/components/ui/ScenarioPickerV2";
import ViewSwitch from '@/components/layout/ViewSwitch';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { TM } from "@/components/ui/trademark";
import { PATHS } from '@/routes/paths';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    label: 'Dashboard',
    href: PATHS.dashboard,
    icon: LayoutDashboard,
  },
  {
    label: 'Projects',
    href: PATHS.projects,
    icon: FolderOpen,
  },
  {
    label: 'Model',
    href: PATHS.model,
    icon: Calculator,
  },
  {
    label: 'Portfolio',
    href: PATHS.portfolio,
    icon: BarChart3,
  },
  {
    label: 'Demo',
    href: PATHS.demo,
    icon: Play,
  },
];

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
  const location = useLocation();

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

  const isActive = (href: string) => {
    if (href === PATHS.dashboard) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          {/* Left Section - Logo and Navigation */}
          <div className="flex items-center gap-6">
            {/* Feasly Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="relative w-7 h-7 flex-shrink-0">
                {/* Light mode logo */}
                <img 
                  src="/lovable-uploads/89cbafc3-6eb7-4543-a767-15db07676b80.png" 
                  alt="Feasly Logo" 
                  className="w-7 h-7 object-contain block dark:hidden"
                />
                {/* Dark mode logo with white backing */}
                <div className="hidden dark:block absolute inset-0">
                  <div className="absolute inset-0 rounded-full bg-white" />
                  <img 
                    src="/lovable-uploads/89cbafc3-6eb7-4543-a767-15db07676b80.png" 
                    alt="Feasly Logo - Dark" 
                    className="relative w-7 h-7 object-contain"
                  />
                </div>
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight font-playfair hidden sm:block">
                Feasly<TM />
              </span>
            </div>
            
            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      active 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Right Section - Controls and Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              <Breadcrumbs />
            </div>
            <div className="hidden lg:block">
              <ScenarioPickerV2
                value={{ projectId, scenarioId }}
                onChange={({ projectId: pId, scenarioId: sId }) => {
                  setProject(pId);
                  setScenario(sId);
                }}
                className="w-64"
                baseRoute="dashboard"
              />
            </div>
            {/* Mobile scenario picker button */}
            <div className="lg:hidden">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setNewScenarioOpen(true)}
                className="h-8"
              >
                <span className="text-xs">Project & Scenario</span>
              </Button>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <ViewSwitch />
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            <GlobalActions onAlertsClick={() => setAlertDrawerOpen(true)} />
          </div>
        </div>
      </header>

      {/* Modals and Drawers */}
      <AlertDrawer 
        isOpen={alertDrawerOpen} 
        onClose={() => setAlertDrawerOpen(false)} 
      />

      <NewScenarioDialog
        open={newScenarioOpen}
        onClose={() => setNewScenarioOpen(false)}
        onCreate={async (name) => {
          const s = await create(name);
          if (s) {
            setScenario(s.id);
            setCurrent(s);
            reload();
            return true;
          }
          return false;
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background border rounded-lg shadow-lg max-w-md mx-4 p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Delete Scenario</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-sm mb-6">
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
    </>
  );
}