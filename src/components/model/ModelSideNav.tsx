import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useStickyNavigation } from '@/hooks/useStickyNavigation';
import { useMagneticScroll } from '@/hooks/useMagneticScroll';
import { MAG_OFFSET } from '@/constants/ui';
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

// Desktop sidebar navigation with magnetic sticky behavior
function DesktopSideNav({ sections, activeSection, onSectionClick, className }: ModelSideNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  
  // Enhanced magnetic scroll behavior - keep visible but add magnetic effects
  const { 
    isSticky, 
    magneticOffset, 
    scrollDirection 
  } = useMagneticScroll({
    threshold: 80,
    hideDelay: 1000, // Not used since we're always visible
    showDelay: 100,
    magneticZone: MAG_OFFSET,
    aggressiveHide: false // Never hide the navigation
  });

  // Always keep visible - navigation should follow user down the page
  const isVisible = true;

  const { getStickyContainerStyles, checkStickyParent } = useStickyNavigation({
    topOffset: 0, // No offset needed since we're using fixed positioning
    maxHeight: '100vh'
  });

  // Check for sticky parent issues on mount
  useEffect(() => {
    if (navRef.current) {
      checkStickyParent(navRef.current);
    }
  }, [checkStickyParent]);

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

  const handleSectionClick = (sectionId: string) => {
    onSectionClick(sectionId);
  };

  const stickyStyles = getStickyContainerStyles();

  return (
    <motion.aside 
      ref={navRef}
      data-testid="desktop-sidenav"
      data-is-sticky={isSticky}
      animate={{ 
        y: magneticOffset * 0.5, // Subtle magnetic movement
        scale: isSticky ? 0.98 : 1,
        backdropFilter: isSticky ? 'blur(12px)' : 'blur(8px)'
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }}
      className={cn(
        'w-64 border-r transition-all duration-300',
        isSticky ? [
          'bg-background/90 backdrop-blur-md shadow-lg',
          'border-primary/20'
        ] : [
          'bg-background/95 backdrop-blur',
          'supports-[backdrop-filter]:bg-background/60'
        ],
        className
      )}
          style={{
            ...stickyStyles,
            willChange: 'transform, opacity'
          }}
        >
          {/* Header with magnetic glow effect */}
          <motion.div 
            className="relative p-4 border-b"
            animate={{
              borderColor: isSticky ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--border))'
            }}
          >
            {/* Magnetic glow background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary-light/5"
              animate={{
                opacity: isSticky ? 1 : 0
              }}
              transition={{ duration: 0.3 }}
            />
            
            <motion.h2 
              className="relative font-semibold text-sm text-muted-foreground uppercase tracking-wide"
              animate={{
                color: isSticky ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                scale: isSticky ? 1.02 : 1
              }}
              transition={{ duration: 0.2 }}
            >
              Model Sections
            </motion.h2>
          </motion.div>
          
          <ScrollArea className="h-full px-3 py-4">
            <motion.div 
              className="space-y-1"
              animate={{
                gap: isSticky && scrollDirection === 'down' ? '0.125rem' : '0.25rem'
              }}
            >
              {sections.map((section, index) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: index * 0.03 }
                    }}
                    whileHover={{ 
                      x: 4,
                      transition: { duration: 0.15 }
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'w-full justify-start gap-3 h-auto py-3 px-3 relative',
                        'transition-all duration-200 group',
                        isActive ? [
                          'bg-primary/10 text-primary hover:bg-primary/15',
                          'shadow-sm shadow-primary/10',
                          'before:absolute before:left-0 before:top-0 before:bottom-0',
                          'before:w-1 before:bg-primary before:rounded-r',
                          'after:absolute after:inset-0 after:bg-primary/5 after:rounded-md'
                        ] : [
                          'hover:bg-muted/80 hover:shadow-sm',
                          'hover:border-primary/10'
                        ]
                      )}
                      onClick={() => handleSectionClick(section.id)}
                      data-testid="section-nav-item"
                      data-section={section.id}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <motion.div
                        animate={{
                          rotate: isActive ? 360 : 0,
                          scale: isActive ? 1.1 : 1
                        }}
                        transition={{ 
                          duration: 0.3,
                          delay: isActive ? 0.1 : 0 
                        }}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0 relative z-10" />
                      </motion.div>
                      
                      <motion.span 
                        className="flex-1 text-left text-sm truncate relative z-10"
                        animate={{
                          fontWeight: isActive ? 500 : 400
                        }}
                      >
                        {section.title}
                      </motion.span>
                      
                      <div className="flex items-center gap-2 relative z-10">
                        {section.required && (
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                          >
                            <Badge variant="outline" className="h-4 px-1 text-xs">
                              REQ
                            </Badge>
                          </motion.div>
                        )}
                        <motion.div
                          animate={{
                            scale: isActive ? 1.2 : 1
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          {getStatusIcon(section.status)}
                        </motion.div>
                      </div>
                    </Button>
                  </motion.div>
                );
              })}
            </motion.div>
          </ScrollArea>
        </motion.aside>
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
    id: 'construction-development',
    title: 'Construction & Development',
    icon: Building2,
    status: 'empty',
    required: true
  },
  {
    id: 'revenue-segments',
    title: 'Revenue Segments',
    icon: TrendingUp,
    status: 'empty',
    required: true
  },
  {
    id: 'rental-segments',
    title: 'Rental Segments',
    icon: Building2,
    status: 'empty'
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