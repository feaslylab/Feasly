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
    <div className="relative bg-gradient-to-b from-muted/5 to-muted/10 pb-0">
      {/* Filing Cabinet Base - cleaner design */}
      <div className="h-2 bg-gradient-to-b from-muted/15 to-muted/25 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/3 to-transparent" />
      </div>
      
      {/* Tab Container */}
      <div className="flex items-end relative -mb-px px-1">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'group relative flex items-center gap-2 px-4 py-2.5 mx-0.5 text-sm font-medium transition-all duration-200 ease-out',
                'bg-gradient-to-b rounded-t-lg transform-gpu border border-b-0',
                'hover:-translate-y-0.5 hover:shadow-md',
                'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1',
                // Clean active/inactive styling
                isActive 
                  ? [
                      'from-background to-background/98 border-border/50',
                      'text-foreground shadow-lg shadow-black/5',
                      'z-30 -translate-y-1',
                      // Clean connection to content
                      'before:absolute before:bottom-0 before:left-0 before:right-0 before:h-px before:bg-background'
                    ]
                  : [
                      'from-muted/30 to-muted/50 border-border/30',
                      'text-muted-foreground hover:text-foreground',
                      'hover:from-muted/40 hover:to-muted/60',
                      'shadow-sm shadow-black/5'
                    ],
                // Subtle overlap for filing effect
                index > 0 && '-ml-1'
              )}
              style={{
                // Refined z-index stacking
                zIndex: isActive ? 30 : 20 - (index * 0.5),
                // Cleaner transforms
                transform: isActive 
                  ? 'translateY(-4px)' 
                  : `translateY(${index * 0.5}px)`,
              }}
            >
              {/* Subtle paper texture */}
              <div className={cn(
                'absolute inset-0 rounded-t-lg opacity-20 pointer-events-none',
                'bg-gradient-to-br from-white/8 to-transparent',
                isActive && 'opacity-30'
              )} />
              
              {/* Icon with refined styling */}
              <Icon className={cn(
                'h-4 w-4 transition-all duration-200 relative z-10',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground/80 group-hover:text-foreground group-hover:scale-105'
              )} />
              
              {/* Label with better typography */}
              <span className={cn(
                'whitespace-nowrap transition-all duration-200 relative z-10 font-medium',
                isActive 
                  ? 'text-foreground' 
                  : 'text-muted-foreground group-hover:text-foreground'
              )}>
                {tab.label}
              </span>
              
              {/* Refined active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary/60 rounded-t-full" />
              )}
              
              {/* Subtle edge definition */}
              {!isActive && index < tabs.length - 1 && (
                <div className="absolute right-0 top-2 bottom-2 w-px bg-border/20" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Clean base line */}
      <div className="h-px bg-border/60 relative z-20" />
    </div>
  );
}