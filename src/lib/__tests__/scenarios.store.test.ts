import { describe, it, expect, beforeEach, vi } from 'vitest';
import { addSnapshot, loadScenarios, updateSnapshot, getPinned } from '@/lib/scenarios';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

beforeEach(() => {
  localStorageMock.clear.mockClear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
});

describe('scenarios store', () => {
  const mockSnapshot = {
    id: 'test-id',
    name: 'Test Scenario',
    createdAt: new Date().toISOString(),
    inputs: {},
    summary: {
      irr_pa: null,
      tvpi: 1,
      dpi: 1,
      rvpi: 0,
      moic: 1,
      gp_clawback_last: 0,
    },
    traces: {
      T: 0,
      calls_total: [],
      dists_total: [],
      gp_promote: [],
      gp_clawback: [],
    },
  };

  it('pins only one snapshot', () => {
    // Setup: empty localStorage initially
    localStorageMock.getItem.mockReturnValue(null);
    
    // Add two snapshots
    const snapshotA = { ...mockSnapshot, id: 'a', name: 'A' };
    const snapshotB = { ...mockSnapshot, id: 'b', name: 'B' };
    
    addSnapshot(snapshotA);
    addSnapshot(snapshotB);
    
    // Mock the storage with both items
    const mockState = {
      version: 1,
      items: [snapshotA, snapshotB]
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockState));
    
    // Pin first snapshot
    updateSnapshot('a', { pinned: true });
    expect(getPinned()?.id).toBe('a');
    
    // Pin second snapshot - should unpin first
    updateSnapshot('b', { pinned: true });
    expect(getPinned()?.id).toBe('b');
  });

  it('updates label and note', () => {
    const snapshot = { ...mockSnapshot };
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      version: 1,
      items: [snapshot]
    }));
    
    updateSnapshot(snapshot.id, { label: 'LP-friendly', note: 'For IC deck' });
    
    const refreshed = loadScenarios().items.find(x => x.id === snapshot.id);
    expect(refreshed?.label).toBe('LP-friendly');
    expect(refreshed?.note).toBe('For IC deck');
  });

  it('loads scenarios with default empty state', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const scenarios = loadScenarios();
    expect(scenarios.version).toBe(1);
    expect(scenarios.items).toEqual([]);
  });

  it('handles malformed localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');
    
    const scenarios = loadScenarios();
    expect(scenarios.version).toBe(1);
    expect(scenarios.items).toEqual([]);
  });
});