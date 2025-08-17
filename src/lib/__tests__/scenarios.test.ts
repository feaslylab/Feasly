import { describe, it, expect, beforeEach } from 'vitest';
import { 
  loadScenarios, 
  addSnapshot, 
  renameSnapshot, 
  duplicateSnapshot, 
  deleteSnapshot,
  exportScenariosJSON,
  importScenariosJSON,
  computeDeltas,
  makeSnapshotName,
  type ScenarioSnapshot 
} from '../scenarios';

// Mock localStorage
const localStorageMock = {
  getItem: vitest.fn(),
  setItem: vitest.fn(),
  removeItem: vitest.fn(),
  clear: vitest.fn()
};
global.localStorage = localStorageMock as any;

beforeEach(() => {
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
});

describe('scenarios', () => {
  const mockSnapshot: ScenarioSnapshot = {
    id: 'test-id',
    name: 'Test Scenario',
    createdAt: '2023-01-01T00:00:00.000Z',
    inputs: { test: 'data' },
    summary: {
      irr_pa: 15.5,
      tvpi: 2.1,
      dpi: 1.8,
      rvpi: 0.3,
      moic: 2.0,
      gp_clawback_last: 1000000
    },
    traces: {
      T: 3,
      calls_total: [100, 200, 300],
      dists_total: [50, 150, 250],
      gp_promote: [10, 20, 30],
      gp_clawback: [5, 15, 25]
    }
  };

  it('loadScenarios returns default when no data', () => {
    localStorageMock.getItem.mockReturnValue(null);
    const result = loadScenarios();
    expect(result).toEqual({ version: 1, items: [] });
  });

  it('addSnapshot works correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    const result = addSnapshot(mockSnapshot);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual(mockSnapshot);
  });

  it('renameSnapshot updates name', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ version: 1, items: [mockSnapshot] }));
    const result = renameSnapshot('test-id', 'New Name');
    expect(result.items[0].name).toBe('New Name');
  });

  it('computeDeltas calculates correctly', () => {
    const snapshotA = { ...mockSnapshot };
    const snapshotB = {
      ...mockSnapshot,
      id: 'test-id-2',
      summary: {
        irr_pa: 20.0,
        tvpi: 2.5,
        dpi: 2.0,
        rvpi: 0.5,
        moic: 2.2,
        gp_clawback_last: 1200000
      },
      traces: {
        T: 3,
        calls_total: [120, 220, 320],
        dists_total: [60, 160, 260],
        gp_promote: [15, 25, 35],
        gp_clawback: [8, 18, 28]
      }
    };

    const deltas = computeDeltas(snapshotA, snapshotB);
    expect(deltas.kpi.irr_pa).toBe(4.5);
    expect(deltas.kpi.tvpi).toBe(0.4);
    expect(deltas.series.calls_total).toEqual([20, 20, 20]);
  });

  it('exportScenariosJSON and importScenariosJSON round-trip', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ version: 1, items: [mockSnapshot] }));
    const exported = exportScenariosJSON();
    const imported = importScenariosJSON(exported);
    expect(imported.items).toHaveLength(1);
    expect(imported.items[0].name).toBe(mockSnapshot.name);
  });

  it('makeSnapshotName generates correct format', () => {
    const name = makeSnapshotName('Base');
    expect(name).toMatch(/^Base - \w+ \d+, \d{2}:\d{2}$/);
  });
});