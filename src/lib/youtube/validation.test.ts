import { describe, expect, it } from "vitest";

import {
  youtubeImportedDeleteSchema,
  youtubeSyncSchema,
} from "./validation";

describe("youtubeSyncSchema", () => {
  it("defaults to sync-all mode", () => {
    expect(youtubeSyncSchema.parse({})).toMatchObject({
      include_existing: true,
      mode: "sync_all",
    });
  });

  it("accepts explicit sync modes", () => {
    expect(youtubeSyncSchema.parse({ mode: "new_uploads" }).mode).toBe(
      "new_uploads",
    );
    expect(youtubeSyncSchema.parse({ mode: "refresh_stats" }).mode).toBe(
      "refresh_stats",
    );
    expect(youtubeSyncSchema.parse({ mode: "refresh_analytics" }).mode).toBe(
      "refresh_analytics",
    );
  });
});

describe("youtubeImportedDeleteSchema", () => {
  it("requires typed confirmation before deleting imported content", () => {
    expect(() =>
      youtubeImportedDeleteSchema.parse({ confirmation: "delete" }),
    ).toThrow();

    expect(
      youtubeImportedDeleteSchema.parse({
        confirmation: "DELETE IMPORTED",
      }),
    ).toEqual({
      confirmation: "DELETE IMPORTED",
    });
  });
});
