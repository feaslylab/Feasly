import { buildConstructionRow } from "../construction";

test("escalation + retention release", () => {
  const row = buildConstructionRow({
    baseCost: 12_000_000,
    startPeriod: 6,
    endPeriod:   24,
    escalationRate: 0.05,
    retentionPercent: 0.05,
    retentionReleaseLag: 2
  }, 60);

  // sum check: escalated 12M *1.075 = 12.9M
  const total = +row.reduce((a,b)=>a+b,0).toFixed(0);
  expect(total).toBe(12900000);

  // retention release at P26
  expect(row[26]).toBeCloseTo(645000, 0);   // 5 % retained
});