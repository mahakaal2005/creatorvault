import { describe, expect, it } from "vitest";

import { contentCreateSchema, contentUpdateSchema } from "./content";

describe("content validation", () => {
  it("accepts a valid YouTube Short content item", () => {
    const parsed = contentCreateSchema.parse({
      title: "A short test",
      url: "https://www.youtube.com/shorts/shortId42",
      platform: "youtube",
      content_type: "youtube_short",
      tags: ["Study", "Shorts"],
    });

    expect(parsed.tags).toEqual(["Study", "Shorts"]);
  });

  it("rejects incompatible platform and content type combinations", () => {
    expect(() =>
      contentCreateSchema.parse({
        title: "Mismatch",
        url: "https://www.instagram.com/reel/C9abcDEF123/",
        platform: "instagram",
        content_type: "youtube_video",
      }),
    ).toThrow("Content type must match the selected platform.");
  });

  it("normalizes blank optional fields to null", () => {
    const parsed = contentCreateSchema.parse({
      title: "Optional blanks",
      url: "https://www.youtube.com/watch?v=abc123XYZ_9",
      platform: "youtube",
      content_type: "youtube_video",
      topic: "   ",
      notes: "",
    });

    expect(parsed.topic).toBeNull();
    expect(parsed.notes).toBeNull();
  });

  it("requires at least one field for updates", () => {
    expect(() => contentUpdateSchema.parse({})).toThrow(
      "At least one field is required.",
    );
  });
});
