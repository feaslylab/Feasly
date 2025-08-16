"use client";
import React, { createContext, useContext, useMemo } from "react";
import { runModel, ProjectInputs } from "../../../packages/feasly-engine/src";
import { mapFormToProjectInputs } from "@/lib/mapFormToProjectInputs";
import {
  numberifyRevenue, numberifyCosts, numberifyFin,
  numberifyTax, numberifyDep, numberifyCash, numberifyBalanceSheet, numberifyPnL, numberifyCashFlow, numberifyCovenants
} from "@/lib/engine/numberify";

type EngineContextValue = {
  inputs: ProjectInputs;
  output: ReturnType<typeof runModel>;
};

const EngineContext = createContext<EngineContextValue | null>(null);

export function EngineProvider({
  formState,
  children,
}: { formState: any; children: React.ReactNode }) {
  // memoize inputs so we don't thrash re-computation
  const inputs = useMemo(() => mapFormToProjectInputs(formState), [formState]);

  // compute once per inputs change
  const output = useMemo(() => runModel(inputs), [inputs]);

  return (
    <EngineContext.Provider value={{ inputs, output }}>
      {children}
    </EngineContext.Provider>
  );
}

export function useEngine() {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error("useEngine must be used inside <EngineProvider>");
  return ctx;
}

// Narrow selectors to keep components clean
export function useRevenueTotals() {
  const { output } = useEngine();
  return output.revenue;
}

export function useEngineNumbers() {
  const { output } = useEngine();
  // Create a derived, memoized "numbers only" snapshot for charts/UI
  const num = useMemo(() => ({
    revenue: numberifyRevenue(output.revenue),
    costs: numberifyCosts(output.costs),
    financing: numberifyFin(output.financing ?? {}),
    tax: numberifyTax(output.tax ?? {}),
    depreciation: numberifyDep(output.depreciation ?? {}),
    cash: numberifyCash(output.cash ?? {}),
    balance_sheet: numberifyBalanceSheet(output.balance_sheet ?? {}),
    profit_and_loss: numberifyPnL(output.profit_and_loss ?? {}),
    cash_flow: numberifyCashFlow(output.cash_flow ?? {}),
    covenants: numberifyCovenants(output.covenants ?? {}),
    time: {
      df: output.time?.df ?? [],
      dt: output.time?.dt ?? []
    }
  }), [output]);
  return num;
}
