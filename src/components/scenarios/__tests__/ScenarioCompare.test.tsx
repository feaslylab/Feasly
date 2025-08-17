import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ScenarioCompare } from '../ScenarioCompare';
import * as scenarios from '@/lib/scenarios';

// Mock the scenarios module
vi.mock('@/lib/scenarios', () => ({
  loadScenarios: vi.fn(),
  computeDeltas: vi.fn(),
  exportComparisonCSV: vi.fn(),
  getPinned: vi.fn(),
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockScenario1 = {
  id: 'scenario-1',
  name: 'Base Case',
  createdAt: '2024-01-01T00:00:00Z',
  inputs: {},
  summary: {
    irr_pa: 0.15,
    tvpi: 2.5,
    dpi: 1.8,
    rvpi: 0.7,
    moic: 2.5,
    gp_clawback_last: 100000,
  },
  traces: {
    T: 5,
    calls_total: [100, 200, 300, 200, 100],
    dists_total: [0, 50, 150, 400, 600],
    gp_promote: [0, 5, 15, 40, 60],
    gp_clawback: [0, 0, 0, 10, 20],
  },
  label: 'Conservative',
  pinned: true,
};

const mockScenario2 = {
  id: 'scenario-2',
  name: 'Optimistic Case',
  createdAt: '2024-01-02T00:00:00Z',
  inputs: {},
  summary: {
    irr_pa: 0.18,
    tvpi: 3.0,
    dpi: 2.2,
    rvpi: 0.8,
    moic: 3.0,
    gp_clawback_last: 120000,
  },
  traces: {
    T: 5,
    calls_total: [100, 200, 300, 200, 100],
    dists_total: [0, 60, 180, 480, 720],
    gp_promote: [0, 6, 18, 48, 72],
    gp_clawback: [0, 0, 0, 12, 24],
  },
  label: 'Aggressive',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ScenarioCompare', () => {
  it('renders empty state when no scenarios selected', () => {
    vi.mocked(scenarios.loadScenarios).mockReturnValue({
      version: 1,
      items: [],
    });

    const { getByText } = render(<ScenarioCompare selectedIds={[]} />);
    
    expect(getByText('No scenarios selected')).toBeInTheDocument();
    expect(getByText('Select 1-3 scenarios from the list to compare them.')).toBeInTheDocument();
  });

  it('renders KPI comparison table with scenarios and deltas', () => {
    vi.mocked(scenarios.loadScenarios).mockReturnValue({
      version: 1,
      items: [mockScenario1, mockScenario2],
    });

    vi.mocked(scenarios.computeDeltas).mockReturnValue({
      kpi: {
        irr_pa: 0.03,
        tvpi: 0.5,
        dpi: 0.4,
        rvpi: 0.1,
        moic: 0.5,
        gp_clawback_last: 20000,
      },
      series: {
        calls_total: [0, 0, 0, 0, 0],
        dists_total: [0, 10, 30, 80, 120],
        gp_promote: [0, 1, 3, 8, 12],
        gp_clawback: [0, 0, 0, 2, 4],
      },
    });

    const { getByText } = render(<ScenarioCompare selectedIds={['scenario-1', 'scenario-2']} />);
    
    expect(getByText('Comparing 2 scenarios')).toBeInTheDocument();
    expect(getByText('Key Performance Indicators')).toBeInTheDocument();
    expect(getByText('Base Case')).toBeInTheDocument();
    expect(getByText('Optimistic Case')).toBeInTheDocument();
    expect(getByText('(Baseline)')).toBeInTheDocument();
    expect(getByText('Δ vs Baseline')).toBeInTheDocument();
  });

  it('handles null IRR values gracefully', () => {
    const scenarioWithNullIRR = {
      ...mockScenario1,
      summary: { ...mockScenario1.summary, irr_pa: null },
    };

    vi.mocked(scenarios.loadScenarios).mockReturnValue({
      version: 1,
      items: [scenarioWithNullIRR],
    });

    const { getByText } = render(<ScenarioCompare selectedIds={['scenario-1']} />);
    
    expect(getByText('N/A')).toBeInTheDocument();
  });

  it('exports CSV when export button clicked', () => {
    vi.mocked(scenarios.loadScenarios).mockReturnValue({
      version: 1,
      items: [mockScenario1, mockScenario2],
    });

    vi.mocked(scenarios.exportComparisonCSV).mockReturnValue('csv,data\ntest,123');

    // Mock URL.createObjectURL and other DOM APIs
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
    
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

    const { getByText } = render(<ScenarioCompare selectedIds={['scenario-1', 'scenario-2']} />);
    
    const exportButton = getByText('Export CSV');
    exportButton.click();
    
    expect(scenarios.exportComparisonCSV).toHaveBeenCalledWith([mockScenario1, mockScenario2]);
    expect(mockLink.click).toHaveBeenCalled();
  });

  it('shows scenario labels in headers', () => {
    vi.mocked(scenarios.loadScenarios).mockReturnValue({
      version: 1,
      items: [mockScenario1, mockScenario2],
    });

    const { getByText } = render(<ScenarioCompare selectedIds={['scenario-1', 'scenario-2']} />);
    
    expect(getByText('(Conservative)')).toBeInTheDocument();
    expect(getByText('(Aggressive)')).toBeInTheDocument();
  });

  it('uses pinned scenario as baseline', () => {
    vi.mocked(scenarios.getPinned).mockReturnValue(mockScenario1);
    vi.mocked(scenarios.loadScenarios).mockReturnValue({
      version: 1,
      items: [mockScenario1, mockScenario2],
    });

    const { getByText } = render(<ScenarioCompare selectedIds={['scenario-2']} />);
    
    // Should include pinned scenario as baseline
    expect(getByText('Base Case')).toBeInTheDocument();
    expect(getByText('Optimistic Case')).toBeInTheDocument();
  });
});