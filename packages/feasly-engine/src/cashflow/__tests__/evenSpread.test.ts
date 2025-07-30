import { expandCost } from "../evenSpread";

test("simple cost spread", () => {
  const row = expandCost({ amount: 1_200_000, startPeriod:1, endPeriod:3,
                           escalationRate:0 }, 12);
  expect(row.slice(1,4)).toEqual([400000,400000,400000]);
});

test("compound escalation", () => {
  const row = expandCost({ amount: 1_000_000, startPeriod:0, endPeriod:12,
                           escalationRate:0.06 }, 24);
  const total = +row.reduce((a,b)=>a+b,0).toFixed(0);
  expect(total).toBe(1_061_678);     // 1M *1.06
});