import { describe, it, expect } from "bun:test";
import { generateRandomSlug, sanitizeCustomSlug, resolveSlug } from "./slugGenerator";

describe("Slug Generator Tests", () => {
  it("should generate 6-character random slug by default", () => {
    const slug = generateRandomSlug();
    expect(slug.length).toBe(6);
    expect(/^[a-z0-9]+$/.test(slug)).toBe(true);
  });

  it("should sanitize dirty custom slug properly", () => {
    const dirty = " Promo Kopi Kenangan 2026! @#$ ";
    const clean = sanitizeCustomSlug(dirty);
    expect(clean).toBe("promo-kopi-kenangan-2026");
  });

  it("should resolve collision by appending suffix", () => {
    const existing = ["promo-kopi", "diskon-ramadhan"];
    const resolved = resolveSlug("promo-kopi", existing);
    expect(resolved.startsWith("promo-kopi-")).toBe(true);
    expect(resolved).not.toBe("promo-kopi");
  });
});
