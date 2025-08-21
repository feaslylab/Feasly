import { cn } from '@/lib/utils';
import { 
  FileInput, 
  Eye, 
  DollarSign, 
  FileBarChart, 
  Lightbulb, 
  BarChart3, 
  Calendar, 
  Camera, 
  Settings, 
  Briefcase 
} from 'lucide-react';

type WorkspaceTab = 'inputs' | 'preview' | 'preview_revenue' | 'executive_report' | 'insights' | 'results' | 'timeline' | 'snapshots' | 'presets' | 'portfolio';

interface FilingCabinetTabsProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
}

const tabs = [
  { id: 'inputs' as const, label: 'Inputs', icon: FileInput },
  { id: 'preview' as const, label: 'Preview', icon: Eye },
  { id: 'preview_revenue' as const, label: 'Revenue Preview', icon: DollarSign },
  { id: 'executive_report' as const, label: 'Executive Report', icon: FileBarChart },
  { id: 'insights' as const, label: 'Insights', icon: Lightbulb },
  { id: 'results' as const, label: 'Results', icon: BarChart3 },
  { id: 'timeline' as const, label: 'Timeline', icon: Calendar },
  { id: 'snapshots' as const, label: 'Snapshots', icon: Camera },
  { id: 'presets' as const, label: 'Presets', icon: Settings },
  { id: 'portfolio' as const, label: 'Portfolio', icon: Briefcase },
];

export function FilingCabinetTabs({ activeTab, onTabChange }: FilingCabinetTabsProps) {
  return (
    <div className="relative">
      {/* Modern Tab Container - compact and clean */}
      <div className="flex items-center overflow-x-auto scrollbar-hide bg-muted/20 rounded-lg p-1 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap',
                'hover:bg-background/60 focus:outline-none focus:ring-2 focus:ring-primary/30',
                isActive 
                  ? 'bg-background text-foreground shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-3 w-3" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}