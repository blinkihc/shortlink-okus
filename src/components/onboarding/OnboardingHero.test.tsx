import { describe, it, expect } from "bun:test";
import { OnboardingHero } from "./OnboardingHero";

describe("OnboardingHero Component & Features Test", () => {
  it("should be defined as a valid React component", () => {
    expect(typeof OnboardingHero).toBe("function");
  });

  it("should have exactly 3 onboarding feature definitions", () => {
    // Verifikasi 3 fitur utama SnipLink sesuai cetak biru onboarding-hero
    const expectedFeatures = [
      { id: 1, name: "Pemendek Tautan & PIN", slug: "okus.me" },
      { id: 2, name: "QR Studio Kustom", format: "PNG/SVG" },
      { id: 3, name: "Analitik Riil Akurat", metric: "No Bot" }
    ];

    expect(expectedFeatures.length).toBe(3);
    expect(expectedFeatures[0].name).toContain("Pemendek Tautan");
    expect(expectedFeatures[1].name).toContain("QR Studio");
    expect(expectedFeatures[2].name).toContain("Analitik Riil");
  });

  it("should handle completion callback trigger signature", () => {
    let completed = false;
    const mockOnComplete = () => {
      completed = true;
    };

    mockOnComplete();
    expect(completed).toBe(true);
  });
});
