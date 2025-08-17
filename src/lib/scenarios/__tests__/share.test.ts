import { describe, it, expect } from "vitest";
import { encodeScenario, decodeScenario } from "@/lib/scenarios/share";
import { SCENARIO_SCHEMA_VERSION } from "@/lib/scenarios/constants";

const snapshot: any = {
  id: "s-1",
  name: "Unit Test Scenario",
  createdAt: "2025-01-01T00:00:00.000Z",
  inputs: { project: { periods: 3 }, equity: { enabled: true } },
  summary: { irr_pa: 0.12, tvpi: 1.5, dpi: 0.9, rvpi: 0.6, moic: 1.5, gp_clawback_last: 0 },
  traces: { T: 3, calls_total: [1,2,3], dists_total: [0,1,2], gp_promote: [0,0,0], gp_clawback: [0,0,0] }
};

describe("share codec", () => {
  it("round-trips encode/decode and verifies checksum", () => {
    const token = encodeScenario(snapshot);
    const portable = decodeScenario(token);
    expect(portable.version).toBe(SCENARIO_SCHEMA_VERSION);
    expect(portable.payload.name).toBe("Unit Test Scenario");

    // tamper token
    const tampered = token.replace(/A/g, "B"); // likely decode error or checksum mismatch
    let ok = false;
    try { decodeScenario(tampered); ok = true; } catch { ok = false; }
    expect(ok).toBe(false);
  });
});