import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScenarioBar } from './ScenarioBar';
import { ScenarioList } from './ScenarioList';
import { ScenarioCompare } from './ScenarioCompare';
import { type ScenarioId } from '@/lib/scenarios';
import { parseShareURL } from '@/lib/scenarios/share';
import { useToast } from '@/hooks/use-toast';

interface ScenarioDockProps {
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
  onInputsChange?: (inputs: any) => void;
}

export function ScenarioDock({ currentInputs, currentResults, onInputsChange }: ScenarioDockProps) {
  const [searchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<ScenarioId[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  // Auto-open if baseline scenario is specified
  useEffect(() => {
    const scenario = searchParams.get('scenario');
    if (scenario === 'baseline') {
      setIsCompareOpen(false); // Keep it in list mode but ensure it's "open"
    }
  }, [searchParams]);

  // Auto-detect share tokens on load (deep-link)
  useEffect(() => {
    const snap = parseShareURL();
    if (!snap) return;
    // optional: clear hash to avoid re-trigger
    history.replaceState(null, "", location.pathname + location.search);
    if (window.confirm(`Load shared scenario "${snap.name}" into preview?`)) {
      if (onInputsChange) {
        onInputsChange(snap.inputs);
      }
      toast({ title: "Loaded shared scenario", description: snap.name });
    }
  }, [onInputsChange, toast]);

  const handleSnapshotSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCompareToggle = () => {
    setIsCompareOpen(prev => !prev);
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center justify-between">
          Scenario Analysis
        </CardTitle>
      </CardHeader>
      
      <ScenarioBar
        onCompareToggle={handleCompareToggle}
        isCompareOpen={isCompareOpen}
        currentInputs={currentInputs}
        currentResults={currentResults}
        onSnapshotSaved={handleSnapshotSaved}
      />

      <CardContent className="pt-4">
        <Tabs value={isCompareOpen ? "compare" : "list"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="list" 
              onClick={() => setIsCompareOpen(false)}
            >
              Saved Scenarios
            </TabsTrigger>
            <TabsTrigger 
              value="compare" 
              onClick={() => setIsCompareOpen(true)}
            >
              Compare ({selectedIds.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-4">
            <ScenarioList
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              refreshTrigger={refreshTrigger}
            />
          </TabsContent>
          
          <TabsContent value="compare" className="mt-4">
            <ScenarioCompare selectedIds={selectedIds} onInputsChange={onInputsChange} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}