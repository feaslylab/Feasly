// Minimal, stable public API for scenarios (client-side only)
export type ScenarioId = string;

export type ScenarioSnapshot = {
  id: ScenarioId;                 // uuid v4
  name: string;                   // user provided (e.g., "Base 8% Pref")
  createdAt: string;              // iso
  // Inputs and essential outputs to rehydrate view (no secrets)
  inputs: any;                    // current inputs at snapshot time
  summary: {
    irr_pa: number | null;
    tvpi: number; 
    dpi: number; 
    rvpi: number; 
    moic: number;
    gp_clawback_last: number;     // equity.gp_clawback?.[T-1] || 0
  };
  traces: {
    T: number;
    calls_total: number[];
    dists_total: number[];
    gp_promote: number[];
    gp_clawback: number[];
  };
  // Optional human notes
  note?: string;
};

export type ScenarioStateV1 = {
  version: 1;
  items: ScenarioSnapshot[];
};

export const SCEN_KEY = 'feasly.scenarios.v1';

function safeNum(val: unknown): number {
  const num = Number(val);
  return isNaN(num) || !isFinite(num) ? 0 : num;
}

export function loadScenarios(): ScenarioStateV1 {
  try {
    const stored = localStorage.getItem(SCEN_KEY);
    if (!stored) return { version: 1, items: [] };
    
    const parsed = JSON.parse(stored);
    if (parsed.version !== 1) return { version: 1, items: [] };
    
    return {
      version: 1,
      items: Array.isArray(parsed.items) ? parsed.items : []
    };
  } catch {
    return { version: 1, items: [] };
  }
}

