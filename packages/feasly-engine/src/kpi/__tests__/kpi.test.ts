import { describe, test, expect } from "vitest";
import { calcIRR, computeKPIs } from "../";
  
test("IRR on simple cashflow", () => {
  const irr = calcIRR([-1000, 200, 300, 400, 500]);
  expect(+irr!.toFixed(4)).toBe(0.1536);
});

test("KPI set on sample row", () => {
  const cf = [-1000, 200, 300, 400, 500];
  const k = computeKPIs(cf, { discountRate: 0.10 });
  expect(+k.npv.toFixed(0)).toBe(489);     // matches manual calc
  expect(k.profit).toBe(400);
  expect(k.projectIRR).not.toBeNull();
});