import { z } from "zod";

const blankToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : undefined;
};

const numberFromQuery = z.preprocess((value) => {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  return Number(value);
}, z.number().int().min(0).optional());

const pageNumberFromQuery = z.preprocess((value) => {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  return Number(value);
}, z.number().int().min(1).optional());

const dateStringSchema = z.preprocess(
  blankToUndefined,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
);

const platformSchema = z.enum(["youtube", "instagram"]);
const contentSourceSchema = z.enum(["manual", "youtube_sync"]);
const contentTypeSchema = z.enum([
  "youtube_video",
  "youtube_short",
  "instagram_reel",
]);

function platformMatchesContentType(
  platform: z.infer<typeof platformSchema>,
  contentType: z.infer<typeof contentTypeSchema>,
) {
  if (platform === "youtube") {
    return contentType === "youtube_video" || contentType === "youtube_short";
  }

  return contentType === "instagram_reel";
}

export const contentFilterSchema = z
  .object({
    search: z.preprocess(blankToUndefined, z.string().optional()),
    platform: z.preprocess(blankToUndefined, platformSchema.optional()),
    content_type: z.preprocess(blankToUndefined, contentTypeSchema.optional()),
    topic: z.preprocess(blankToUndefined, z.string().optional()),
    tag: z.preprocess(blankToUndefined, z.string().optional()),
    source: z.preprocess(blankToUndefined, contentSourceSchema.optional()),
    status: z
      .preprocess(blankToUndefined, z.enum(["active", "archived", "all"]).optional())
      .default("active"),
    published_from: dateStringSchema,
    published_to: dateStringSchema,
    min_views: numberFromQuery,
    max_views: numberFromQuery,
    page: pageNumberFromQuery.default(1),
    page_size: pageNumberFromQuery.default(25).pipe(z.number().max(100)),
    sort: z
      .preprocess(
        blankToUndefined,
        z
          .enum([
            "published_at_desc",
            "created_at_desc",
            "title_asc",
            "latest_views_desc",
            "latest_snapshot_desc",
          ])
          .optional(),
      )
      .default("published_at_desc"),
  })
  .refine(
    (value) => {
      if (!value.platform || !value.content_type) {
        return true;
      }

      return platformMatchesContentType(value.platform, value.content_type);
    },
    {
      message: "Content type filter must match the selected platform.",
      path: ["content_type"],
    },
  );

export type ContentFilters = z.infer<typeof contentFilterSchema>;
