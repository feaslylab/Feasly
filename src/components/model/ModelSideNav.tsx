import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  Building2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  FileText,
  Settings,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionStatus } from './SectionPanel';

export interface ModelSection {
  id: string;
  title: string;
  icon: typeof Building2;
  status: SectionStatus;
  required?: boolean;
}

interface ModelSideNavProps {
  sections: ModelSection[];
  activeSection?: string;
  onSectionClick: (sectionId: string) => void;
  className?: string;
}

interface ModelMobileNavProps extends ModelSideNavProps {
  isMobile: boolean;
}

// Desktop sidebar navigation
function DesktopSideNav({ sections, activeSection, onSectionClick, className }: ModelSideNavProps) {
  const getStatusIcon = (status: SectionStatus) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-3 w-3 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-warning" />;
      case 'error':
        return <XCircle className="h-3 w-3 text-destructive" />;
      default:
        return <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />;
    }
  };

  return (
    <div className={cn('w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', className)} data-testid="desktop-sidenav">
      <div className="sticky top-0 h-screen">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Model Sections
          </h2>
        </div>
        
        <ScrollArea className="h-full px-3 py-4">
          <div className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <Button
                  key={section.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'w-full justify-start gap-3 h-auto py-3 px-3',
                    'hover:bg-muted/80 transition-colors',
                    isActive && 'bg-primary/10 text-primary hover:bg-primary/15'
                  )}
                  data-testid="section-nav-item"
                  data-section={section.id}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left text-sm truncate">
                    {section.title}
                  </span>
                  <div className="flex items-center gap-2">
                    {section.required && (
                      <Badge variant="outline" className="h-4 px-1 text-xs">
                        REQ
                      </Badge>
                    )}
                    {getStatusIcon(section.status)}
                  </div>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// Mobile tab bar + FAB navigation
function MobileNav({ sections, activeSection, onSectionClick }: ModelSideNavProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const getStatusColor = (status: SectionStatus) => {
    switch (status) {
      case 'valid': return 'bg-success';
      case 'warning': return 'bg-warning';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted-foreground/30';
    }
  };

  return (
    <>
      {/* Top tab bar for quick section access */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ScrollArea className="w-full whitespace-nowrap">{/* horizontal scrolling */}
          <Tabs value={activeSection} className="w-full">
            <TabsList className="inline-flex h-12 p-1 gap-1">
              {sections.slice(0, 6).map((section) => {
                const Icon = section.icon;
                return (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="relative flex items-center gap-2 px-3 py-2"
                    onClick={() => onSectionClick(section.id)}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline text-xs">
                      {section.title.split(' ')[0]}
                    </span>
                    <div className={cn(
                      'absolute -top-1 -right-1 h-2 w-2 rounded-full',
                      getStatusColor(section.status)
                    )} />
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </ScrollArea>
      </div>

      {/* Floating action button for full navigation */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className={cn(
              'fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg',
              'hover:scale-105 transition-transform'
            )}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open navigation</span>
          </Button>
        </SheetTrigger>
        
        <SheetContent side="bottom" className="h-[80vh]">
          <div className="py-4">
            <h3 className="text-lg font-semibold mb-4">Jump to Section</h3>
            <ScrollArea className="h-[60vh]">
              <div className="grid grid-cols-1 gap-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <Button
                      key={section.id}
                      variant={isActive ? "default" : "ghost"}
                      size="lg"
                      className="justify-start gap-3 h-14"
                      onClick={() => {
                        onSectionClick(section.id);
                        setIsSheetOpen(false);
                      }}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {section.required ? 'Required' : 'Optional'}
                        </div>
                      </div>
                      <div className={cn(
                        'h-3 w-3 rounded-full',
                        getStatusColor(section.status)
                      )} />
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function ModelSideNav({ sections, activeSection, onSectionClick, className, isMobile }: ModelMobileNavProps) {
  if (isMobile) {
    return <MobileNav sections={sections} activeSection={activeSection} onSectionClick={onSectionClick} />;
  }
  
  return <DesktopSideNav sections={sections} activeSection={activeSection} onSectionClick={onSectionClick} className={className} />;
}

// Default sections configuration
export const defaultModelSections: ModelSection[] = [
  {
    id: 'project-metadata',
    title: 'Project Info',
    icon: Building2,
    status: 'empty',
    required: true
  },
  {
    id: 'validation',
    title: 'Validation',
    icon: CheckCircle,
    status: 'empty'
  },
  {
    id: 'timeline',
    title: 'Timeline',
    icon: Calendar,
    status: 'empty',
    required: true
  },
  {
    id: 'site-metrics',
    title: 'Site Metrics',
    icon: MapPin,
    status: 'empty',
    required: true
  },
  {
    id: 'financial-inputs',
    title: 'Financial Inputs',
    icon: DollarSign,
    status: 'empty',
    required: true
  },
  {
    id: 'scenarios',
    title: 'Scenarios',
    icon: BarChart3,
    status: 'empty'
  },
  {
    id: 'advanced-analysis',
    title: 'Advanced Analysis',
    icon: TrendingUp,
    status: 'empty'
  },
  {
    id: 'vendor-risk',
    title: 'Vendor & Risk',
    icon: Users,
    status: 'empty'
  },
  {
    id: 'results-insights',
    title: 'Results & Insights',
    icon: Target,
    status: 'empty'
  },
  {
    id: 'compliance',
    title: 'Compliance',
    icon: Settings,
    status: 'empty'
  },
  {
    id: 'export-ai',
    title: 'Export & AI',
    icon: FileText,
    status: 'empty'
  },
  {
    id: 'comments',
    title: 'Comments',
    icon: MessageSquare,
    status: 'empty'
  }
];