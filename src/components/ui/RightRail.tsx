import React, { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { ds } from '@/lib/design-system';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { motion, AnimatePresence } from 'framer-motion';

interface RightRailProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const RightRail: React.FC<RightRailProps> = ({
  title,
  children,
  defaultOpen = true,
  className
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { isRTL } = useLocale();

  const toggleIcon = isOpen 
    ? (isRTL ? ChevronLeft : ChevronRight)
    : (isRTL ? ChevronRight : ChevronLeft);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toggle Button */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className={cn(ds.type.h3, 'text-foreground')}>
          {title}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Collapse panel' : 'Expand panel'}
          className="h-8 w-8 p-0"
        >
          {React.createElement(toggleIcon, { className: 'h-4 w-4' })}
        </Button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex-1 overflow-hidden"
          >
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};