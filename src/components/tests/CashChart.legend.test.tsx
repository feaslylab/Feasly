import { render } from '@testing-library/react';
import CashChart from '../CashChart';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/hooks/useCashSeries', () => ({
  useCashSeries: () => ([
    { period: 'P0', inflow: 1, outflow: 0, net: 1 },
    { period: 'P1', inflow: 0, outflow: 1, net: -1 },
  ])
}));

describe('CashChart legend', () => {
  it('renders legend entries', () => {
    const { getByText } = render(<CashChart />);
    expect(getByText(/Inflow/i)).toBeInTheDocument();
    expect(getByText(/Outflow/i)).toBeInTheDocument();
    expect(getByText(/Net/i)).toBeInTheDocument();
  });
});