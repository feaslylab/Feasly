import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SectionStatus = 'valid' | 'warning' | 'error' | 'empty';

interface SectionPanelProps {
  id: string;
  title: string;
  children: ReactNode;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
  status?: SectionStatus;
  className?: string;
  lazyLoad?: boolean;
  rowCount?: number; // For grid components
  icon?: React.ComponentType<any>; // Add icon prop
}

const statusConfig = {
  valid: {
    icon: CheckCircle,
    className: 'text-success border-success/20 bg-success/10',
    label: 'Complete'
  },
  warning: {
    icon: AlertTriangle,
    className: 'text-warning border-warning/20 bg-warning/10',
    label: 'Partial'
  },
  error: {
    icon: XCircle,
    className: 'text-destructive border-destructive/20 bg-destructive/10',
    label: 'Issues'
  },
  empty: {
    icon: ChevronRight,
    className: 'text-muted-foreground border-muted/20 bg-muted/5',
    label: 'Pending'
  }
};

export function SectionPanel({
  id,
  title,
  children,
  isOpen = false,
  onToggle,
  status = 'empty',
  className,
  lazyLoad = false,
  rowCount,
  icon: IconComponent
}: SectionPanelProps) {
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  const handleToggle = () => {
    onToggle?.(!isOpen);
    // Removed forced scrolling that was causing lock-up issues
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ scale: 1.001 }}
    >
      <Card 
        id={id}
        data-collapsed={!isOpen ? 'true' : undefined}
        className={cn(
          'group/card relative overflow-hidden',
          'border transition-all duration-300',
          isOpen ? 'ring-2 ring-primary/20 shadow-lg shadow-primary/5' : 'hover:shadow-md',
          className
        )}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 opacity-0 bg-gradient-to-r from-primary/3 to-primary-light/3"
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        <Collapsible open={isOpen} onOpenChange={onToggle}>
          <CollapsibleTrigger asChild>
            <motion.div
              whileHover={{ backgroundColor: "hsl(var(--muted) / 0.6)" }}
              whileTap={{ scale: 0.995 }}
              transition={{ duration: 0.15 }}
            >
              <CardHeader 
                className={cn(
                  'relative cursor-pointer transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  'group'
                )}
                role="button"
                aria-expanded={isOpen}
                tabIndex={0}
                onClick={handleToggle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggle();
                  }
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-colors duration-200",
                          isOpen ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )} />
                      </motion.div>
                      
                      {/* Add icon if provided */}
                      {IconComponent && (
                        <IconComponent className={cn(
                          "h-4 w-4 transition-colors duration-200",
                          isOpen ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                        )} />
                      )}
                      
                      <motion.span 
                        className={cn(
                          "transition-colors duration-200",
                          isOpen ? "text-primary font-medium" : "group-hover:text-primary"
                        )}
                        animate={{ x: isOpen ? 2 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {title}
                      </motion.span>
                    </div>
                  </CardTitle>
                  
                  <div className="flex items-center gap-2">
                    <AnimatePresence>
                      {rowCount !== undefined && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge variant="secondary" className="text-xs">
                            {rowCount} {rowCount === 1 ? 'item' : 'items'}
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Badge 
                        variant="outline"
                        className={cn(
                          'flex items-center gap-1.5 transition-all duration-200',
                          statusInfo.className,
                          isOpen && 'shadow-sm'
                        )}
                      >
                        <motion.div
                          animate={{ 
                            scale: isOpen ? 1.1 : 1,
                            rotate: status === 'valid' ? 360 : 0 
                          }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <StatusIcon className="h-3 w-3" />
                        </motion.div>
                        <span className="text-xs font-medium">
                          {statusInfo.label}
                        </span>
                      </Badge>
                    </motion.div>
                  </div>
                </div>
              </CardHeader>
            </motion.div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="overflow-hidden">
            <motion.div
              initial={false}
              animate={{
                height: isOpen ? "auto" : 0,
                opacity: isOpen ? 1 : 0
              }}
              transition={{
                height: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
                opacity: { duration: 0.25, delay: isOpen ? 0.1 : 0 }
              }}
            >
              <CardContent className="pt-0 pb-6">
                <motion.div
                  initial={false}
                  animate={{
                    y: isOpen ? 0 : -10,
                    opacity: isOpen ? 1 : 0
                  }}
                  transition={{
                    duration: 0.25,
                    delay: isOpen ? 0.15 : 0,
                    ease: "easeOut"
                  }}
                >
                  {/* Lazy load content if specified and panel is open */}
                  {lazyLoad ? (isOpen ? children : null) : children}
                </motion.div>
              </CardContent>
            </motion.div>
          </CollapsibleContent>
        </Collapsible>
        
        {/* Subtle border animation */}
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-primary/20 pointer-events-none"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ 
            opacity: isOpen ? 1 : 0,
            scale: isOpen ? 1 : 1.02
          }}
          transition={{ duration: 0.3 }}
        />
      </Card>
    </motion.div>
  );
}