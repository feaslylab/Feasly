export const fmtPct = (v: number | null | undefined, dp = 1) =>
  v == null || !Number.isFinite(v) ? 'N/A' : `${(v * 100).toFixed(dp)}%`;

export const fmtMult = (v: number | null | undefined, dp = 2) =>
  v == null || !Number.isFinite(v) ? 'N/A' : `${v.toFixed(dp)}×`;

export const fmtCurrency = (
  v: number | null | undefined,
  currency = 'AED',
  dp = 0,
) =>
  v == null || !Number.isFinite(v)
    ? '—'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: dp,
        maximumFractionDigits: dp,
      }).format(v);