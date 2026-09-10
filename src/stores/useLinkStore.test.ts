import { describe, it, expect, beforeEach } from "bun:test";
import { useLinkStore } from "./useLinkStore";

describe("Zustand useLinkStore Tests", () => {
  beforeEach(async () => {
    await useLinkStore.getState().resetToDefault();
  });

  it("should reset to empty links", () => {
    const { links } = useLinkStore.getState();
    expect(links.length).toBe(0);
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
    const newLink = await useLinkStore.getState().addLink({
      originalUrl: "https://shopee.co.id/flash-sale",
      shortSlug: "flash-sale-pin",
      category: "Promo"
    });
    const initialPinned = newLink.isPinned;

    await useLinkStore.getState().togglePin(newLink.id);
    const updated = useLinkStore.getState().links.find(l => l.id === newLink.id);
    expect(updated?.isPinned).toBe(!initialPinned);
  });

  it("should delete a link", async () => {
    const newLink = await useLinkStore.getState().addLink({
      originalUrl: "https://shopee.co.id/flash-sale",
      shortSlug: "flash-sale-del",
      category: "Promo"
    });
    const countBefore = useLinkStore.getState().links.length;

    await useLinkStore.getState().deleteLink(newLink.id);
    expect(useLinkStore.getState().links.length).toBe(countBefore - 1);
    expect(useLinkStore.getState().links.some(l => l.id === newLink.id)).toBe(false);
  });
});
