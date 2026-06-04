import { describe, expect, it, vi } from "vitest";

import {
  buildYouTubeAnalyticsSnapshotPayload,
  fetchYouTubeAnalyticsByVideo,
  recommendedAnalyticsDateRange,
} from "./analytics";

describe("recommendedAnalyticsDateRange", () => {
  it("uses the publish date through today when a video has a publish date", () => {
    expect(
      recommendedAnalyticsDateRange({
        publishedAt: "2026-05-20T09:30:00Z",
        today: "2026-06-04",
      }),
    ).toEqual({
      startDate: "2026-05-20",
      endDate: "2026-06-04",
    });
  });

  it("falls back to the last 30 days when publish date is missing", () => {
    expect(
      recommendedAnalyticsDateRange({
        publishedAt: null,
        today: "2026-06-04",
      }),
    ).toEqual({
      startDate: "2026-05-05",
      endDate: "2026-06-04",
    });
  });
});

describe("fetchYouTubeAnalyticsByVideo", () => {
  it("queries YouTube Analytics with video grouping and maps rows by video ID", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        columnHeaders: [
          { name: "video" },
          { name: "estimatedMinutesWatched" },
          { name: "averageViewDuration" },
          { name: "averageViewPercentage" },
          { name: "subscribersGained" },
          { name: "shares" },
        ],
        rows: [["abc123", 420, 38, 61.5, 7, 3]],
      }),
    });

    const rows = await fetchYouTubeAnalyticsByVideo({
      accessToken: "token-1",
      videoIds: ["abc123"],
      startDate: "2026-05-20",
      endDate: "2026-06-04",
      fetcher: fetchMock,
    });

    const requestUrl = new URL(fetchMock.mock.calls[0]?.[0] as string);
    expect(requestUrl.origin + requestUrl.pathname).toBe(
      "https://youtubeanalytics.googleapis.com/v2/reports",
    );
    expect(requestUrl.searchParams.get("ids")).toBe("channel==MINE");
    expect(requestUrl.searchParams.get("dimensions")).toBe("video");
    expect(requestUrl.searchParams.get("filters")).toBe("video==abc123");
    expect(requestUrl.searchParams.get("metrics")).toBe(
      "estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,shares",
    );
    expect(rows.get("abc123")).toEqual({
      externalId: "abc123",
      watchTimeMinutes: 420,
      averageViewDurationSeconds: 38,
      averageViewPercentage: 61.5,
      subscribersGained: 7,
      shares: 3,
    });
  });
});

describe("buildYouTubeAnalyticsSnapshotPayload", () => {
  it("stores analytics metrics in the existing snapshot columns", () => {
    expect(
      buildYouTubeAnalyticsSnapshotPayload({
        contentItemId: "content-1",
        snapshotDate: "2026-06-04",
        analytics: {
          externalId: "abc123",
          watchTimeMinutes: 420,
          averageViewDurationSeconds: 38,
          averageViewPercentage: 61.5,
          subscribersGained: 7,
          shares: 3,
        },
      }),
    ).toMatchObject({
      content_item_id: "content-1",
      snapshot_date: "2026-06-04",
      watch_time_minutes: 420,
      average_view_duration_seconds: 38,
      followers_or_subscribers_gained: 7,
      shares: 3,
      notes: "Refreshed from YouTube Analytics.",
    });
  });
});
