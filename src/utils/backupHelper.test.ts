import { describe, it, expect } from "bun:test";
import { exportLinksToJson, exportLinksToCsv, parseAndValidateJsonBackup } from "./backupHelper";
import { INITIAL_SEED_LINKS } from "../db/indexedDb";

describe("Backup & Recovery Helper Tests", () => {
  it("should export links to valid JSON string", () => {
    const jsonStr = exportLinksToJson(INITIAL_SEED_LINKS);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.version).toBe("1.0");
    expect(parsed.links.length).toBe(INITIAL_SEED_LINKS.length);
  });

  it("should export links to valid CSV string", () => {
    const csvStr = exportLinksToCsv(INITIAL_SEED_LINKS);
    expect(csvStr.includes("ID,ShortSlug,ShortUrl")).toBe(true);
    expect(csvStr.includes("promo-kopi")).toBe(true);
  });

  it("should validate and parse imported JSON backup properly", () => {
    const jsonStr = exportLinksToJson(INITIAL_SEED_LINKS);
    const result = parseAndValidateJsonBackup(jsonStr);
    expect(result.success).toBe(true);
    expect(result.data?.length).toBe(INITIAL_SEED_LINKS.length);
  });

  it("should reject invalid JSON content", () => {
    const invalid = '{"random": 123}';
    const result = parseAndValidateJsonBackup(invalid);
    expect(result.success).toBe(false);
  });
});
