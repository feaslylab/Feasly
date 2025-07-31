import { render } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import KpiCard from "../KpiCard";

describe("KpiCard", () => {
  test("renders label and value correctly", ()=>{
    const { getByText } = render(<KpiCard label="Test Label" value="Test Value" />);
    expect(getByText("Test Label")).toBeInTheDocument();
    expect(getByText("Test Value")).toBeInTheDocument();
  });
});