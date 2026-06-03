import { z } from "zod";

const platformSchema = z.enum(["youtube", "instagram"]);
const contentTypeSchema = z.enum([
  "youtube_video",
  "youtube_short",
  "instagram_reel",
]);

const emptyToNull = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}, z.string().nullable().optional());

const nullableUrl = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}, z.string().url().nullable().optional());

const optionalDate = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed;
}, z.string().datetime().nullable().optional());

const tagsArraySchema = z
  .array(z.string().trim().min(1))
  .transform((tags) => Array.from(new Set(tags)));

const contentBaseSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  url: z.string().trim().url("Enter a valid content URL."),
  platform: platformSchema,
  content_type: contentTypeSchema,
  external_id: emptyToNull,
  thumbnail_url: nullableUrl,
  published_at: optionalDate,
  topic: emptyToNull,
  hook_text: emptyToNull,
  hook_type: z
    .enum([
      "curiosity",
      "problem_solution",
      "story",
      "listicle",
      "challenge",
      "educational",
      "other",
    ])
    .nullable()
    .optional(),
  cta_keyword: emptyToNull,
  notes: emptyToNull,
  status: z.enum(["active", "archived"]),
  tags: tagsArraySchema,
});

function platformMatchesContentType(
  platform: z.infer<typeof platformSchema>,
  contentType: z.infer<typeof contentTypeSchema>,
) {
  if (platform === "youtube") {
    return contentType === "youtube_video" || contentType === "youtube_short";
  }

  return contentType === "instagram_reel";
}

export const contentCreateSchema = contentBaseSchema
  .extend({
    status: z.enum(["active", "archived"]).default("active"),
    tags: tagsArraySchema.default([]),
  })
  .refine(
    (value) => platformMatchesContentType(value.platform, value.content_type),
    {
      message: "Content type must match the selected platform.",
      path: ["content_type"],
    },
  );

export const contentUpdateSchema = contentBaseSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  })
  .refine(
    (value) => {
      if (!value.platform || !value.content_type) {
        return true;
      }

      return platformMatchesContentType(value.platform, value.content_type);
    },
    {
      message: "Content type must match the selected platform.",
      path: ["content_type"],
    },
  );

export type ContentCreateInput = z.infer<typeof contentCreateSchema>;
export type ContentUpdateInput = z.infer<typeof contentUpdateSchema>;
