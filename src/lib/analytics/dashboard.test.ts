import { describe, expect, it } from "vitest";

import { buildDashboardSummary } from "./dashboard";
import type { ContentWithTags } from "@/lib/content/repository";

function item(
  overrides: Partial<ContentWithTags> & Pick<ContentWithTags, "id" | "title">,
): ContentWithTags {
  return {
    id: overrides.id,
    user_id: "user-1",
    title: overrides.title,
    url: `https://example.com/${overrides.id}`,
    platform: overrides.platform ?? "youtube",
    content_type: overrides.content_type ?? "youtube_video",
    external_id: null,
    thumbnail_url: null,
    published_at: overrides.published_at ?? null,
    topic: overrides.topic ?? null,
    hook_text: null,
    hook_type: null,
    cta_keyword: null,
    notes: null,
    status: overrides.status ?? "active",
    source: overrides.source ?? "manual",
    source_account_id: overrides.source_account_id ?? null,
    last_synced_at: overrides.last_synced_at ?? null,
    created_at: overrides.created_at ?? "2026-06-01T00:00:00Z",
    updated_at: overrides.updated_at ?? "2026-06-01T00:00:00Z",
    tags: overrides.tags ?? [],
    latest_snapshot: overrides.latest_snapshot ?? null,
  };
}

describe("dashboard analytics", () => {
  it("summarizes active content from latest snapshots", () => {
    const summary = buildDashboardSummary([
      item({
        id: "a",
        title: "YouTube tutorial",
        topic: "Study",
        latest_snapshot: {
          snapshot_date: "2026-06-03",
          views: 1000,
          likes: 100,
          comments: 20,
          shares: 10,
          saves: 30,
        },
      }),
      item({
        id: "b",
        title: "Instagram reel",
        platform: "instagram",
        content_type: "instagram_reel",
        topic: "Study",
        latest_snapshot: {
          snapshot_date: "2026-06-03",
          views: 500,
          likes: 50,
          comments: 5,
          shares: 5,
          saves: 10,
        },
      }),
      item({
        id: "archived",
        title: "Archived content",
        status: "archived",
        latest_snapshot: {
          snapshot_date: "2026-06-03",
          views: 9000,
          likes: 1,
          comments: 1,
          shares: 1,
          saves: 1,
        },
      }),
    ]);

    expect(summary.cards.total_content).toBe(2);
    expect(summary.cards.total_views).toBe(1500);
    expect(summary.cards.best_platform?.label).toBe("YouTube");
    expect(summary.cards.best_topic?.label).toBe("Study");
  });

  it("ranks top content by latest views then engagement rate", () => {
    const summary = buildDashboardSummary([
      item({
        id: "a",
        title: "Lower engagement",
        published_at: "2026-06-01T00:00:00Z",
        latest_snapshot: {
          snapshot_date: "2026-06-03",
          views: 1000,
          likes: 10,
          comments: 0,
          shares: 0,
          saves: 0,
        },
      }),
      item({
        id: "b",
        title: "Higher engagement",
        published_at: "2026-06-02T00:00:00Z",
        latest_snapshot: {
          snapshot_date: "2026-06-03",
          views: 1000,
          likes: 100,
          comments: 10,
          shares: 10,
          saves: 10,
        },
      }),
    ]);

    expect(summary.top_content[0]?.id).toBe("b");
  });

  it("orders recent uploads by published date with created date fallback", () => {
    const summary = buildDashboardSummary([
      item({
        id: "a",
        title: "Created later",
        published_at: null,
        created_at: "2026-06-05T00:00:00Z",
      }),
      item({
        id: "b",
        title: "Published later",
        published_at: "2026-06-10T00:00:00Z",
        created_at: "2026-06-01T00:00:00Z",
      }),
    ]);

    expect(summary.recent_uploads.map((content) => content.id)).toEqual([
      "b",
      "a",
    ]);
  });

  it("returns an empty summary for a new user", () => {
    const summary = buildDashboardSummary([]);

    expect(summary.cards.total_content).toBe(0);
    expect(summary.cards.total_views).toBe(0);
    expect(summary.cards.best_platform).toBeNull();
    expect(summary.cards.best_topic).toBeNull();
    expect(summary.top_content).toEqual([]);
    expect(summary.recent_uploads).toEqual([]);
  });
});
