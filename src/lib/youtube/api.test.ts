import { describe, expect, it } from "vitest";

import { parseIsoDurationSeconds, toImportedVideo } from "./api";

describe("parseIsoDurationSeconds", () => {
  it("parses YouTube ISO 8601 durations into seconds", () => {
    expect(parseIsoDurationSeconds("PT45S")).toBe(45);
    expect(parseIsoDurationSeconds("PT1M1S")).toBe(61);
    expect(parseIsoDurationSeconds("PT2H3M4S")).toBe(7384);
  });
});

describe("toImportedVideo", () => {
  it("maps short videos as YouTube Shorts", () => {
    const video = toImportedVideo({
      id: "short123",
      snippet: {
        title: "Short idea",
        description: "desc",
        publishedAt: "2026-06-01T10:00:00Z",
        thumbnails: {
          high: { url: "https://img.youtube.com/vi/short123/hqdefault.jpg" },
        },
      },
      contentDetails: { duration: "PT59S" },
      statistics: {
        viewCount: "100",
        likeCount: "10",
        commentCount: "2",
      },
    });

    expect(video).toMatchObject({
      externalId: "short123",
      contentType: "youtube_short",
      views: 100,
      likes: 10,
      comments: 2,
    });
  });

  it("maps longer videos as YouTube long videos", () => {
    const video = toImportedVideo({
      id: "video123",
      snippet: {
        title: "Long video",
        publishedAt: "2026-06-01T10:00:00Z",
        thumbnails: {},
      },
      contentDetails: { duration: "PT1M1S" },
      statistics: {},
    });

    expect(video.contentType).toBe("youtube_video");
    expect(video.url).toBe("https://www.youtube.com/watch?v=video123");
  });
});
