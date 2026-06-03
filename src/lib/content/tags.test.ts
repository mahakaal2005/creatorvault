import { describe, expect, it } from "vitest";

import { normalizeTags, slugifyTag } from "./tags";

describe("content tags", () => {
  it("slugifies tags for stable matching", () => {
    expect(slugifyTag(" Study Systems! ")).toBe("study-systems");
  });

  it("normalizes, deduplicates, and removes empty tags", () => {
    expect(
      normalizeTags([" Study ", "study", "Creator Growth", " ", "Growth!!!"]),
    ).toEqual([
      { name: "Study", slug: "study" },
      { name: "Creator Growth", slug: "creator-growth" },
      { name: "Growth!!!", slug: "growth" },
    ]);
  });
});
