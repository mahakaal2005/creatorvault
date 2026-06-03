import { describe, expect, it } from "vitest";

import { snapshotCreateSchema } from "./snapshots";

describe("snapshot validation", () => {
  it("accepts a manual snapshot with metrics and notes", () => {
    const parsed = snapshotCreateSchema.parse({
      snapshot_date: "2026-06-03",
      views: 1250,
      likes: 108,
      comments: 14,
      shares: 9,
      saves: 27,
      followers_or_subscribers_gained: 12,
      average_view_duration_seconds: 132.5,
      watch_time_minutes: 2760.4,
      notes: "Day 3 lift after sharing.",
    });

    expect(parsed.views).toBe(1250);
    expect(parsed.notes).toBe("Day 3 lift after sharing.");
  });

  it("normalizes blank optional notes to null", () => {
    const parsed = snapshotCreateSchema.parse({
      snapshot_date: "2026-06-03",
      views: 100,
      notes: "   ",
    });

    expect(parsed.notes).toBeNull();
  });

  it("rejects negative metric values", () => {
    expect(() =>
      snapshotCreateSchema.parse({
        snapshot_date: "2026-06-03",
        views: -1,
      }),
    ).toThrow("Metric values must be zero or greater.");
  });

  it("requires at least one metric or note", () => {
    expect(() =>
      snapshotCreateSchema.parse({
        snapshot_date: "2026-06-03",
      }),
    ).toThrow("Add at least one metric or note.");
  });

  it("rejects invalid snapshot dates", () => {
    expect(() =>
      snapshotCreateSchema.parse({
        snapshot_date: "June 3, 2026",
        views: 100,
      }),
    ).toThrow("Use a valid snapshot date.");
  });

  it("rejects impossible calendar dates", () => {
    expect(() =>
      snapshotCreateSchema.parse({
        snapshot_date: "2026-02-30",
        views: 100,
      }),
    ).toThrow("Use a valid snapshot date.");
  });
});
