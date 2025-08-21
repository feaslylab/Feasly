import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ChevronDown, Plus, Edit, Trash2, Copy } from 'lucide-react';
import { Scenario } from '@/types/scenario';

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  currentScenario: Scenario | undefined;
  onScenarioChange: (scenarioId: string) => void;
  onCreateScenario: (name: string, cloneFromId?: string) => Promise<Scenario | null>;
  onRenameScenario: (scenarioId: string, newName: string) => Promise<boolean>;
  onDeleteScenario: (scenarioId: string) => Promise<boolean>;
  className?: string;
}

export function ScenarioSelector({ 
  scenarios, 
  currentScenario, 
  onScenarioChange,
  onCreateScenario,
  onRenameScenario,
  onDeleteScenario,
  className 
}: ScenarioSelectorProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [deleteScenarioId, setDeleteScenarioId] = useState<string | null>(null);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [cloneFromScenarioId, setCloneFromScenarioId] = useState<string>('');
  const [renameScenarioId, setRenameScenarioId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleCreateScenario = async () => {
    if (!newScenarioName.trim()) return;
    
    setLoading(true);
    try {
      const created = await onCreateScenario(newScenarioName, cloneFromScenarioId || undefined);
      if (created) {
        setIsCreateDialogOpen(false);
        setNewScenarioName('');
        setCloneFromScenarioId('');
        onScenarioChange(created.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRenameScenario = async () => {
    if (!newScenarioName.trim() || !renameScenarioId) return;
    
    setLoading(true);
    try {
      const success = await onRenameScenario(renameScenarioId, newScenarioName);
      if (success) {
        setIsRenameDialogOpen(false);
        setNewScenarioName('');
        setRenameScenarioId('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScenario = async () => {
    if (!deleteScenarioId) return;
    
    setLoading(true);
    try {
      await onDeleteScenario(deleteScenarioId);
      setDeleteScenarioId(null);
    } finally {
      setLoading(false);
    }
  };

  const openRenameDialog = (scenario: Scenario) => {
    setRenameScenarioId(scenario.id);
    setNewScenarioName(scenario.name);
    setIsRenameDialogOpen(true);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Scenario Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-5 px-1.5 bg-muted/30 hover:bg-muted/50 border-0 rounded-md transition-all duration-200 text-xs font-medium"
          >
            <span className="text-xs font-medium text-foreground/90">
              {currentScenario?.name || 'Select Scenario'}
            </span>
            <ChevronDown className="ml-1 h-2 w-2 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg rounded-lg z-50">
          {scenarios.map((scenario) => (
            <DropdownMenuItem
              key={scenario.id}
              onClick={() => onScenarioChange(scenario.id)}
              className="flex items-center justify-between"
            >
              <span className={scenario.id === currentScenario?.id ? 'font-medium' : ''}>
                {scenario.name}
              </span>
              {scenario.id === currentScenario?.id && (
                <div className="h-2 w-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Scenario
          </DropdownMenuItem>
          
          {currentScenario && (
            <>
              <DropdownMenuItem onClick={() => openRenameDialog(currentScenario)}>
                <Edit className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              
              {currentScenario.id !== 'baseline' && (
                <DropdownMenuItem 
                  onClick={() => setDeleteScenarioId(currentScenario.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Scenario Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Scenario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="scenario-name">Scenario Name</Label>
              <Input
                id="scenario-name"
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                placeholder="e.g., Optimistic, Pessimistic"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateScenario()}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clone-from">Clone From (Optional)</Label>
              <Select value={cloneFromScenarioId} onValueChange={setCloneFromScenarioId}>
                <SelectTrigger>
                  <SelectValue placeholder="Start blank or clone existing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Start blank</SelectItem>
                  {scenarios.map((scenario) => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      <div className="flex items-center">
                        <Copy className="mr-2 h-4 w-4" />
                        {scenario.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleCreateScenario} 
              disabled={!newScenarioName.trim() || loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Scenario'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewScenarioName('');
                setCloneFromScenarioId('');
              }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Scenario Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Scenario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="rename-scenario">New Name</Label>
              <Input
                id="rename-scenario"
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                placeholder="Enter new scenario name"
                onKeyDown={(e) => e.key === 'Enter' && handleRenameScenario()}
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleRenameScenario} 
              disabled={!newScenarioName.trim() || loading}
              className="flex-1"
            >
              {loading ? 'Renaming...' : 'Rename'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRenameDialogOpen(false);
                setNewScenarioName('');
                setRenameScenarioId('');
              }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteScenarioId} onOpenChange={() => setDeleteScenarioId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scenario</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this scenario? This action cannot be undone and will remove all associated data including inputs and snapshots.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteScenario}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}