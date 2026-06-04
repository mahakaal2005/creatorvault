import Link from "next/link";
import { Filter, RotateCcw, Search } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import type { ContentFilters } from "@/lib/validation/filters";

type ContentFiltersProps = {
  filters: ContentFilters;
  error?: string;
};

const inputClassName =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";
const labelClassName = "text-xs font-medium text-muted-foreground";

export function ContentFilters({ filters, error }: ContentFiltersProps) {
  return (
    <section className="rounded-lg border bg-card p-4">
      <form action="/content" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-normal">
              <Filter className="size-4" aria-hidden="true" />
              Filters
            </h2>
            {error ? (
              <p className="mt-1 text-sm text-destructive">{error}</p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              <Search className="size-4" aria-hidden="true" />
              Apply
            </Button>
            <Link
              href="/content"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset
            </Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1.5">
            <span className={labelClassName}>Search</span>
            <input
              className={inputClassName}
              name="search"
              placeholder="Title, URL, hook, note"
              defaultValue={filters.search ?? ""}
            />
          </label>

          <label className="space-y-1.5">
            <span className={labelClassName}>Platform</span>
            <select
              className={inputClassName}
              name="platform"
              defaultValue={filters.platform ?? ""}
            >
              <option value="">All platforms</option>
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
            </select>
          </label>

          <label className="space-y-1.5">
            <span className={labelClassName}>Type</span>
            <select
              className={inputClassName}
              name="content_type"
              defaultValue={filters.content_type ?? ""}
            >
              <option value="">All types</option>
              <option value="youtube_video">YouTube video</option>
              <option value="youtube_short">YouTube Short</option>
              <option value="instagram_reel">Instagram Reel</option>
            </select>
          </label>

          <label className="space-y-1.5">
            <span className={labelClassName}>Source</span>
            <select
              className={inputClassName}
              name="source"
              defaultValue={filters.source ?? ""}
            >
              <option value="">All sources</option>
              <option value="manual">Manual</option>
              <option value="youtube_sync">YouTube sync</option>
            </select>
          </label>

          <label className="space-y-1.5">
            <span className={labelClassName}>Status</span>
            <select
              className={inputClassName}
              name="status"
              defaultValue={filters.status}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="all">All statuses</option>
            </select>
          </label>

          <label className="space-y-1.5">
            <span className={labelClassName}>Topic</span>
            <input
              className={inputClassName}
              name="topic"
              placeholder="Editing, systems, study"
              defaultValue={filters.topic ?? ""}
            />
          </label>

          <label className="space-y-1.5">
            <span className={labelClassName}>Tag</span>
            <input
              className={inputClassName}
              name="tag"
              placeholder="retention, tutorial"
              defaultValue={filters.tag ?? ""}
            />
          </label>

          <label className="space-y-1.5">
            <span className={labelClassName}>Published from</span>
            <input
              className={inputClassName}
              name="published_from"
              type="date"
              defaultValue={filters.published_from ?? ""}
            />
          </label>

          <label className="space-y-1.5">
            <span className={labelClassName}>Published to</span>
            <input
              className={inputClassName}
              name="published_to"
              type="date"
              defaultValue={filters.published_to ?? ""}
            />
          </label>

          <label className="space-y-1.5">
            <span className={labelClassName}>Min views</span>
            <input
              className={inputClassName}
              min="0"
              name="min_views"
              type="number"
              defaultValue={filters.min_views ?? ""}
            />
          </label>

          <label className="space-y-1.5">
            <span className={labelClassName}>Max views</span>
            <input
              className={inputClassName}
              min="0"
              name="max_views"
              type="number"
              defaultValue={filters.max_views ?? ""}
            />
          </label>

          <label className="space-y-1.5 md:col-span-2">
            <span className={labelClassName}>Sort</span>
            <select
              className={inputClassName}
              name="sort"
              defaultValue={filters.sort}
            >
              <option value="published_at_desc">Published newest first</option>
              <option value="created_at_desc">Saved newest first</option>
              <option value="latest_views_desc">Most views first</option>
              <option value="latest_snapshot_desc">Latest snapshot first</option>
              <option value="title_asc">Title A to Z</option>
            </select>
          </label>
        </div>
      </form>
    </section>
  );
}
