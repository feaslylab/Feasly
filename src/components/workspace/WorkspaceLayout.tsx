import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Save, Play, Eye, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  projectName?: string;
  scenarioName?: string;
  onSaveSnapshot?: () => void;
  onRunCalculation?: () => void;
  isCalculating?: boolean;
}

type WorkspaceTab = 'inputs' | 'preview' | 'results';

export default function WorkspaceLayout({
  children,
  projectName,
  scenarioName = 'baseline',
  onSaveSnapshot,
  onRunCalculation,
  isCalculating = false
}: WorkspaceLayoutProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('inputs');

  const tabs = [
    { id: 'inputs' as const, label: 'Inputs', icon: BarChart3 },
    { id: 'preview' as const, label: 'Preview', icon: Eye },
    { id: 'results' as const, label: 'Results', icon: Play },
  ];

  return (
    <div className="flex h-screen flex-col">
      {/* Workspace Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {projectName && (
              <>
                <h1 className="font-semibold">{projectName}</h1>
                <Separator orientation="vertical" className="h-4" />
                <Badge variant="outline" className="capitalize">
                  {scenarioName}
                </Badge>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRunCalculation}
              disabled={isCalculating}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {isCalculating ? 'Calculating...' : 'Run'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveSnapshot}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        {/* Workspace Navigation */}
        <div className="border-t">
          <nav className="flex px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors hover:text-foreground",
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Workspace Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            {children}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}