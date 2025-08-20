import { runModel, ProjectInputs } from "../../../packages/feasly-engine/src/index";

export type PreviewResult = {
  equity: any | null;
};

export function runPreview(inputs: ProjectInputs): PreviewResult {
  // runModel is pure and returns the same structure used by the UI
  const out: any = runModel(inputs);
  return { equity: out?.equity ?? null };
}