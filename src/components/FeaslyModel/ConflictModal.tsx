import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { ConflictError } from '@/api/feaslyModel';

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflict: ConflictError | null;
  onResolve: (resolution: 'overwrite' | 'merge' | 'cancel') => void;
}

export function ConflictModal({ isOpen, onClose, conflict, onResolve }: ConflictModalProps) {
  const [resolution, setResolution] = useState<'overwrite' | 'merge' | null>(null);

  if (!conflict) return null;

  const handleResolve = (type: 'overwrite' | 'merge' | 'cancel') => {
    onResolve(type);
    setResolution(null);
    onClose();
  };

  // Get field differences between server and local data
  const getFieldDifferences = () => {
    const differences: { field: string; server: any; local: any }[] = [];
    const allKeys = new Set([
      ...Object.keys(conflict.serverData || {}),
      ...Object.keys(conflict.localData || {})
    ]);

    allKeys.forEach(key => {
      const serverValue = conflict.serverData?.[key];
      const localValue = conflict.localData?.[key];
      
      if (JSON.stringify(serverValue) !== JSON.stringify(localValue)) {
        differences.push({
          field: key,
          server: serverValue,
          local: localValue
        });
      }
    });

    return differences;
  };

  const differences = getFieldDifferences();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="conflict-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Sync Conflict Detected
          </DialogTitle>
          <DialogDescription>
            Another user has modified this model while you were editing. 
            Please choose how to resolve the conflict.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Conflict Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Conflict Summary</h4>
            <p className="text-sm text-muted-foreground">
              {differences.length} field(s) have conflicting changes
            </p>
          </div>

          {/* Field Differences */}
          <div>
            <h4 className="font-medium mb-3">Conflicting Fields</h4>
            <ScrollArea className="h-48 border rounded-lg p-4">
              <div className="space-y-3">
                {differences.map((diff, index) => (
                  <div key={index} className="border-b pb-3 last:border-b-0">
                    <div className="font-medium text-sm mb-2">{diff.field}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Badge variant="outline" className="mb-2">Server Version</Badge>
                        <div className="text-sm bg-red-50 p-2 rounded border" data-testid="server-version">
                          {typeof diff.server === 'object' 
                            ? JSON.stringify(diff.server, null, 2)
                            : String(diff.server || 'empty')
                          }
                        </div>
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-2">Your Version</Badge>
                        <div className="text-sm bg-blue-50 p-2 rounded border" data-testid="local-version">
                          {typeof diff.local === 'object'
                            ? JSON.stringify(diff.local, null, 2)
                            : String(diff.local || 'empty')
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Resolution Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2"
              onClick={() => setResolution('overwrite')}
              data-testid="overwrite-button"
            >
              <div className="flex items-center gap-2">
                <div className="font-medium">Overwrite Server</div>
                <ArrowRight className="h-4 w-4" />
              </div>
              <div className="text-xs text-muted-foreground text-left">
                Keep your changes and overwrite the server version
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2"
              onClick={() => setResolution('merge')}
              data-testid="merge-button"
            >
              <div className="flex items-center gap-2">
                <div className="font-medium">Smart Merge</div>
                <ArrowRight className="h-4 w-4" />
              </div>
              <div className="text-xs text-muted-foreground text-left">
                Attempt to merge both versions automatically
              </div>
            </Button>
          </div>

          {/* Resolution Preview */}
          {resolution && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">
                {resolution === 'overwrite' ? 'Overwrite Preview' : 'Merge Preview'}
              </h5>
              <p className="text-sm text-muted-foreground">
                {resolution === 'overwrite' 
                  ? 'Your local changes will be saved, overwriting the server version.'
                  : 'Fields will be merged using last-write-wins strategy for conflicting values.'
                }
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => handleResolve('cancel')}
            data-testid="cancel-conflict"
          >
            Cancel
          </Button>
          
          {resolution && (
            <Button 
              onClick={() => handleResolve(resolution)}
              variant={resolution === 'overwrite' ? 'destructive' : 'default'}
              data-testid={resolution === 'overwrite' ? 'confirm-overwrite' : 'confirm-merge'}
              aria-live="polite"
            >
              {resolution === 'overwrite' ? 'Overwrite Server' : 'Merge Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}