import { nominalToEffective, effectiveToNominal, periodicFactor } from "../interest";

test("12 % nominal, monthly → 12.68 % effective", () => {
  expect(+nominalToEffective(0.12, 12).toFixed(4)).toBe(0.1268);
});

test("back-conversion nominal ↔ effective", () => {
  const eff = nominalToEffective(0.08, 4);
  const nom = effectiveToNominal(eff, 4);
  expect(+nom.toFixed(6)).toBeCloseTo(0.08, 6);
});

test("periodic factor month @10 % eff", () => {
  expect(+periodicFactor(0.10, 1).toFixed(6)).toBeCloseTo(1.007974, 6);
});