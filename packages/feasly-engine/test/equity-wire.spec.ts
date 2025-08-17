import { describe, it, expect } from 'vitest';
import { runModel } from '../src';

describe('Equity wire-up', () => {
  it('returns equity object with numeric arrays and kpis', () => {
    const T = 12;
    const inputs: any = {
      project: {
        start_date: "2024-01-01",
        periods: T,
        periodicity: "monthly"
      },
      // minimal viable inputs; extend as your engine requires:
      equity: {
        enabled: true,
        call_order: "pro_rata_commitment",
        distribution_frequency: "monthly",
        classes: [{
          key: "class_a",
          seniority: 1,
          pref_rate_pa: 0.08,
          pref_compounding: "simple",
          distribution_frequency: "monthly",
          catchup: { enabled: true, target_gp_share: 0.2, basis: "over_roc_and_pref" },
          tiers: [{ irr_hurdle_pa: 0.08, split_lp: 0.8, split_gp: 0.2, hurdle_basis: "lp_class_irr" }]
        }],
        investors: [
          { key: "lp1", class_key: "class_a", role: "lp", commitment: 800000 },
          { key: "gp1", class_key: "class_a", role: "gp", commitment: 200000 }
        ],
      },
      // any other required inputs for your engine default compute
    };

    const res: any = runModel(inputs);
    expect(res).toBeTruthy();
    expect(res.equity).toBeTruthy();

    const eq = res.equity;
    expect(Array.isArray(eq.calls_total)).toBe(true);
    expect(eq.calls_total.length).toBe(T);
    expect(Array.isArray(eq.dists_total)).toBe(true);
    expect(eq.dists_total.length).toBe(T);

    expect(eq.kpis).toBeTruthy();
    expect(eq.kpis).toHaveProperty('irr_pa');

    // detail debug shape may be empty but must be present
    expect(eq.detail?.class_ledgers).toBeTruthy();
  });
});