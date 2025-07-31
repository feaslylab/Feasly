import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Save, 
  BarChart3, 
  FileText, 
  Settings,
  MessageSquare,
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionMenuProps {
  onSave?: () => void;
  onExport?: () => void;
  onComment?: () => void;
  onSettings?: () => void;
  className?: string;
  isLoading?: boolean;
}

export function FloatingActionMenu({
  onSave,
  onExport,
  onComment,
  onSettings,
  className,
  isLoading = false
}: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      icon: Save,
      label: 'Save Draft',
      onClick: onSave,
      variant: 'outline' as const,
      className: 'bg-card shadow-lg border-border/50'
    },
    {
      icon: BarChart3,
      label: 'Export Model',
      onClick: onExport,
      variant: 'default' as const,
      className: 'bg-primary text-primary-foreground shadow-lg'
    },
    {
      icon: MessageSquare,
      label: 'Comments',
      onClick: onComment,
      variant: 'outline' as const,
      className: 'bg-card shadow-lg border-border/50',
      badge: '2'
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: onSettings,
      variant: 'outline' as const,
      className: 'bg-card shadow-lg border-border/50'
    }
  ];

  return (
    <div className={cn("fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3", className)}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, staggerChildren: 0.05 }}
            className="flex flex-col items-end gap-2"
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                  className="bg-background/95 backdrop-blur-sm rounded-lg px-3 py-1 border border-border/50 shadow-sm"
                >
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                </motion.div>
                <div className="relative">
                  <Button
                    variant={item.variant}
                    size="icon"
                    onClick={item.onClick}
                    disabled={isLoading}
                    className={cn(
                      "h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200",
                      "hover:scale-110 active:scale-95",
                      item.className
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </Button>
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        <Button
          variant="default"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={cn(
            "h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200",
            "bg-gradient-to-r from-primary to-primary-dark",
            isOpen && "bg-destructive hover:bg-destructive/90"
          )}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          </motion.div>
        </Button>
      </motion.div>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/20 backdrop-blur-sm -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}