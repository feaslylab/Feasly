// apps/web/src/lib/format.ts
export const safeNum = (x: unknown): number => {
  const n = Number(x);
  if (!Number.isFinite(n)) return 0;
  return Object.is(n, -0) ? 0 : n;
};

export const fmtAED = (n: unknown): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'AED',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(safeNum(n));

export const fmtPct = (p: number | null): string =>
  p == null ? 'N/A' : `${(p * 100).toFixed(1)}%`;

// tiny helpers
export const sum = (arr: number[] | undefined) =>
  safeNum((arr ?? []).reduce((s, v) => s + safeNum(v), 0));

export const approxEq = (a: number, b: number, eps = 1e-6) =>
  Math.abs(safeNum(a) - safeNum(b)) <= eps;