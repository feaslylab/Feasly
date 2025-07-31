import { render } from "@testing-library/react";
import CashChart from "../CashChart";
import { vi, describe, test, expect } from "vitest";

vi.mock("@/hooks/useCashSeries", () => ({
  useCashSeries: () => ([
    { period: "P0", inflow: 100, outflow: 0,   net:  100 },
    { period: "P1", inflow:   0, outflow: 50,  net:  -50 },
  ])
}));

describe("CashChart", () => {
  test("renders an SVG chart", () => {
    const { container } = render(<CashChart />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});