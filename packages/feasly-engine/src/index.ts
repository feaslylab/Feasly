import Decimal from "decimal.js";
import { ProjectInputs } from "./types";
import { dtYears, discountFactors } from "./time";

export type DecimalArray = Decimal[];

export type EngineOutput = {
  revenue: { rev_sales: DecimalArray; rev_rent: DecimalArray; vat_output: DecimalArray; billings_total: DecimalArray; detail: Record<string, unknown>; };
  costs:   { capex: DecimalArray; opex: DecimalArray; vat_input: DecimalArray; detail: Record<string, unknown>; };
  financing: Record<string, unknown>;
  tax: { vat_net: DecimalArray; corp: DecimalArray; zakat: DecimalArray; };
  cash: { project_before_fin: DecimalArray; project: DecimalArray; equity_cf: DecimalArray; };
  time: { df: number[]; dt: number[]; };
};

function zeros(n:number): Decimal[] { return Array.from({length:n}, () => new Decimal(0)); }

export function runModel(rawInputs: unknown): EngineOutput {
  const inputs = ProjectInputs.parse(rawInputs);
  const T = inputs.project.periods;
  const dt = dtYears(T);
  const df = discountFactors(T);

  return {
    revenue: { rev_sales: zeros(T), rev_rent: zeros(T), vat_output: zeros(T), billings_total: zeros(T), detail:{} },
    costs:   { capex: zeros(T), opex: zeros(T), vat_input: zeros(T), detail:{} },
    financing: {},
    tax: { vat_net: zeros(T), corp: zeros(T), zakat: zeros(T) },
    cash: { project_before_fin: zeros(T), project: zeros(T), equity_cf: zeros(T) },
    time: { df, dt }
  };
}

export { ProjectInputs } from "./types";