import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/hooks/useFeaslyCalc', () => ({
  useFeaslyCalc: () => ({ cash:[1,-1], kpi:{ npv:0, projectIRR:0.1, profit:0 }}),
}));

vi.mock('@/hooks/useTableStores', () => ({
  useConstructionStoreScenario: () => ({ items:[], save:vi.fn(), reload:vi.fn() }),
  useSaleStore: () => ({ items:[], save:vi.fn(), reload:vi.fn() }),
  useRentalStore: () => ({ items:[], save:vi.fn(), reload:vi.fn() }),
}));

vi.mock('@/hooks/useKpiStore', () => ({ useKpiStore:()=>({ saveKPIs:vi.fn() }) }));

describe('useLiveRecalc', () => {
  it('returns cash & kpi', () => {
    const { result } = renderHook(()=>require('../useLiveRecalc').useLiveRecalc());
    expect(result.current.cash[0]).toBe(1);
    expect(result.current.kpi.projectIRR).toBe(0.1);
  });
});