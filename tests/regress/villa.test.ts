import { emdfToDto } from "./parseEmdfToDto";
import { runEngine } from "./runEngine";
import fs from "fs";
import path from "path";
import { expect, describe, it } from "vitest";

const fixture = path.resolve(__dirname, "fixtures/villa_project");
const golden  = path.resolve(__dirname, "fixtures/villa_project/expected.json");

describe("Regression – villa_project", async () => {
  const dto  = await emdfToDto(fixture);
  const out  = runEngine(dto);

  if (!fs.existsSync(golden)) {
    fs.writeFileSync(golden, JSON.stringify(out, null, 2));
    console.warn("First run: wrote expected.json – please commit it.");
  }

  const expected = JSON.parse(fs.readFileSync(golden, "utf8"));

  it("cash-flow matches golden snapshot", () => {
    expect(out.cash).toEqual(expected.cash);
  });

  it("KPIs match snapshot", () => {
    expect(out.kpi).toEqual(expected.kpi);
  });
});