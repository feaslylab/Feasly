import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Undo2, Redo2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UndoRedoControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearHistory?: () => void;
  className?: string;
  size?: 'sm' | 'default';
  showClear?: boolean;
}

/**
 * Undo/Redo control buttons for line item grids
 * Provides visual feedback and keyboard shortcuts
 */
export function UndoRedoControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearHistory,
  className,
  size = 'sm',
  showClear = false
}: UndoRedoControlsProps) {
  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if not in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          // Ctrl+Shift+Z or Cmd+Shift+Z for redo
          if (canRedo) {
            onRedo();
          }
        } else {
          // Ctrl+Z or Cmd+Z for undo
          if (canUndo) {
            onUndo();
          }
        }
      } else if ((event.metaKey || event.ctrlKey) && event.key === 'y') {
        // Ctrl+Y for redo (Windows style)
        event.preventDefault();
        if (canRedo) {
          onRedo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, onUndo, onRedo]);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size={size}
            onClick={onUndo}
            disabled={!canUndo}
            className={cn(
              "h-8 w-8 p-0",
              !canUndo && "opacity-40"
            )}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Undo (Ctrl+Z)</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size={size}
            onClick={onRedo}
            disabled={!canRedo}
            className={cn(
              "h-8 w-8 p-0",
              !canRedo && "opacity-40"
            )}
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Redo (Ctrl+Shift+Z)</p>
        </TooltipContent>
      </Tooltip>

      {showClear && onClearHistory && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size={size}
              onClick={onClearHistory}
              className={cn(
                "h-8 w-8 p-0 ml-1",
                !canUndo && !canRedo && "opacity-40"
              )}
              disabled={!canUndo && !canRedo}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear History</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

// Import React for useEffect
import React from 'react';