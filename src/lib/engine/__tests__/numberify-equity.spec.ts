import { describe, it, expect } from 'vitest';
import { numberifyEquity } from '../numberify';

describe('numberifyEquity', () => {
  it('converts decimals and keeps irr_pa nullable', () => {
    const eq = numberifyEquity({
      calls_total: [0, 1, 2],
      dists_total: [0, 0.5, 1],
      gp_promote: [0, 0, 0],
      gp_clawback: [0, 0, 0],
      calls_by_investor: { a: [1], b: [2] },
      dists_by_investor: { a: [0], b: [0] },
      kpis: { irr_pa: null, tvpi: 1, dpi: 0.5, rvpi: 0.5, moic: 1, by_investor: {} },
      detail: {
        class_ledgers: {
          pref_balance: { class_a: 0 },
          excess_distributions_cum: { class_a: 0 },
          gp_catchup_cum: { class_a: 0 },
          gp_promote_cum: { class_a: 0 },
          debug: {
            class_a: {
              catchup: [{ t: 6, A: 100, G: 0, Y: 20 }],
              tiers: [{ t: 6, tierIdx: 0, x: 1000, split_lp: 0.8, split_gp: 0.2, r_target_m: 0.00643 }]
            }
          }
        },
        investor_ledgers: { unreturned_capital: { a: 1, b: 1 } }
      }
    });
    expect(eq.kpis.irr_pa).toBe(null);
    expect(eq.detail.class_ledgers.debug.class_a.catchup[0].Y).toBe(20);
  });
});