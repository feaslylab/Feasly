import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ScenarioCompare } from '../ScenarioCompare';
import { type ScenarioSnapshot } from '@/lib/scenarios';

// Mock hooks
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

const mockSnapshot1: ScenarioSnapshot = {
  id: 'test-1',
  name: 'Base Case',
  createdAt: '2023-01-01T00:00:00.000Z',
  inputs: {},
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

const mockSnapshot2: ScenarioSnapshot = {
  ...mockSnapshot1,
  id: 'test-2',
  name: 'Optimistic Case',
  summary: {
    irr_pa: 20.0,
    tvpi: 2.5,
    dpi: 2.0,
    rvpi: 0.5,
    moic: 2.2,
    gp_clawback_last: 1200000
  }
};

describe('ScenarioCompare', () => {
  it('renders empty state when no snapshots selected', () => {
    const { getByText } = render(<ScenarioCompare selectedIds={[]} />);
    expect(getByText(/select snapshots/i)).toBeInTheDocument();
  });

  it('renders single snapshot without deltas', () => {
    const { getByText } = render(<ScenarioCompare selectedIds={['test-1']} />);
    expect(getByText('Base Case')).toBeInTheDocument();
    expect(getByText('15.5%')).toBeInTheDocument();
  });

  it('renders comparison with deltas for multiple snapshots', () => {
    const { getByText } = render(<ScenarioCompare selectedIds={['test-1', 'test-2']} />);
    expect(getByText('Base Case')).toBeInTheDocument();
    expect(getByText('Optimistic Case')).toBeInTheDocument();
    // Should show delta indicators
    expect(getByText('+4.5%')).toBeInTheDocument();
  });

  it('handles null IRR gracefully', () => {
    const snapshotWithNullIRR = {
      ...mockSnapshot1,
      summary: { ...mockSnapshot1.summary, irr_pa: null }
    };
    
    const { getByText } = render(<ScenarioCompare selectedIds={['test-1']} />);
    expect(getByText('N/A')).toBeInTheDocument();
  });
});