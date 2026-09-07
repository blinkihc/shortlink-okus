import { describe, it, expect } from "bun:test";
import { isValidUrl, appendUtmParameters } from "./urlValidator";
import { hashPinCode, verifyPinCode } from "./security";

describe("URL Validator & UTM Builder Tests", () => {
  it("should validate valid HTTP/HTTPS URLs", () => {
    expect(isValidUrl("https://google.com")).toBe(true);
    expect(isValidUrl("http://localhost:3000/promo")).toBe(true);
    expect(isValidUrl("invalid-string")).toBe(false);
    expect(isValidUrl("ftp://files.example.com")).toBe(false);
  });

  it("should append UTM parameters properly", () => {
    const base = "https://toko.com/kopi";
    const result = appendUtmParameters(base, {
      source: "instagram",
      medium: "bio",
      campaign: "promo_jumat"
    });

    expect(result).toBe("https://toko.com/kopi?utm_source=instagram&utm_medium=bio&utm_campaign=promo_jumat");
  });

  it("should verify PIN hashing and validation", async () => {
    const pin = "1234";
    const hash = await hashPinCode(pin);
    expect(hash.length).toBe(64); // SHA-256 hex length
    expect(await verifyPinCode("1234", hash)).toBe(true);
    expect(await verifyPinCode("9999", hash)).toBe(false);
  });
});
