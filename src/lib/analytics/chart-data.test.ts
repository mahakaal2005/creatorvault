import { describe, expect, it } from "vitest";

import {
  buildContentPerformanceSeries,
  buildDashboardGroupChartData,
} from "./chart-data";
import type { StatSnapshot } from "@/lib/content/snapshots";
import type { ContentWithTags } from "@/lib/content/repository";

function snapshot(overrides: Partial<StatSnapshot>): StatSnapshot {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    content_item_id: overrides.content_item_id ?? "content-1",
    snapshot_date: overrides.snapshot_date ?? "2026-06-03",
    views: overrides.views ?? null,
    likes: overrides.likes ?? null,
    comments: overrides.comments ?? null,
    shares: overrides.shares ?? null,
    saves: overrides.saves ?? null,
    followers_or_subscribers_gained:
      overrides.followers_or_subscribers_gained ?? null,
    average_view_duration_seconds:
      overrides.average_view_duration_seconds ?? null,
    watch_time_minutes: overrides.watch_time_minutes ?? null,
    notes: overrides.notes ?? null,
    created_at: overrides.created_at ?? "2026-06-03T00:00:00Z",
  };
}

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
    created_at: overrides.created_at ?? "2026-06-01T00:00:00Z",
    updated_at: overrides.updated_at ?? "2026-06-01T00:00:00Z",
    tags: overrides.tags ?? [],
    latest_snapshot: overrides.latest_snapshot ?? null,
  };
}

describe("chart data", () => {
  it("builds sorted content performance series with derived engagement", () => {
    const series = buildContentPerformanceSeries([
      snapshot({
        snapshot_date: "2026-06-03",
        views: 200,
        likes: 20,
        comments: 2,
        shares: 1,
        saves: 3,
        followers_or_subscribers_gained: 4,
      }),
      snapshot({
        snapshot_date: "2026-06-01",
        views: 100,
        likes: 10,
        comments: 1,
        shares: 1,
        saves: null,
        followers_or_subscribers_gained: 2,
      }),
    ]);

    expect(series.map((point) => point.snapshot_date)).toEqual([
      "2026-06-01",
      "2026-06-03",
    ]);
    expect(series[0]).toMatchObject({
      engagement_count: 12,
      engagement_rate: 0.12,
      audience_gained: 2,
    });
    expect(series[1]?.engagement_count).toBe(26);
  });

  it("uses null engagement rate when views are missing or zero", () => {
    const series = buildContentPerformanceSeries([
      snapshot({ snapshot_date: "2026-06-01", views: 0, likes: 10 }),
      snapshot({ snapshot_date: "2026-06-02", views: null, likes: 10 }),
    ]);

    expect(series.map((point) => point.engagement_rate)).toEqual([null, null]);
  });

  it("builds platform and topic chart groups from active latest snapshots", () => {
    const chartData = buildDashboardGroupChartData([
      item({
        id: "a",
        title: "Tutorial",
        topic: " study ",
        latest_snapshot: {
          snapshot_date: "2026-06-03",
          views: 1000,
          likes: 100,
          comments: 20,
          shares: 10,
          saves: 20,
        },
      }),
      item({
        id: "b",
        title: "Reel",
        platform: "instagram",
        content_type: "instagram_reel",
        topic: "Study",
        latest_snapshot: {
          snapshot_date: "2026-06-03",
          views: 500,
          likes: 50,
          comments: 5,
          shares: 5,
          saves: 5,
        },
      }),
      item({
        id: "c",
        title: "Archived",
        status: "archived",
        topic: "Study",
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

    expect(chartData.platforms.map((group) => group.label)).toEqual([
      "YouTube",
      "Instagram",
    ]);
    expect(chartData.topics).toEqual([
      {
        label: "Study",
        content_count: 2,
        total_views: 1500,
        average_views: 750,
        average_engagement_rate: 0.14,
      },
    ]);
  });
});
