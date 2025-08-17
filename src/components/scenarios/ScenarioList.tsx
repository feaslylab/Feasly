import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Edit2, Copy, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  loadScenarios,
  renameSnapshot,
  duplicateSnapshot,
  deleteSnapshot,
  type ScenarioSnapshot,
  type ScenarioId
} from '@/lib/scenarios';

interface ScenarioListProps {
  selectedIds: ScenarioId[];
  onSelectionChange: (ids: ScenarioId[]) => void;
  refreshTrigger: number;
}

export function ScenarioList({ selectedIds, onSelectionChange, refreshTrigger }: ScenarioListProps) {
  const { toast } = useToast();
  const [scenarios, setScenarios] = useState<ScenarioSnapshot[]>([]);
  const [editingId, setEditingId] = useState<ScenarioId | null>(null);
  const [editingName, setEditingName] = useState('');

  // Load scenarios
  const loadData = () => {
    const state = loadScenarios();
    setScenarios(state.items.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  // Load on mount and when refreshTrigger changes
  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const formatNumber = (num: number | null, decimals = 2, suffix = '') => {
    if (num === null) return 'N/A';
    return num.toFixed(decimals) + suffix;
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleRename = (id: ScenarioId, newName: string) => {
    if (!newName.trim()) {
      setEditingId(null);
      return;
    }
    
    renameSnapshot(id, newName.trim());
    setEditingId(null);
    setEditingName('');
    loadData();
    
    toast({
      title: 'Renamed',
      description: 'Scenario renamed successfully.'
    });
  };

  const handleDuplicate = (id: ScenarioId) => {
    duplicateSnapshot(id);
    loadData();
    
    toast({
      title: 'Duplicated',
      description: 'Scenario duplicated successfully.'
    });
  };

  const handleDelete = (id: ScenarioId) => {
    deleteSnapshot(id);
    // Remove from selection if selected
    onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    loadData();
    
    toast({
      title: 'Deleted',
      description: 'Scenario deleted successfully.'
    });
  };

  const handleSelect = (id: ScenarioId) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    } else if (selectedIds.length < 3) {
      onSelectionChange([...selectedIds, id]);
    } else {
      toast({
        title: 'Selection limit',
        description: 'You can compare up to 3 scenarios at once.',
        variant: 'destructive'
      });
    }
  };

  const startEdit = (scenario: ScenarioSnapshot) => {
    setEditingId(scenario.id);
    setEditingName(scenario.name);
  };

  if (scenarios.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="text-lg font-medium mb-2">No snapshots yet</div>
        <div className="text-sm">Click "Save Snapshot" after running a model to create your first scenario.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {selectedIds.length > 0 && (
          <span>{selectedIds.length} selected for comparison</span>
        )}
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">IRR</TableHead>
            <TableHead className="text-right">TVPI</TableHead>
            <TableHead className="text-right">DPI</TableHead>
            <TableHead className="text-right">RVPI</TableHead>
            <TableHead className="text-right">MOIC</TableHead>
            <TableHead className="text-right">Clawback</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scenarios.map((scenario) => (
            <TableRow 
              key={scenario.id}
              className={selectedIds.includes(scenario.id) ? 'bg-muted/50' : ''}
            >
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelect(scenario.id)}
                  className={selectedIds.includes(scenario.id) ? 'bg-primary text-primary-foreground' : ''}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </TableCell>
              <TableCell>
                {editingId === scenario.id ? (
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleRename(scenario.id, editingName)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRename(scenario.id, editingName);
                      } else if (e.key === 'Escape') {
                        setEditingId(null);
                        setEditingName('');
                      }
                    }}
                    className="h-8"
                    autoFocus
                  />
                ) : (
                  <span className="font-medium">{scenario.name}</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(scenario.createdAt), 'MMM dd, HH:mm')}
              </TableCell>
              <TableCell className="text-right">
                {formatNumber(scenario.summary.irr_pa, 1, '%')}
              </TableCell>
              <TableCell className="text-right">
                {formatNumber(scenario.summary.tvpi, 2, 'x')}
              </TableCell>
              <TableCell className="text-right">
                {formatNumber(scenario.summary.dpi, 2, 'x')}
              </TableCell>
              <TableCell className="text-right">
                {formatNumber(scenario.summary.rvpi, 2, 'x')}
              </TableCell>
              <TableCell className="text-right">
                {formatNumber(scenario.summary.moic, 2, 'x')}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(scenario.summary.gp_clawback_last)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(scenario)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(scenario.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Scenario</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{scenario.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(scenario.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}