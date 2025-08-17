import { useState } from 'react';
import { Download, Upload, Save, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  addSnapshot, 
  makeSnapshotName, 
  exportScenariosJSON, 
  importScenariosJSON,
  type ScenarioSnapshot 
} from '@/lib/scenarios';

interface ScenarioBarProps {
  onCompareToggle: () => void;
  isCompareOpen: boolean;
  currentInputs?: any;
  currentResults?: {
    equity?: {
      kpis?: {
        irr_pa?: number | null;
        tvpi?: number;
        dpi?: number;
        rvpi?: number;
        moic?: number;
      };
      gp_clawback?: number[];
      calls_total?: number[];
      dists_total?: number[];
      gp_promote?: number[];
    };
  };
  onSnapshotSaved: () => void;
}

export function ScenarioBar({ 
  onCompareToggle, 
  isCompareOpen, 
  currentInputs = {}, 
  currentResults = {},
  onSnapshotSaved 
}: ScenarioBarProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSnapshot = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const equity = currentResults.equity || {};
      const kpis = equity.kpis || {};
      
      const snapshot: ScenarioSnapshot = {
        id: crypto.randomUUID(),
        name: makeSnapshotName('Base Case'),
        createdAt: new Date().toISOString(),
        inputs: currentInputs,
        summary: {
          irr_pa: kpis.irr_pa ?? null,
          tvpi: kpis.tvpi ?? 0,
          dpi: kpis.dpi ?? 0,
          rvpi: kpis.rvpi ?? 0,
          moic: kpis.moic ?? 0,
          gp_clawback_last: (equity.gp_clawback && equity.gp_clawback.length > 0) 
            ? equity.gp_clawback[equity.gp_clawback.length - 1] 
            : 0
        },
        traces: {
          T: Math.max(
            equity.calls_total?.length || 0,
            equity.dists_total?.length || 0,
            equity.gp_promote?.length || 0,
            equity.gp_clawback?.length || 0
          ),
          calls_total: equity.calls_total || [],
          dists_total: equity.dists_total || [],
          gp_promote: equity.gp_promote || [],
          gp_clawback: equity.gp_clawback || []
        }
      };
      
      addSnapshot(snapshot);
      onSnapshotSaved();
      
      toast({
        title: 'Snapshot saved',
        description: `"${snapshot.name}" has been saved to your scenarios.`
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Unable to save snapshot. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    try {
      const json = exportScenariosJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `feasly-scenarios-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export successful',
        description: 'Scenarios exported to JSON file.'
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Unable to export scenarios.',
        variant: 'destructive'
      });
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const state = importScenariosJSON(content);
          onSnapshotSaved();
          
          toast({
            title: 'Import successful',
            description: `Imported ${state.items.length} snapshots.`
          });
        } catch (error) {
          toast({
            title: 'Import failed',
            description: error instanceof Error ? error.message : 'Invalid file format.',
            variant: 'destructive'
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleSaveSnapshot}
          disabled={isSaving}
          size="sm"
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Snapshot'}
        </Button>
        
        <Button
          onClick={handleExport}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export JSON
        </Button>
        
        <Button
          onClick={handleImport}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Import JSON
        </Button>
      </div>
      
      <div className="ml-auto">
        <Button
          onClick={onCompareToggle}
          variant={isCompareOpen ? "default" : "outline"}
          size="sm"
          className="gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          {isCompareOpen ? 'Hide Compare' : 'Compare'}
        </Button>
      </div>
    </div>
  );
}