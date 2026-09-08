import { describe, it, expect, beforeEach } from "bun:test";
import { useLinkStore } from "./useLinkStore";

describe("Zustand useLinkStore Tests", () => {
  beforeEach(async () => {
    await useLinkStore.getState().resetToDefault();
  });

  it("should have initial links populated", () => {
    const { links } = useLinkStore.getState();
    expect(links.length).toBeGreaterThanOrEqual(3);
  });

  it("should add a new link successfully", async () => {
    const initialCount = useLinkStore.getState().links.length;
    const newLink = await useLinkStore.getState().addLink({
      originalUrl: "https://shopee.co.id/flash-sale",
      shortSlug: "flash-sale-99",
      category: "Promo"
    });

    expect(newLink.shortSlug).toBe("flash-sale-99");
    expect(newLink.shortUrl).toBe("https://okus.me/flash-sale-99");
    expect(useLinkStore.getState().links.length).toBe(initialCount + 1);
  });

  it("should toggle pin status of a link", async () => {
    const targetLink = useLinkStore.getState().links[0];
    const initialPinned = targetLink.isPinned;

    await useLinkStore.getState().togglePin(targetLink.id);
    const updated = useLinkStore.getState().links.find(l => l.id === targetLink.id);
    expect(updated?.isPinned).toBe(!initialPinned);
  });

  it("should delete a link", async () => {
    const initialCount = useLinkStore.getState().links.length;
    const targetLink = useLinkStore.getState().links[0];

    await useLinkStore.getState().deleteLink(targetLink.id);
    expect(useLinkStore.getState().links.length).toBe(initialCount - 1);
    expect(useLinkStore.getState().links.some(l => l.id === targetLink.id)).toBe(false);
  });
});
