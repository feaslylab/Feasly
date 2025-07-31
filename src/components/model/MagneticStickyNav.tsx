import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMagneticScroll } from '@/hooks/useMagneticScroll';
import { ModelSection } from './ModelSideNav';
import { SectionStatus } from './SectionPanel';

interface MagneticStickyNavProps {
  sections: ModelSection[];
  activeSection?: string;
  onSectionClick: (sectionId: string) => void;
  className?: string;
}

export function MagneticStickyNav({ 
  sections, 
  activeSection, 
  onSectionClick, 
  className 
}: MagneticStickyNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const { 
    isVisible, 
    isSticky, 
    magneticOffset, 
    scrollDirection,
    forceShow,
    forceHide 
  } = useMagneticScroll({
    threshold: 100,
    hideDelay: 300,
    showDelay: 100,
    magneticZone: 150
  });

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

  const getStatusCount = (status: SectionStatus) => {
    return sections.filter(s => s.status === status).length;
  };

  // Compact mode when sticky
  const isCompact = isSticky && scrollDirection === 'down';

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          ref={navRef}
          initial={{ 
            opacity: 0, 
            y: -100,
            scale: 0.95
          }}
          animate={{ 
            opacity: 1, 
            y: isSticky ? magneticOffset : 0,
            scale: 1,
            backdropFilter: isSticky ? 'blur(12px)' : 'blur(0px)'
          }}
          exit={{ 
            opacity: 0, 
            y: -100,
            scale: 0.95,
            transition: { duration: 0.2 }
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            mass: 0.8
          }}
          className={cn(
            'z-50 transition-all duration-300',
            isSticky ? [
              'fixed top-4 left-1/2 -translate-x-1/2',
              'w-[calc(100%-2rem)] max-w-4xl'
            ] : [
              'sticky top-16 mx-4'
            ],
            className
          )}
          style={{
            willChange: 'transform, opacity'
          }}
        >
          <motion.div
            layout
            className={cn(
              'relative overflow-hidden rounded-xl border bg-background/80 backdrop-blur-md',
              'shadow-lg shadow-black/5',
              isSticky && 'shadow-xl shadow-black/10'
            )}
            animate={{
              borderColor: isSticky ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--border))'
            }}
          >
            {/* Magnetic glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary-light/5 to-primary/5"
              animate={{
                opacity: isSticky ? 1 : 0,
                scale: isSticky ? 1 : 1.1
              }}
              transition={{ duration: 0.3 }}
            />

            <div className="relative">
              {/* Header with status overview */}
              <motion.div 
                className="flex items-center justify-between p-3 border-b border-border/50"
                layout
              >
                <div className="flex items-center gap-3">
                  <motion.h3 
                    className="font-semibold text-sm"
                    animate={{
                      fontSize: isCompact ? '0.75rem' : '0.875rem'
                    }}
                  >
                    Model Navigation
                  </motion.h3>
                  
                  {/* Status summary badges */}
                  <motion.div 
                    className="flex items-center gap-1"
                    animate={{
                      scale: isCompact ? 0.9 : 1
                    }}
                  >
                    {getStatusCount('valid') > 0 && (
                      <Badge variant="outline" className="h-5 px-2 text-xs text-success border-success/30">
                        <CheckCircle className="h-2.5 w-2.5 mr-1" />
                        {getStatusCount('valid')}
                      </Badge>
                    )}
                    {getStatusCount('warning') > 0 && (
                      <Badge variant="outline" className="h-5 px-2 text-xs text-warning border-warning/30">
                        <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                        {getStatusCount('warning')}
                      </Badge>
                    )}
                    {getStatusCount('error') > 0 && (
                      <Badge variant="outline" className="h-5 px-2 text-xs text-destructive border-destructive/30">
                        <XCircle className="h-2.5 w-2.5 mr-1" />
                        {getStatusCount('error')}
                      </Badge>
                    )}
                  </motion.div>
                </div>

                {/* Toggle visibility buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={forceHide}
                  >
                    <EyeOff className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>

              {/* Navigation items */}
              <motion.div
                layout
                animate={{
                  height: isCompact ? 'auto' : 'auto'
                }}
              >
                <ScrollArea className={cn(
                  'w-full',
                  isCompact ? 'max-h-20' : 'max-h-32'
                )}>
                  <div className={cn(
                    'flex gap-1 p-2',
                    isCompact ? 'flex-wrap' : 'flex-wrap'
                  )}>
                    {sections.map((section, index) => {
                      const Icon = section.icon;
                      const isActive = activeSection === section.id;
                      
                      return (
                        <motion.div
                          key={section.id}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1,
                            transition: { delay: index * 0.02 }
                          }}
                          whileHover={{ 
                            scale: 1.05,
                            y: -2,
                            transition: { duration: 0.15 }
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                              'relative flex items-center gap-2 transition-all duration-200',
                              isCompact ? 'h-7 px-2 text-xs' : 'h-8 px-3 text-xs',
                              isActive && [
                                'bg-primary text-primary-foreground shadow-md',
                                'after:absolute after:inset-0 after:rounded-md',
                                'after:shadow-lg after:shadow-primary/25 after:-z-10'
                              ],
                              !isActive && 'hover:bg-muted/60'
                            )}
                            onClick={() => onSectionClick(section.id)}
                          >
                            <motion.div
                              animate={{
                                rotate: isActive ? 360 : 0
                              }}
                              transition={{ duration: 0.3, delay: isActive ? 0.1 : 0 }}
                            >
                              <Icon className={cn(
                                isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5'
                              )} />
                            </motion.div>
                            
                            <span className={cn(
                              'truncate font-medium',
                              isCompact && 'hidden sm:inline'
                            )}>
                              {isCompact ? section.title.split(' ')[0] : section.title}
                            </span>
                            
                            {/* Status indicator */}
                            <motion.div
                              className="flex-shrink-0"
                              animate={{
                                scale: isActive ? 1.2 : 1
                              }}
                            >
                              {getStatusIcon(section.status)}
                            </motion.div>
                            
                            {/* Required badge */}
                            {section.required && !isCompact && (
                              <Badge variant="secondary" className="h-3 px-1 text-[0.6rem]">
                                REQ
                              </Badge>
                            )}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </motion.div>
            </div>
          </motion.div>

          {/* Floating show button when hidden */}
          <AnimatePresence>
            {!isVisible && isSticky && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="fixed top-4 right-4 z-50"
              >
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-full h-10 w-10 p-0 shadow-lg hover:shadow-xl transition-shadow"
                  onClick={forceShow}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}