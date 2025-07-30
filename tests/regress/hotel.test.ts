import { emdfToDto } from "./parseEmdfToDto";
import { runEngine } from "./runEngine";
import fs from "fs";
import path from "path";
import { expect, it, describe } from "vitest";

const dir = path.resolve(__dirname, "fixtures/hotel_project");
const fixture = path.join(dir, "fixture.emdf");
const expectedPath = path.join(dir, "expected.json");

describe("Regression – hotel_project", async () => {
  // Use directory path if EMDF doesn't exist but XML files do
  const fixturePath = fs.existsSync(fixture) ? fixture : dir;
  const dto = await emdfToDto(fixturePath);
  const out = runEngine(dto);
  
  // Auto-generate expected.json if it doesn't exist
  if (!fs.existsSync(expectedPath)) {
    fs.writeFileSync(expectedPath, JSON.stringify(out, null, 2));
    console.warn("First run: wrote hotel expected.json – please commit it.");
  }
  
  const expected = JSON.parse(fs.readFileSync(expectedPath, "utf8"));

  it("cash-flow matches snapshot", () => {
    expect(out.cash).toEqual(expected.cash);
  });
  
  it("KPIs match snapshot", () => {
    expect(out.kpi).toEqual(expected.kpi);
  });
});