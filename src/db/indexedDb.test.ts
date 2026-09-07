import { describe, it, expect } from "bun:test";
import { INITIAL_SEED_LINKS, SnipLinkDatabase } from "./indexedDb";

describe("Database Structure & Seed Tests", () => {
  it("should have correct table definitions in schema", () => {
    const db = new SnipLinkDatabase();
    expect(db.name).toBe("SnipLinkDB");
    expect(db.tables.some(t => t.name === "links")).toBe(true);
    expect(db.tables.some(t => t.name === "events")).toBe(true);
  });

  it("should validate default seed links structure", () => {
    expect(INITIAL_SEED_LINKS.length).toBeGreaterThanOrEqual(3);
    const first = INITIAL_SEED_LINKS[0];
    expect(first.shortSlug).toBe("promo-kopi");
    expect(first.category).toBe("Promo");
    expect(first.isActive).toBe(true);
    expect(first.isPinned).toBe(true);
  });
});
