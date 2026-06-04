import Link from "next/link";
import { ExternalLink } from "lucide-react";

import type { ContentWithTags } from "@/lib/content/repository";

type ContentListProps = {
  items: ContentWithTags[];
  total: number;
};

function contentTypeLabel(type: string) {
  if (type === "youtube_video") {
    return "YouTube video";
  }

  if (type === "youtube_short") {
    return "YouTube Short";
  }

  return "Instagram Reel";
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("en").format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function ContentList({ items, total }: ContentListProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-lg border border-dashed bg-card p-8 text-center">
        <h2 className="text-base font-semibold tracking-normal">
          No matching content
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Try relaxing your filters, or add a saved content item if your vault is
          still empty.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Showing {items.length} of {total} saved items
      </p>

      <div className="grid gap-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-lg border bg-card p-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div className="min-w-0">
                <Link
                  href={`/content/${item.id}`}
                  className="text-base font-semibold tracking-normal hover:underline"
                >
                  {item.title}
                </Link>

                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-md border px-2 py-1">
                    {contentTypeLabel(item.content_type)}
                  </span>
                  <span className="rounded-md border px-2 py-1 capitalize">
                    {item.platform}
                  </span>
                  <span className="rounded-md border px-2 py-1 capitalize">
                    {item.status}
                  </span>
                  {item.source === "youtube_sync" ? (
                    <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-foreground">
                      YouTube sync
                    </span>
                  ) : null}
                  <span className="rounded-md border px-2 py-1">
                    {formatDate(item.published_at)}
                  </span>
                  {item.topic ? (
                    <span className="rounded-md border px-2 py-1">
                      {item.topic}
                    </span>
                  ) : null}
                </div>

                {item.tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 lg:min-w-52 lg:items-end">
                <div className="grid grid-cols-3 gap-2 text-sm lg:w-full">
                  <div className="rounded-lg border p-2">
                    <p className="text-xs text-muted-foreground">Views</p>
                    <p className="font-semibold">
                      {formatNumber(item.latest_snapshot?.views)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-2">
                    <p className="text-xs text-muted-foreground">Likes</p>
                    <p className="font-semibold">
                      {formatNumber(item.latest_snapshot?.likes)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-2">
                    <p className="text-xs text-muted-foreground">Comments</p>
                    <p className="font-semibold">
                      {formatNumber(item.latest_snapshot?.comments)}
                    </p>
                  </div>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Open
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
