import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Trash2, 
  Copy, 
  Move, 
  TrendingUp, 
  X 
} from 'lucide-react';
import { BulkAction } from './types';

interface BulkActionsBarProps {
  selectedCount: number;
  onAction: (action: BulkAction) => void;
  onClearSelection: () => void;
}

export function BulkActionsBar({ 
  selectedCount, 
  onAction, 
  onClearSelection 
}: BulkActionsBarProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </Badge>
        
        <Separator orientation="vertical" className="h-4" />
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction({ 
              type: 'delete', 
              ids: [] // Will be filled by the grid component
            })}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction({ 
              type: 'duplicate', 
              ids: [] // Will be filled by the grid component
            })}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction({ 
              type: 'adjust_escalation', 
              ids: [], // Will be filled by the grid component
              adjustment: 1 // Default 1% increase
            })}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            +1% Escalation
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction({ 
              type: 'adjust_escalation', 
              ids: [], // Will be filled by the grid component
              adjustment: -1 // Default 1% decrease
            })}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4 rotate-180" />
            -1% Escalation
          </Button>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
        Clear Selection
      </Button>
    </div>
  );
}