"use client";
import React, { createContext, useContext, useMemo } from "react";
import { runModel, ProjectInputs } from "../../../packages/feasly-engine/src";
import { mapFormToProjectInputs } from "@/lib/mapFormToProjectInputs";

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
