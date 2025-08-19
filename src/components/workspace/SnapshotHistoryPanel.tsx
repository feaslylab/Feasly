import { useState, useEffect } from 'react';
import { useEngine } from '@/lib/engine/EngineContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Database, TrendingUp, RefreshCw } from 'lucide-react';
import { fmtPct, fmtMult, fmtCurrency } from '@/lib/formatters';

interface Snapshot {
  id: string;
  name: string;
  createdAt: string;
  inputs: any;
  summary: {
    irr_pa: number | null;
    tvpi: number;
    dpi: number;
    rvpi: number;
    moic: number;
    gp_clawback_last: number;
  };
  traces: any;
}

export default function SnapshotHistoryPanel() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const { setInputs } = useEngine();
  const { toast } = useToast();

  // Load snapshots from localStorage
  useEffect(() => {
    const loadSnapshots = () => {
      try {
        const allKeys = Object.keys(localStorage);
        const snapshotKeys = allKeys.filter(key => key.startsWith('snapshot:'));
        
        const loadedSnapshots: Snapshot[] = [];
        
        for (const key of snapshotKeys) {
          try {
            const data = localStorage.getItem(key);
            if (data) {
              const snapshot = JSON.parse(data);
              loadedSnapshots.push(snapshot);
            }
          } catch (e) {
            console.warn(`Failed to parse snapshot ${key}:`, e);
          }
        }
        
        // Sort by creation date (most recent first)
        loadedSnapshots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setSnapshots(loadedSnapshots);
      } catch (e) {
        console.error('Failed to load snapshots:', e);
      } finally {
        setLoading(false);
      }
    };

    loadSnapshots();
  }, []);

  const handleRestore = (snapshot: Snapshot) => {
    try {
      setInputs(snapshot.inputs);
      toast({
        title: 'Snapshot Restored',
        description: snapshot.name,
      });
      
      // Analytics event
      console.log('[Analytics] snapshot_restored', { snapshotId: snapshot.id });
    } catch (e) {
      toast({
        title: 'Restore Failed',
        description: 'Failed to restore snapshot',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading snapshots...</span>
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Database className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Snapshots Yet</h3>
        <p className="text-muted-foreground mb-4">
          Save snapshots from the Results tab to preserve model states and compare scenarios.
        </p>
        <Badge variant="outline" className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Save your first snapshot to get started
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Snapshot History</h2>
          <p className="text-sm text-muted-foreground">
            View and restore previously saved model states
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Database className="w-3 h-3" />
          {snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-4">
        {snapshots.map((snapshot) => (
          <Card key={snapshot.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base font-medium">
                    {snapshot.name}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(snapshot.createdAt)}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleRestore(snapshot)}
                  className="shrink-0"
                >
                  Restore
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* KPI Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">IRR (pa)</p>
                  <p className="text-sm font-medium">
                    {fmtPct(snapshot.summary.irr_pa)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">TVPI</p>
                  <p className="text-sm font-medium">
                    {fmtMult(snapshot.summary.tvpi)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">DPI</p>
                  <p className="text-sm font-medium">
                    {fmtMult(snapshot.summary.dpi)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">RVPI</p>
                  <p className="text-sm font-medium">
                    {fmtMult(snapshot.summary.rvpi)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">MOIC</p>
                  <p className="text-sm font-medium">
                    {fmtMult(snapshot.summary.moic)}
                  </p>
                </div>
              </div>

              {/* GP Clawback if present */}
              {snapshot.summary.gp_clawback_last > 0 && (
                <div className="pt-2 border-t">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">GP Clawback</p>
                    <p className="text-sm font-medium text-amber-600">
                      {fmtCurrency(snapshot.summary.gp_clawback_last, 'AED')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}