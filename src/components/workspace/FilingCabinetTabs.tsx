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
      {/* Filing Cabinet Base - subtle wood grain texture */}
      <div className="h-3 bg-gradient-to-b from-muted/10 via-muted/20 to-muted/40 border-b border-border/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/5 to-transparent" />
      </div>
      
      {/* Tab Container */}
      <div className="flex items-end gap-0 relative -mb-px">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'group relative flex items-center gap-2.5 px-5 py-3 text-sm font-medium transition-all duration-300 ease-out',
                'bg-gradient-to-b border-l border-r border-t rounded-t-xl transform-gpu',
                'hover:scale-[1.02] hover:-translate-y-1',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background',
                // Filing cabinet tab styling with enhanced depth
                isActive 
                  ? [
                      'from-background via-background/98 to-background/95',
                      'border-border/60 text-foreground shadow-xl shadow-black/5',
                      'z-30 -translate-y-2 scale-105',
                      // Connect active tab to content area
                      'before:absolute before:bottom-0 before:left-0 before:right-0 before:h-px before:bg-background before:z-10'
                    ]
                  : [
                      'from-muted/20 via-muted/40 to-muted/60',
                      'border-border/40 text-muted-foreground',
                      'z-10 hover:from-muted/30 hover:via-muted/50 hover:to-muted/70 hover:text-foreground',
                      'shadow-md shadow-black/5 hover:shadow-lg hover:shadow-black/10'
                    ],
                // Overlapping tabs for authentic filing cabinet look
                index > 0 && '-ml-3',
                // Depth layering
                !isActive && 'hover:z-20'
              )}
              style={{
                // Dynamic z-index and positioning for filing cabinet effect
                zIndex: isActive ? 30 : 20 - index,
                transform: isActive 
                  ? 'translateY(-8px) scale(1.05)' 
                  : `translateY(${Math.min(index * 2, 6)}px) scale(${1 - index * 0.01})`,
                // Subtle rotation for more realistic stacking
                transformOrigin: 'bottom center',
              }}
            >
              {/* Tab label area with paper texture */}
              <div className={cn(
                'absolute inset-0 rounded-t-xl opacity-20',
                'bg-gradient-to-br from-white/10 via-transparent to-black/5',
                isActive && 'opacity-30'
              )} />
              
              {/* Icon */}
              <Icon className={cn(
                'h-4 w-4 transition-all duration-200 relative z-10',
                isActive ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground group-hover:scale-105'
              )} />
              
              {/* Label */}
              <span className={cn(
                'whitespace-nowrap transition-all duration-200 relative z-10 select-none',
                isActive 
                  ? 'text-foreground font-semibold' 
                  : 'text-muted-foreground group-hover:text-foreground'
              )}>
                {tab.label}
              </span>
              
              {/* Active Tab Indicator - like a tab marker */}
              {isActive && (
                <>
                  <div className="absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40 rounded-full" />
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full shadow-sm" />
                </>
              )}
              
              {/* Filing Cabinet Tab Edge Shadow */}
              <div className={cn(
                'absolute right-0 top-1 bottom-1 w-px opacity-40',
                'bg-gradient-to-b from-transparent via-border/60 to-transparent',
                isActive ? 'opacity-30' : 'opacity-50'
              )} />
              
              {/* Paper fold effect on non-active tabs */}
              {!isActive && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-gradient-to-bl from-muted/60 to-transparent rounded-tr-xl" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Base Line - the desk surface */}
      <div className="h-px bg-gradient-to-r from-border/40 via-border to-border/40 relative z-20" />
      
      {/* Filing Cabinet Shadow and Depth */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-b from-transparent via-muted/5 to-muted/10 blur-sm" />
    </div>
  );
}