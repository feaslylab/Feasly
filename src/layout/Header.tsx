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

export default function Header() {
  const { user } = useAuth();
  const { projects } = useProjectStore();
  const { projectId, setProject, scenarioId, setScenario } = useSelectionStore();
  const { scenarios, create, setCurrent } = useScenarioStore(projectId);
  const { unreadCount } = useAlerts();
  const [alertDrawerOpen, setAlertDrawerOpen] = useState(false);

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

  return (
    <header className="sticky top-0 z-30 bg-background/70 backdrop-blur border-b">
      <div className="flex items-center justify-between px-6 h-14">
        <span className="font-bold text-lg">Feasly</span>

        {/* Centered selectors */}
        <div className="flex items-center gap-4">
          {/* ─ Project selector ───────────────────────────────── */}
          <Menu as="div" className="relative">
            <Menu.Button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
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
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          disabled={!projectId}
        >
          {scenarios.find(s=>s.id===scenarioId)?.name ?? "Select scenario"}
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
            <Menu.Item>
              {({active})=>(
                <button 
                  className={`${
                    active ? 'bg-violet-500 text-white' : 'text-gray-900'
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  onClick={async ()=>{
                    const name=prompt("New scenario name");
                    if(!name) return;
                    const s = await create(name);
                    if (s) setScenario(s.id);
                  }}
                >
                  + New scenario
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
          </Menu>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
        {/* Export ZIP button */}
        <Button
          onClick={handleExportZip}
          variant="outline"
          size="sm"
          disabled={!projectId || !scenarioId}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export ZIP
        </Button>

        {/* Alerts bell */}
        <div className="relative">
          <Button
            onClick={() => setAlertDrawerOpen(true)}
            variant="ghost"
            size="sm"
            className="relative p-2"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </div>

        <div className="text-sm opacity-75">{user?.email}</div>
      </div>
      </div>

      <AlertDrawer 
        isOpen={alertDrawerOpen} 
        onClose={() => setAlertDrawerOpen(false)} 
      />
    </header>
  );
}