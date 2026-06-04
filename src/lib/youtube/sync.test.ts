import { describe, expect, it } from "vitest";

import {
  buildContentPayload,
  buildSnapshotPayload,
  filterImportedVideos,
} from "./sync";
import type { ImportedYouTubeVideo } from "./api";

function video(
  overrides: Partial<ImportedYouTubeVideo> = {},
): ImportedYouTubeVideo {
  return {
    externalId: overrides.externalId ?? "video123",
    title: overrides.title ?? "Video",
    url: overrides.url ?? "https://www.youtube.com/watch?v=video123",
    contentType: overrides.contentType ?? "youtube_video",
    thumbnailUrl: overrides.thumbnailUrl ?? null,
    publishedAt: overrides.publishedAt ?? "2026-06-01T00:00:00Z",
    description: overrides.description ?? null,
    durationSeconds: overrides.durationSeconds ?? 120,
    views: overrides.views ?? 100,
    likes: overrides.likes ?? 10,
    comments: overrides.comments ?? 2,
  };
}

describe("filterImportedVideos", () => {
  it("returns everything by default", () => {
    const videos = [
      video({ externalId: "a" }),
      video({ externalId: "b", contentType: "youtube_short" }),
    ];

    expect(filterImportedVideos(videos, {})).toHaveLength(2);
  });

  it("filters by content type and published date range", () => {
    const videos = [
      video({
        externalId: "short",
        contentType: "youtube_short",
        publishedAt: "2026-06-03T00:00:00Z",
      }),
      video({
        externalId: "old",
        contentType: "youtube_short",
        publishedAt: "2026-05-01T00:00:00Z",
      }),
      video({
        externalId: "long",
        contentType: "youtube_video",
        publishedAt: "2026-06-03T00:00:00Z",
      }),
    ];

    expect(
      filterImportedVideos(videos, {
        content_type: "youtube_short",
        published_from: "2026-06-01",
      }).map((item) => item.externalId),
    ).toEqual(["short"]);
  });
});

describe("sync payload builders", () => {
  it("builds content payloads marked as YouTube sync imports", () => {
    expect(
      buildContentPayload({
        video: video({ externalId: "abc123", description: "Imported desc" }),
        userId: "user-1",
        accountId: "account-1",
        syncedAt: "2026-06-04T00:00:00Z",
      }),
    ).toMatchObject({
      user_id: "user-1",
      platform: "youtube",
      external_id: "abc123",
      source: "youtube_sync",
      source_account_id: "account-1",
      notes: "Imported desc",
    });
  });

  it("builds same-day snapshot payloads from YouTube statistics", () => {
    expect(
      buildSnapshotPayload({
        contentItemId: "content-1",
        video: video({ views: 250, likes: 25, comments: 5 }),
        snapshotDate: "2026-06-04",
      }),
    ).toMatchObject({
      content_item_id: "content-1",
      snapshot_date: "2026-06-04",
      views: 250,
      likes: 25,
      comments: 5,
    });
  });
});
