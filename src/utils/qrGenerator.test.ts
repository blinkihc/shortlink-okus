import { describe, it, expect } from "bun:test";
import { getQRMatrix, generateQRSvgString } from "./qrGenerator";
import { calculateContrastAgainstWhite } from "./contrastChecker";

describe("QR Generator & Contrast Tests", () => {
  it("should generate non-empty 2D QR matrix", () => {
    const matrix = getQRMatrix("https://snip.link/test-qr");
    expect(matrix.length).toBeGreaterThan(20);
    expect(matrix[0].length).toBe(matrix.length);
    // Finder pattern at top-left should be active
    expect(matrix[0][0]).toBe(1);
  });

  it("should generate valid SVG string with correct colors", () => {
    const svg = generateQRSvgString("https://snip.link/promo", {
      moduleStyle: "chunky",
      fgColor: "#0058BE",
      bgColor: "#FFFFFF",
      frameType: "scan-me",
      hasLogo: true,
      ecLevel: "H"
    });

    expect(svg.includes("<svg")).toBe(true);
    expect(svg.includes("#0058BE")).toBe(true);
    expect(svg.includes("</svg>")).toBe(true);
  });

  it("should calculate WCAG contrast properly", () => {
    // Royal Blue (#0058BE) against White (#FFFFFF) -> 6.7:1
    const royalBlue = calculateContrastAgainstWhite("#0058BE");
    expect(royalBlue.ratio).toBeGreaterThan(4.5);
    expect(royalBlue.status).toBe("good");

    // Ink Navy (#131B2E) against White (#FFFFFF)
    const inkNavy = calculateContrastAgainstWhite("#131B2E");
    expect(inkNavy.ratio).toBeGreaterThan(10.0);
    expect(inkNavy.status).toBe("optimal");
  });
});
