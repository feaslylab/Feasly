import { SCENARIO_SCHEMA_VERSION, ENGINE_VERSION, SHARE_URL_MAX_LEN } from "./constants";
import { stableStringify, fnv1aHex, b64encodeUtf8, b64decodeUtf8 } from "./codec";
import type { ScenarioSnapshot } from "@/lib/scenarios";

export interface PortableScenario {
  version: number;         // schema version
  engine: string;          // engine tag
  payload: ScenarioSnapshot;
  checksum: string;        // fnv1aHex over {version, engine, payload} (stable sorted)
}

function pack(snapshot: ScenarioSnapshot): PortableScenario {
  const base = { version: SCENARIO_SCHEMA_VERSION, engine: ENGINE_VERSION, payload: snapshot };
  const checksum = fnv1aHex(stableStringify(base));
  return { ...base, checksum };
}

function verifyPortable(port: PortableScenario): void {
  const { checksum, ...rest } = port as any;
  const calc = fnv1aHex(stableStringify(rest));
  if (checksum !== calc) throw new Error("Checksum mismatch");
}

export function encodeScenario(snapshot: ScenarioSnapshot): string {
  const portable = pack(snapshot);
  return b64encodeUtf8(JSON.stringify(portable));
}

export function decodeScenario(token: string): PortableScenario {
  const json = b64decodeUtf8(token);
  const parsed = JSON.parse(json) as PortableScenario;
  verifyPortable(parsed);
  return parsed;
}

export function makeShareURL(snapshot: ScenarioSnapshot): { url: string; tooLarge: boolean } {
  const token = encodeScenario(snapshot);
  const base = `${location.origin}${location.pathname}`;
  const url = `${base}#s=${token}`;
  return { url, tooLarge: url.length > SHARE_URL_MAX_LEN };
}

export function parseShareURL(): ScenarioSnapshot | null {
  const m = location.hash.match(/[#&]s=([^&]+)/);
  if (!m) return null;
  try {
    const { payload } = decodeScenario(m[1]);
    return payload;
  } catch {
    return null;
  }
}

export function exportScenarioFile(snapshot: ScenarioSnapshot, filename?: string) {
  const portable = pack(snapshot);
  const blob = new Blob([JSON.stringify(portable, null, 2)], { type: "application/json" });
  const name = filename || `scenario-${(snapshot.name || "unnamed").replace(/\s+/g, "-")}.json`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export async function importScenarioFile(file: File): Promise<ScenarioSnapshot> {
  const text = await file.text();
  const parsed = JSON.parse(text) as PortableScenario;
  verifyPortable(parsed);
  return parsed.payload;
}