import Decimal from "decimal.js";

/**
 * Build time series index multipliers from annual rate
 */
export function buildIndexSeries(ratePa: number, T: number): Decimal[] {
  const monthlyFactor = Math.pow(1 + ratePa, 1/12);
  return Array.from({ length: T }, (_, t) => 
    new Decimal(Math.pow(monthlyFactor, t))
  );
}

/**
 * Normalize and resample curve to target length T
 */
export function normalizeCurve(
  values: number[] | undefined, 
  T: number, 
  meaning: "sell_through" | "occupancy"
): Decimal[] {
  if (!values || values.length === 0) {
    return Array.from({ length: T }, () => new Decimal(0));
  }

  // Resample to target length
  const resampled = resampleToT(values, T);
  
  if (meaning === "sell_through") {
    // Normalize to sum = 1
    const sum = resampled.reduce((acc, v) => acc + v, 0);
    const factor = sum > 0 ? 1 / sum : 0;
    return resampled.map(v => new Decimal(v * factor));
  } else {
    // Occupancy: clamp to [0, 1]
    return resampled.map(v => new Decimal(Math.max(0, Math.min(1, v))));
  }
}

/**
 * Linear resampling from source array to target length
 */
function resampleToT(source: number[], T: number): number[] {
  if (source.length === T) return [...source];
  if (T === 0) return [];
  if (source.length === 0) return Array(T).fill(0);

  const result: number[] = [];
  for (let i = 0; i < T; i++) {
    const pos = (i * (source.length - 1)) / (T - 1);
    const low = Math.floor(pos);
    const high = Math.ceil(pos);
    
    if (low === high || high >= source.length) {
      result.push(source[Math.min(low, source.length - 1)]);
    } else {
      const weight = pos - low;
      result.push(source[low] * (1 - weight) + source[high] * weight);
    }
  }
  
  return result;
}