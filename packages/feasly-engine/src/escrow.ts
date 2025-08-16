import Decimal from "decimal.js";
import { ProjectInputs, clamp01 } from "./types";

/** progress[t] = cum(cost) / total(cost) ; safe for total=0 */
export function buildProjectProgress(costCapex: Decimal[]): number[] {
  const T = costCapex.length;
  const total = costCapex.reduce((a, b) => a.add(b), new Decimal(0));
  const out: number[] = new Array(T).fill(0);
  if (total.isZero()) return out;

  let acc = new Decimal(0);
  for (let t = 0; t < T; t++) {
    acc = acc.add(costCapex[t]);
    out[t] = clamp01(acc.div(total).toNumber());
  }
  return out;
}

/** α/β cumulative release curve given progress in [0,1].
 *  Simple, monotone, no external libs:
 *  - If beta == 1 → p^alpha
 *  - Else → normalized p^alpha / (p^alpha + (1-p)^beta)
 */
export function alphaBetaCum(p: number, alpha: number, beta: number): number {
  const a = Math.max(alpha, 1e-9), b = Math.max(beta, 1e-9);
  const pa = Math.pow(clamp01(p), a);
  if (Math.abs(b - 1) < 1e-9) return clamp01(pa);
  const qb = Math.pow(1 - clamp01(p), b);
  const norm = pa + qb;
  return norm <= 0 ? 0 : clamp01(pa / norm);
}

export function buildAllowedReleaseSeries(
  inputs: ProjectInputs,
  progress: number[],
  contractValueTotal: Decimal
): { 
  allowed_release: Decimal[]; 
  clamping_occurred: boolean;
} {
  const T = progress.length;
  const out = new Array<Decimal>(T).fill(new Decimal(0));
  let clampingOccurred = false;

  if (!inputs.escrow?.wafi_enabled) {
    return { 
      allowed_release: out.map(() => new Decimal(0)), 
      clamping_occurred: false 
    };
  }

  const { alpha, beta } = inputs.escrow.collection_cap ?? { alpha: 1, beta: 1 };
  let cumAllowed = new Decimal(0);

  for (let t = 0; t < T; t++) {
    const fracCum = inputs.escrow.release_rules === "milestones"
      ? milestoneCum(inputs, t)
      : alphaBetaCum(progress[t], alpha, beta);
    const targetCum = contractValueTotal.mul(fracCum);
    const periodAllowed = Decimal.max(new Decimal(0), targetCum.minus(cumAllowed));
    out[t] = periodAllowed;
    cumAllowed = cumAllowed.add(periodAllowed);
  }
  
  return { 
    allowed_release: out, 
    clamping_occurred: clampingOccurred 
  };
}

function milestoneCum(inputs: ProjectInputs, t: number): number {
  // milestones provide pct_cum_release; assume they're keyed by month index
  const ms = inputs.escrow.milestones ?? [];
  const maxPct = ms
    .filter(m => m.month <= t)
    .reduce((mx, m) => Math.max(mx, clamp01(m.pct_cum_release)), 0);
  return maxPct;
}