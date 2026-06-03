import { z } from "zod";

const emptyToNull = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}, z.string().nullable().optional());

const optionalIntegerMetric = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return typeof value === "string" ? Number(value) : value;
}, z.number().int().min(0, "Metric values must be zero or greater.").nullable().optional());

const optionalNumberMetric = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return typeof value === "string" ? Number(value) : value;
}, z.number().min(0, "Metric values must be zero or greater.").nullable().optional());

const metricKeys = [
  "views",
  "likes",
  "comments",
  "shares",
  "saves",
  "followers_or_subscribers_gained",
  "average_view_duration_seconds",
  "watch_time_minutes",
] as const;

const snapshotDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid snapshot date.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);

    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, "Use a valid snapshot date.");

export const snapshotCreateSchema = z
  .object({
    snapshot_date: snapshotDateSchema,
    views: optionalIntegerMetric,
    likes: optionalIntegerMetric,
    comments: optionalIntegerMetric,
    shares: optionalIntegerMetric,
    saves: optionalIntegerMetric,
    followers_or_subscribers_gained: optionalIntegerMetric,
    average_view_duration_seconds: optionalNumberMetric,
    watch_time_minutes: optionalNumberMetric,
    notes: emptyToNull,
  })
  .refine(
    (value) =>
      metricKeys.some((key) => value[key] !== null && value[key] !== undefined) ||
      Boolean(value.notes),
    {
      message: "Add at least one metric or note.",
    },
  );

export type SnapshotCreateInput = z.infer<typeof snapshotCreateSchema>;
