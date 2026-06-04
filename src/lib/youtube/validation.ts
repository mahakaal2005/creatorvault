import { z } from "zod";

const blankToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : undefined;
};

const dateStringSchema = z.preprocess(
  blankToUndefined,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
);

export const youtubeSyncSchema = z.object({
  content_type: z
    .preprocess(blankToUndefined, z.enum(["youtube_video", "youtube_short"]).optional()),
  published_from: dateStringSchema,
  published_to: dateStringSchema,
  max_results: z
    .preprocess((value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      return Number(value);
    }, z.number().int().min(1).max(10000).optional()),
  include_existing: z.boolean().optional().default(true),
});

export const youtubeImportedDeleteSchema = youtubeSyncSchema.pick({
  content_type: true,
  published_from: true,
  published_to: true,
});
