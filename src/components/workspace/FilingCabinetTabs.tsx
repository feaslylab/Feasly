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
      {/* Excel-style workbook tabs */}
      <div className="flex items-end border-b border-border/30">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          // Light colors for different tabs (Excel-style)
          const tabColors = [
            'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100', // Inputs
            'bg-green-50 border-green-200 text-green-800 hover:bg-green-100', // Preview  
            'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100', // Revenue Preview
            'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100', // Executive Report
            'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100', // Insights
            'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100', // Results
            'bg-cyan-50 border-cyan-200 text-cyan-800 hover:bg-cyan-100', // Timeline
            'bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100', // Snapshots
            'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100', // Presets
            'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100', // Portfolio
          ];
          
          const activeTabColors = [
            'bg-blue-100 border-blue-300 text-blue-900', // Inputs
            'bg-green-100 border-green-300 text-green-900', // Preview  
            'bg-emerald-100 border-emerald-300 text-emerald-900', // Revenue Preview
            'bg-purple-100 border-purple-300 text-purple-900', // Executive Report
            'bg-amber-100 border-amber-300 text-amber-900', // Insights
            'bg-rose-100 border-rose-300 text-rose-900', // Results
            'bg-cyan-100 border-cyan-300 text-cyan-900', // Timeline
            'bg-indigo-100 border-indigo-300 text-indigo-900', // Snapshots
            'bg-slate-100 border-slate-300 text-slate-900', // Presets
            'bg-orange-100 border-orange-300 text-orange-900', // Portfolio
          ];
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex items-center gap-2 px-3 py-2 text-xs font-medium',
                'border-t border-l border-r transition-all duration-200',
                'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2',
                isActive 
                  ? cn(
                      activeTabColors[index] || 'bg-background border-border text-foreground',
                      '-mb-px z-10 border-b-transparent' // Connect to content below
                    )
                  : cn(
                      tabColors[index] || 'bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50',
                      'border-b-border/30 mb-0'
                    ),
                index > 0 && 'border-l-transparent -ml-px'
              )}
              style={{
                // Consistent slanted shape for all tabs (Excel-style)
                clipPath: 'polygon(0% 0%, calc(100% - 8px) 0%, 100% 100%, 8px 100%)',
                borderTopLeftRadius: '4px',
                borderTopRightRadius: '0px'
              }}
            >
              <Icon className="h-3 w-3 flex-shrink-0" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}