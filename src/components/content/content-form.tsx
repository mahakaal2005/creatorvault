"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ContentWithTags } from "@/lib/content/repository";
import type { Database } from "@/lib/supabase/database.types";

type Platform = Database["public"]["Enums"]["platform"];
type ContentType = Database["public"]["Enums"]["content_type"];
type HookType = Database["public"]["Enums"]["hook_type"];

type ContentFormProps = {
  mode: "create" | "edit";
  content?: ContentWithTags;
};

const contentTypeOptions: { value: ContentType; label: string }[] = [
  { value: "youtube_video", label: "YouTube video" },
  { value: "youtube_short", label: "YouTube Short" },
  { value: "instagram_reel", label: "Instagram Reel" },
];

const hookTypeOptions: { value: HookType; label: string }[] = [
  { value: "curiosity", label: "Curiosity" },
  { value: "problem_solution", label: "Problem solution" },
  { value: "story", label: "Story" },
  { value: "listicle", label: "Listicle" },
  { value: "challenge", label: "Challenge" },
  { value: "educational", label: "Educational" },
  { value: "other", label: "Other" },
];

function toLocalDateTime(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}

function toIsoDateTime(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value) {
    return null;
  }

  return new Date(value).toISOString();
}

function tagsToArray(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function ContentForm({ mode, content }: ContentFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [url, setUrl] = useState(content?.url ?? "");
  const [platform, setPlatform] = useState<Platform>(
    content?.platform ?? "youtube",
  );
  const [contentType, setContentType] = useState<ContentType>(
    content?.content_type ?? "youtube_video",
  );
  const [externalId, setExternalId] = useState(content?.external_id ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(content?.thumbnail_url ?? "");

  const formTitle = mode === "create" ? "Save content" : "Update content";
  const tagValue = useMemo(() => content?.tags.join(", ") ?? "", [content]);

  async function parseUrl() {
    if (!url.trim()) {
      setError("Paste a URL first.");
      return;
    }

    setIsParsing(true);
    setError(null);

    const response = await fetch(
      `/api/metadata/parse-url?url=${encodeURIComponent(url)}`,
    );
    const body = await response.json();

    setIsParsing(false);

    if (!response.ok) {
      setError(body.error?.message ?? "Could not parse this URL.");
      return;
    }

    setPlatform(body.parsed.platform);
    setContentType(body.parsed.content_type);
    setExternalId(body.parsed.external_id ?? "");
    setThumbnailUrl(body.parsed.thumbnail_url ?? "");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: formData.get("title"),
      url,
      platform,
      content_type: contentType,
      external_id: externalId,
      thumbnail_url: thumbnailUrl,
      published_at: toIsoDateTime(formData.get("published_at")),
      topic: formData.get("topic"),
      hook_text: formData.get("hook_text"),
      hook_type: formData.get("hook_type") || null,
      cta_keyword: formData.get("cta_keyword"),
      notes: formData.get("notes"),
      status: formData.get("status"),
      tags: tagsToArray(formData.get("tags")),
    };

    const response = await fetch(
      mode === "create" ? "/api/content" : `/api/content/${content?.id}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
    const body = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setError(body.error?.message ?? "Could not save content.");
      return;
    }

    router.push(`/content/${body.content.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-lg border bg-card p-5">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Field label="Content URL" htmlFor="url">
        <div className="flex gap-2">
          <input
            id="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required
            className="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            placeholder="Paste YouTube or Instagram URL"
          />
          <Button type="button" onClick={parseUrl} disabled={isParsing}>
            <Wand2 className="size-4" aria-hidden="true" />
            {isParsing ? "Parsing" : "Parse"}
          </Button>
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Platform" htmlFor="platform">
          <select
            id="platform"
            value={platform}
            onChange={(event) => setPlatform(event.target.value as Platform)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
          </select>
        </Field>
        <Field label="Content type" htmlFor="content_type">
          <select
            id="content_type"
            value={contentType}
            onChange={(event) =>
              setContentType(event.target.value as ContentType)
            }
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            {contentTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Title" htmlFor="title">
        <input
          id="title"
          name="title"
          required
          defaultValue={content?.title}
          className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          placeholder="Content title"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="External ID" htmlFor="external_id">
          <input
            id="external_id"
            value={externalId}
            onChange={(event) => setExternalId(event.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          />
        </Field>
        <Field label="Published date" htmlFor="published_at">
          <input
            id="published_at"
            name="published_at"
            type="datetime-local"
            defaultValue={toLocalDateTime(content?.published_at)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          />
        </Field>
      </div>

      <Field label="Thumbnail URL" htmlFor="thumbnail_url">
        <input
          id="thumbnail_url"
          value={thumbnailUrl}
          onChange={(event) => setThumbnailUrl(event.target.value)}
          className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          placeholder="Optional"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Topic" htmlFor="topic">
          <input
            id="topic"
            name="topic"
            defaultValue={content?.topic ?? ""}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          />
        </Field>
        <Field label="CTA keyword" htmlFor="cta_keyword">
          <input
            id="cta_keyword"
            name="cta_keyword"
            defaultValue={content?.cta_keyword ?? ""}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Hook type" htmlFor="hook_type">
          <select
            id="hook_type"
            name="hook_type"
            defaultValue={content?.hook_type ?? ""}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">None</option>
            {hookTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" htmlFor="status">
          <select
            id="status"
            name="status"
            defaultValue={content?.status ?? "active"}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
      </div>

      <Field label="Hook text" htmlFor="hook_text">
        <textarea
          id="hook_text"
          name="hook_text"
          defaultValue={content?.hook_text ?? ""}
          className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Notes" htmlFor="notes">
        <textarea
          id="notes"
          name="notes"
          defaultValue={content?.notes ?? ""}
          className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Tags" htmlFor="tags">
        <input
          id="tags"
          name="tags"
          defaultValue={tagValue}
          className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          placeholder="study, productivity, growth"
        />
      </Field>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : formTitle}
      </Button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium" htmlFor={htmlFor}>
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
