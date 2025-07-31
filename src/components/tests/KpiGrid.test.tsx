import { render } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import KpiGrid from "../KpiGrid";
import { AuthProvider } from "@/components/auth/AuthProvider";

vi.mock("@/state/selectionStore", ()=>({
  useSelectionStore: ()=>({ projectId:"p1", scenarioId:"s1" })
}));
vi.mock("@/hooks/useKpiStore", ()=>({
  useKpiStore: ()=>({ loading:false,
    kpi:{ npv:123456, irr:0.17, profit:40000, created_at:new Date().toISOString() } })
}));

describe("KpiGrid", () => {
  test("shows formatted KPI values", ()=>{
    const { getByText } = render(<AuthProvider><KpiGrid/></AuthProvider>);
    expect(getByText(/123,456/)).toBeInTheDocument();
    expect(getByText(/17\.00/)).toBeInTheDocument();
  });
});