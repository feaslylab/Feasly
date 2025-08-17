// No external deps; deterministic stringify with key sorting + FNV-1a checksum + base64.

function sortKeysDeep<T>(obj: T): T {
  if (Array.isArray(obj)) return obj.map(sortKeysDeep) as any;
  if (obj && typeof obj === "object") {
    const out: any = {};
    Object.keys(obj as any).sort().forEach(k => (out[k] = sortKeysDeep((obj as any)[k])));
    return out;
  }
  return obj;
}

export function stableStringify(obj: unknown): string {
  return JSON.stringify(sortKeysDeep(obj));
}

// FNV-1a 32-bit -> hex
export function fnv1aHex(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return ("0000000" + h.toString(16)).slice(-8);
}

// b64 encode/decode UTF-8 safely
export function b64encodeUtf8(s: string): string {
  // Browser
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    const bytes = new TextEncoder().encode(s);
    let bin = "";
    bytes.forEach(b => (bin += String.fromCharCode(b)));
    return window.btoa(bin);
  }
  // Node / Vitest
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Buffer } = require("buffer");
  return Buffer.from(s, "utf8").toString("base64");
}

export function b64decodeUtf8(s: string): string {
  // Browser
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    const bin = window.atob(s);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  // Node / Vitest
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Buffer } = require("buffer");
  return Buffer.from(s, "base64").toString("utf8");
}