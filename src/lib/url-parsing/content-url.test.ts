import { describe, expect, it } from "vitest";

import { parseContentUrl } from "./content-url";

describe("parseContentUrl", () => {
  it("detects YouTube watch URLs as long videos", () => {
    expect(
      parseContentUrl("https://www.youtube.com/watch?v=abc123XYZ_9"),
    ).toMatchObject({
      platform: "youtube",
      content_type: "youtube_video",
      external_id: "abc123XYZ_9",
      thumbnail_url: "https://img.youtube.com/vi/abc123XYZ_9/hqdefault.jpg",
      confidence: "high",
    });
  });

  it("detects youtu.be URLs as long videos", () => {
    expect(parseContentUrl("https://youtu.be/abc123XYZ_9?t=12")).toMatchObject({
      platform: "youtube",
      content_type: "youtube_video",
      external_id: "abc123XYZ_9",
      confidence: "high",
    });
  });

  it("detects YouTube Shorts URLs", () => {
    expect(
      parseContentUrl("https://www.youtube.com/shorts/shortId42"),
    ).toMatchObject({
      platform: "youtube",
      content_type: "youtube_short",
      external_id: "shortId42",
      confidence: "high",
    });
  });

  it("detects Instagram Reel URLs", () => {
    expect(
      parseContentUrl("https://www.instagram.com/reel/C9abcDEF123/?igsh=abc"),
    ).toMatchObject({
      platform: "instagram",
      content_type: "instagram_reel",
      external_id: "C9abcDEF123",
      thumbnail_url: null,
      confidence: "high",
    });
  });

  it("returns unsupported for other URLs", () => {
    expect(parseContentUrl("https://example.com/video/123")).toEqual({
      url: "https://example.com/video/123",
      platform: null,
      content_type: null,
      external_id: null,
      thumbnail_url: null,
      confidence: "unsupported",
    });
  });
});
