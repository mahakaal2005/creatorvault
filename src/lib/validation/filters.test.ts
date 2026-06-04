import { describe, expect, it } from "vitest";

import { contentFilterSchema } from "./filters";

describe("contentFilterSchema", () => {
  it("normalizes default library filters", () => {
    expect(contentFilterSchema.parse({})).toEqual({
      page: 1,
      page_size: 25,
      sort: "published_at_desc",
      status: "active",
    });
  });

  it("accepts platform, type, tag, date, performance, and search filters", () => {
    const parsed = contentFilterSchema.parse({
      search: "  study plan ",
      platform: "youtube",
      content_type: "youtube_short",
      topic: "Study",
      tag: "Productivity",
      status: "all",
      source: "youtube_sync",
      published_from: "2026-06-01",
      published_to: "2026-06-30",
      min_views: "100",
      max_views: "1000",
      page: "2",
      page_size: "10",
      sort: "latest_views_desc",
    });

    expect(parsed).toEqual({
      search: "study plan",
      platform: "youtube",
      content_type: "youtube_short",
      topic: "Study",
      tag: "Productivity",
      status: "all",
      source: "youtube_sync",
      published_from: "2026-06-01",
      published_to: "2026-06-30",
      min_views: 100,
      max_views: 1000,
      page: 2,
      page_size: 10,
      sort: "latest_views_desc",
    });
  });

  it("rejects negative performance filters", () => {
    expect(() => contentFilterSchema.parse({ min_views: "-1" })).toThrow();
  });

  it("rejects incompatible platform and content type filters", () => {
    expect(() =>
      contentFilterSchema.parse({
        platform: "instagram",
        content_type: "youtube_video",
      }),
    ).toThrow("Content type filter must match the selected platform.");
  });
});
