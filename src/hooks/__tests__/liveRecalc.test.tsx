import { renderHook } from '@testing-library/react';
import { useFeaslyCalc } from '@/hooks/useFeaslyCalc';
import { describe, it, expect } from 'vitest';

describe('Live recalculation', () => {
  it('re-computes when construction cost changes', () => {
    const { result, rerender } = renderHook(
      ({base}) => useFeaslyCalc([{ 
        baseCost: base, 
        startPeriod: 0, 
        endPeriod: 0,
        escalationRate: 0, 
        retentionPercent: 0, 
        retentionReleaseLag: 0 
      }], 6),
      { initialProps: { base: 1_000_000 } }
    );
    
    const firstNet = result.current.cash[0];

    // change prop → simulates store edit
    rerender({ base: 2_000_000 });
    const secondNet = result.current.cash[0];

    expect(secondNet).toBeLessThan(firstNet);  // bigger cost => more negative
  });
});