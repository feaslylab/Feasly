import { Menu } from "@headlessui/react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProjectStore } from "@/hooks/useProjectStore";
import { useScenarioStore } from "@/hooks/useScenarioStore";
import { useSelectionStore } from "@/state/selectionStore";

export default function Header() {
  const { user } = useAuth();
  const { projects } = useProjectStore();
  const { projectId, setProject, scenarioId, setScenario } = useSelectionStore();
  const { scenarios, create, setCurrent } = useScenarioStore(projectId);

  return (
    <header className="sticky top-0 z-30 flex items-center bg-background/80
                       backdrop-blur px-6 h-14 border-b">
      <span className="font-bold text-lg mr-6">Feasly</span>

      {/* ─ Project selector ───────────────────────────────── */}
      <Menu as="div" className="relative mr-4">
        <Menu.Button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
          {projects.find(p=>p.id===projectId)?.name ?? "Select project"}
        </Menu.Button>
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-1 py-1">
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
      <Menu as="div" className="relative mr-4">
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

      <div className="ml-auto text-sm opacity-75">{user?.email}</div>
    </header>
  );
}