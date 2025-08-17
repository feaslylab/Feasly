'use client';
import React, { useMemo, useState } from 'react';
import { listPresets } from '@/lib/presets';
import { useEngine, useEngineNumbers } from '@/lib/engine/EngineContext';
import { runPreview } from '@/lib/engine/preview';
import { fmtAED, fmtPct, safeNum } from '@/lib/format';
import { addSnapshot } from '@/lib/scenarios';
import { v4 as uuid } from 'uuid';
import { useToast } from '@/hooks/use-toast';

interface ScenarioPresetsProps {
  onInputsChange?: (inputs: any) => void;
}

export default function ScenarioPresets({ onInputsChange }: ScenarioPresetsProps) {
  const presets = useMemo(() => listPresets(), []);
  const { inputs } = useEngine();
  const numbers = useEngineNumbers();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const { toast } = useToast();
  const [delta, setDelta] = useState<null | {
    name: string;
    current: any; // equity
    candidate: any; // equity
  }>(null);

  const doPreview = (id: string) => {
    const p = presets.find(x => x.id === id);
    if (!p) return;
    
    try {
      const candidateInputs = p.apply(inputs);
      const currentEquity = numbers?.equity ?? null;
      const candidate = runPreview(candidateInputs).equity;
      setPreviewId(id);
      setDelta({
        name: p.name,
        current: currentEquity,
        candidate,
      });
    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: 'Preview Failed',
        description: 'Unable to generate preview for this preset',
        variant: 'destructive'
      });
    }
  };

  const applyPreset = () => {
    if (!previewId) return;
    const p = presets.find(x => x.id === previewId);
    if (!p) return;
    
    try {
      const newInputs = p.apply(inputs);
      
      // If we have an onInputsChange callback, use it
      if (onInputsChange) {
        onInputsChange(newInputs);
      }

      // auto-save snapshot
      const eq = numbers?.equity;
      const T = eq?.calls_total?.length ?? 0;
      const last = Math.max(0, T - 1);
      addSnapshot({
        id: uuid(),
        name: `Preset: ${p.name}`,
        createdAt: new Date().toISOString(),
        inputs: newInputs,
        summary: {
          irr_pa: eq?.kpis?.irr_pa ?? null,
          tvpi: safeNum(eq?.kpis?.tvpi),
          dpi: safeNum(eq?.kpis?.dpi),
          rvpi: safeNum(eq?.kpis?.rvpi),
          moic: safeNum(eq?.kpis?.moic),
          gp_clawback_last: safeNum(eq?.gp_clawback?.[last]),
        },
        traces: {
          T,
          calls_total: (eq?.calls_total ?? []).map(safeNum),
          dists_total: (eq?.dists_total ?? []).map(safeNum),
          gp_promote: (eq?.gp_promote ?? []).map(safeNum),
          gp_clawback: (eq?.gp_clawback ?? []).map(safeNum),
        },
      });
      
      // clear preview
      setPreviewId(null);
      setDelta(null);
      
      toast({
        title: 'Preset Applied',
        description: `${p.name} has been applied and saved as a snapshot`,
      });
    } catch (error) {
      console.error('Apply preset error:', error);
      toast({
        title: 'Apply Failed',
        description: 'Unable to apply this preset',
        variant: 'destructive'
      });
    }
  };

  // Simple compact diff block
  const Diff = () => {
    if (!delta?.current || !delta?.candidate) return null;
    const cur = delta.current.kpis ?? {};
    const cand = delta.candidate.kpis ?? {};
    const irr = (x: any) => x?.irr_pa ?? null;
    const pretty = (x: number | null) => (x == null ? 'N/A' : fmtPct(x));
    const color = (v: number) => (v > 0 ? 'text-emerald-600' : v < 0 ? 'text-red-600' : 'text-muted-foreground');

    const irrCur = irr(cur), irrNew = irr(cand);
    const irrDelta = irrCur != null && irrNew != null ? irrNew - irrCur : null;

    return (
      <div className="mt-3 rounded-lg border p-3 bg-card">
        <div className="font-medium mb-2">Preview: {delta.name}</div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">IRR</div>
            <div>{pretty(irrCur)} → {pretty(irrNew)}</div>
            {irrDelta != null && (
              <div className={color(irrDelta)}>{(irrDelta*100).toFixed(1)}%</div>
            )}
          </div>
          <div>
            <div className="text-muted-foreground">TVPI</div>
            <div>{(cur.tvpi ?? 0).toFixed(2)}× → {(cand.tvpi ?? 0).toFixed(2)}×</div>
          </div>
          <div>
            <div className="text-muted-foreground">Clawback (last)</div>
            <div>
              {fmtAED(safeNum(delta.current?.gp_clawback?.slice(-1)[0]))} → {fmtAED(safeNum(delta.candidate?.gp_clawback?.slice(-1)[0]))}
            </div>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button 
            className="px-3 py-1.5 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80" 
            onClick={() => { setPreviewId(null); setDelta(null); }}
          >
            Cancel
          </button>
          <button 
            className="px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90" 
            onClick={applyPreset}
          >
            Apply & Save Snapshot
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-lg border p-3 bg-card">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Presets</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {presets.map(p => (
          <div key={p.id} className="border rounded-lg p-3 bg-card">
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-muted-foreground mt-1">{p.description}</div>
            <div className="mt-2">
              <button 
                className="px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90" 
                onClick={() => doPreview(p.id)}
              >
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>
      <Diff />
    </div>
  );
}