export function saveScenarios(state: ScenarioStateV1): void {
  try {
    localStorage.setItem(SCEN_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save scenarios:', error);
  }
}

export function addSnapshot(s: ScenarioSnapshot): ScenarioStateV1 {
  const state = loadScenarios();
  const sanitized: ScenarioSnapshot = {
    ...s,
    summary: {
      irr_pa: s.summary.irr_pa,
      tvpi: safeNum(s.summary.tvpi),
      dpi: safeNum(s.summary.dpi),
      rvpi: safeNum(s.summary.rvpi),
      moic: safeNum(s.summary.moic),
      gp_clawback_last: safeNum(s.summary.gp_clawback_last)
    },
    traces: {
      T: Math.max(0, Math.floor(safeNum(s.traces.T))),
      calls_total: (s.traces.calls_total || []).map(safeNum),
      dists_total: (s.traces.dists_total || []).map(safeNum),
      gp_promote: (s.traces.gp_promote || []).map(safeNum),
      gp_clawback: (s.traces.gp_clawback || []).map(safeNum)
    }
  };
  
  state.items.push(sanitized);
  saveScenarios(state);
  return state;
}

export function renameSnapshot(id: ScenarioId, name: string): ScenarioStateV1 {
  const state = loadScenarios();
  const item = state.items.find(i => i.id === id);
  if (item) {
    item.name = name.trim() || 'Unnamed Snapshot';
    saveScenarios(state);
  }
  return state;
}

export function duplicateSnapshot(id: ScenarioId, newName?: string): ScenarioStateV1 {
  const state = loadScenarios();
  const original = state.items.find(i => i.id === id);
  if (!original) return state;
  
  const duplicate: ScenarioSnapshot = {
    ...original,
    id: crypto.randomUUID(),
    name: newName || `${original.name} (Copy)`,
    createdAt: new Date().toISOString()
  };
  
  state.items.push(duplicate);
  saveScenarios(state);
  return state;
}

export function deleteSnapshot(id: ScenarioId): ScenarioStateV1 {
  const state = loadScenarios();
  state.items = state.items.filter(i => i.id !== id);
  saveScenarios(state);
  return state;
}

// JSON import/export (safe)
export function exportScenariosJSON(): string {
  const state = loadScenarios();
  return JSON.stringify(state, null, 2);
}

export function importScenariosJSON(json: string): ScenarioStateV1 {
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid JSON format');
    }
    
    if (parsed.version !== 1) {
      throw new Error('Unsupported version');
    }
    
    if (!Array.isArray(parsed.items)) {
      throw new Error('Items must be an array');
    }
    
    // Validate and sanitize each item
    const validItems: ScenarioSnapshot[] = [];
    for (const item of parsed.items) {
      if (item && typeof item === 'object' && item.id && item.name) {
        validItems.push({
          id: item.id,
          name: String(item.name),
          createdAt: item.createdAt || new Date().toISOString(),
          inputs: item.inputs || {},
          summary: {
            irr_pa: typeof item.summary?.irr_pa === 'number' ? item.summary.irr_pa : null,
            tvpi: safeNum(item.summary?.tvpi),
            dpi: safeNum(item.summary?.dpi),
            rvpi: safeNum(item.summary?.rvpi),
            moic: safeNum(item.summary?.moic),
            gp_clawback_last: safeNum(item.summary?.gp_clawback_last)
          },
          traces: {
            T: Math.max(0, Math.floor(safeNum(item.traces?.T))),
            calls_total: Array.isArray(item.traces?.calls_total) ? item.traces.calls_total.map(safeNum) : [],
            dists_total: Array.isArray(item.traces?.dists_total) ? item.traces.dists_total.map(safeNum) : [],
            gp_promote: Array.isArray(item.traces?.gp_promote) ? item.traces.gp_promote.map(safeNum) : [],
            gp_clawback: Array.isArray(item.traces?.gp_clawback) ? item.traces.gp_clawback.map(safeNum) : []
          },
          note: item.note ? String(item.note) : undefined
        });
      }
    }
    
    const newState: ScenarioStateV1 = { version: 1, items: validItems };
    saveScenarios(newState);
    return newState;
  } catch (error) {
    throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Utilities
export function makeSnapshotName(base?: string): string {
  const now = new Date();
  const month = now.toLocaleDateString('en', { month: 'short' });
  const day = now.getDate();
  const time = now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
  
  if (base) {
    return `${base} - ${month} ${day}, ${time}`;
  }
  return `Snapshot ${month} ${day}, ${time}`;
}

export function computeDeltas(a: ScenarioSnapshot, b: ScenarioSnapshot): {
  kpi: { 
    irr_pa: number | null;
    tvpi: number;
    dpi: number;
    rvpi: number;
    moic: number;
    gp_clawback_last: number;
  };
  series: {
    calls_total: number[];
    dists_total: number[];
    gp_promote: number[];
    gp_clawback: number[];
  };
} {
  const kpi = {
    irr_pa: (a.summary.irr_pa !== null && b.summary.irr_pa !== null) 
      ? b.summary.irr_pa - a.summary.irr_pa 
      : null,
    tvpi: b.summary.tvpi - a.summary.tvpi,
    dpi: b.summary.dpi - a.summary.dpi,
    rvpi: b.summary.rvpi - a.summary.rvpi,
    moic: b.summary.moic - a.summary.moic,
    gp_clawback_last: b.summary.gp_clawback_last - a.summary.gp_clawback_last
  };
  
  const minLength = Math.min(
    Math.max(a.traces.calls_total.length, a.traces.dists_total.length, a.traces.gp_promote.length, a.traces.gp_clawback.length),
    Math.max(b.traces.calls_total.length, b.traces.dists_total.length, b.traces.gp_promote.length, b.traces.gp_clawback.length)
  );
  
  const padArray = (arr: number[], length: number): number[] => {
    const result = [...arr];
    while (result.length < length) result.push(0);
    return result.slice(0, length);
  };
  
  const aCalls = padArray(a.traces.calls_total, minLength);
  const bCalls = padArray(b.traces.calls_total, minLength);
  const aDists = padArray(a.traces.dists_total, minLength);
  const bDists = padArray(b.traces.dists_total, minLength);
  const aPromote = padArray(a.traces.gp_promote, minLength);
  const bPromote = padArray(b.traces.gp_promote, minLength);
  const aClawback = padArray(a.traces.gp_clawback, minLength);
  const bClawback = padArray(b.traces.gp_clawback, minLength);
  
  const series = {
    calls_total: bCalls.map((val, i) => val - aCalls[i]),
    dists_total: bDists.map((val, i) => val - aDists[i]),
    gp_promote: bPromote.map((val, i) => val - aPromote[i]),
    gp_clawback: bClawback.map((val, i) => val - aClawback[i])
  };
  
  return { kpi, series };
}

export function exportComparisonCSV(snapshots: ScenarioSnapshot[]): string {
  if (snapshots.length === 0) return '';
  
  const rows: string[] = [];
  
  // Header with snapshot names
  rows.push('Comparison,' + snapshots.map(s => `"${s.name}"`).join(','));
  rows.push('Created,' + snapshots.map(s => s.createdAt).join(','));
  rows.push('');
  
  // KPI section
  rows.push('KPIs');
  rows.push('Metric,' + snapshots.map(s => s.name).join(',') + 
    (snapshots.length > 1 ? ',' + snapshots.slice(1).map(s => `Δ vs ${snapshots[0].name}`).join(',') : ''));
  
  const kpiMetrics = [
    { key: 'irr_pa', label: 'IRR (%)' },
    { key: 'tvpi', label: 'TVPI' },
    { key: 'dpi', label: 'DPI' },
    { key: 'rvpi', label: 'RVPI' },
    { key: 'moic', label: 'MOIC' },
    { key: 'gp_clawback_last', label: 'GP Clawback (Last)' }
  ];
  
  kpiMetrics.forEach(metric => {
    const values = snapshots.map(s => {
      const val = s.summary[metric.key as keyof typeof s.summary];
      return val === null ? 'N/A' : val.toString();
    });
    
    let row = metric.label + ',' + values.join(',');
    
    if (snapshots.length > 1) {
      const deltas = snapshots.slice(1).map(s => {
        const baseline = snapshots[0].summary[metric.key as keyof typeof snapshots[0]['summary']];
        const current = s.summary[metric.key as keyof typeof s['summary']];
        if (baseline === null || current === null) return 'N/A';
        return (current as number - baseline as number).toString();
      });
      row += ',' + deltas.join(',');
    }
    
    rows.push(row);
  });
  
  rows.push('');
  
  // Series section
  const maxT = Math.max(...snapshots.map(s => s.traces.T));
  const seriesTypes = ['calls_total', 'dists_total', 'gp_promote', 'gp_clawback'];
  
  seriesTypes.forEach(seriesType => {
    rows.push(`${seriesType.replace('_', ' ')} Series`);
    rows.push('Period,' + snapshots.map(s => s.name).join(',') + 
      (snapshots.length > 1 ? ',' + snapshots.slice(1).map(s => `Δ vs ${snapshots[0].name}`).join(',') : ''));
    
    for (let i = 0; i < maxT; i++) {
      const values = snapshots.map(s => {
        const arr = s.traces[seriesType as keyof typeof s.traces] as number[];
        return (arr[i] || 0).toString();
      });
      
      let row = `Period ${i + 1},` + values.join(',');
      
      if (snapshots.length > 1) {
        const baseline = snapshots[0].traces[seriesType as keyof typeof snapshots[0]['traces']] as number[];
        const deltas = snapshots.slice(1).map(s => {
          const arr = s.traces[seriesType as keyof typeof s['traces']] as number[];
          return ((arr[i] || 0) - (baseline[i] || 0)).toString();
        });
        row += ',' + deltas.join(',');
      }
      
      rows.push(row);
    }
    
    rows.push('');
  });
  
  return rows.join('\n');
}