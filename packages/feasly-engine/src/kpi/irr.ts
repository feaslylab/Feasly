/** Newton-Raphson IRR solver with multi-guess fallback.  
    Returns `null` if no root converges within tolerance. */
export function calcIRR(
  cashflow: number[],
  guesses: number[] = [0.1, 0.0, 0.2, -0.1, 0.3],
  tol = 1e-4,
  maxIter = 200
): number | null {
  const f = (r: number) =>
    cashflow.reduce((acc, c, i) => acc + c / (1 + r) ** i, 0);
  const df = (r: number) =>
    cashflow.reduce((acc, c, i) => acc - (i * c) / (1 + r) ** (i + 1), 0);

  for (const g of guesses) {
    let r = g;
    for (let i = 0; i < maxIter; i++) {
      const npv = f(r);
      if (Math.abs(npv) < tol) return r;
      const d = df(r);
      if (d === 0) break;
      r -= npv / d;
    }
  }
  return null;
}