import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { ContentFilters } from "@/components/content/content-filters";
import { ContentList } from "@/components/content/content-list";
import { buttonVariants } from "@/components/ui/button";
import { countContentItems, listContentItems } from "@/lib/content/repository";
import { createClient } from "@/lib/supabase/server";
import {
  contentFilterSchema,
  type ContentFilters as ContentFilterValues,
} from "@/lib/validation/filters";

type ContentLibraryPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeSearchParams(
  params: Record<string, string | string[] | undefined>,
) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, firstValue(value)]),
  );
}

function paginationHref(filters: ContentFilterValues, page: number) {
  const params = new URLSearchParams();

  Object.entries({ ...filters, page }).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    params.set(key, String(value));
  });

  return `/content?${params.toString()}`;
}

export default async function ContentLibraryPage({
  searchParams,
}: ContentLibraryPageProps) {
  const rawSearchParams = normalizeSearchParams((await searchParams) ?? {});
  const parsed = contentFilterSchema.safeParse(rawSearchParams);
  const filters = parsed.success
    ? parsed.data
    : contentFilterSchema.parse({});
  const filterError = parsed.success
    ? undefined
    : "Some filters were ignored because they were not valid.";

  const supabase = await createClient();
  const [items, total] = await Promise.all([
    listContentItems(supabase, filters),
    countContentItems(supabase, filters),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / filters.page_size));

  return (
    <div className="space-y-6 pb-16 sm:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">
            Content Library
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Search, filter, and compare your saved YouTube videos, Shorts, and
            Instagram Reels.
          </p>
        </div>
        <Link
          href="/content/new"
          className={buttonVariants({ size: "default" })}
        >
          <Plus className="size-4" aria-hidden="true" />
          Add content
        </Link>
      </div>

      <ContentFilters filters={filters} error={filterError} />
      <ContentList items={items} total={total} />

      {totalPages > 1 ? (
        <nav
          className="flex items-center justify-between gap-3"
          aria-label="Content pagination"
        >
          <Link
            href={paginationHref(filters, Math.max(1, filters.page - 1))}
            aria-disabled={filters.page <= 1}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className:
                filters.page <= 1 ? "pointer-events-none opacity-50" : "",
            })}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Previous
          </Link>
          <p className="text-sm text-muted-foreground">
            Page {filters.page} of {totalPages}
          </p>
          <Link
            href={paginationHref(filters, Math.min(totalPages, filters.page + 1))}
            aria-disabled={filters.page >= totalPages}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className:
                filters.page >= totalPages
                  ? "pointer-events-none opacity-50"
                  : "",
            })}
          >
            Next
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
