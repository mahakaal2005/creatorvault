import type { SupabaseClient } from "@supabase/supabase-js";

import { normalizeTags } from "@/lib/content/tags";
import type { Database } from "@/lib/supabase/database.types";
import type {
  ContentCreateInput,
  ContentUpdateInput,
} from "@/lib/validation/content";
import type { ContentFilters } from "@/lib/validation/filters";

type Supabase = SupabaseClient<Database>;

export type ContentItem = Database["public"]["Tables"]["content_items"]["Row"];
export type LatestSnapshot = Pick<
  Database["public"]["Tables"]["stat_snapshots"]["Row"],
  "snapshot_date" | "views" | "likes" | "comments" | "shares" | "saves"
> &
  Partial<
    Pick<
      Database["public"]["Tables"]["stat_snapshots"]["Row"],
      | "followers_or_subscribers_gained"
      | "average_view_duration_seconds"
      | "watch_time_minutes"
    >
  >;

export type ContentWithTags = ContentItem & {
  tags: string[];
  latest_snapshot: LatestSnapshot | null;
};

type ContentTagRow = {
  tags: {
    name: string;
  } | null;
};

function rowWithTags(
  row: ContentItem & { content_tags?: ContentTagRow[] | null },
  latestSnapshot: LatestSnapshot | null = null,
): ContentWithTags {
  return {
    ...row,
    tags:
      row.content_tags
        ?.map((contentTag) => contentTag.tags?.name)
        .filter((name): name is string => Boolean(name)) ?? [],
    latest_snapshot: latestSnapshot,
  };
}

function includesIgnoreCase(value: string | null, query: string) {
  return value?.toLowerCase().includes(query.toLowerCase()) ?? false;
}

function publishedTime(value: string | null) {
  return value ? new Date(value).getTime() : 0;
}

function snapshotTime(value: LatestSnapshot | null) {
  return value ? new Date(value.snapshot_date).getTime() : 0;
}

function filterContentItems(items: ContentWithTags[], filters: ContentFilters) {
  return items.filter((item) => {
    if (filters.status !== "all" && item.status !== filters.status) {
      return false;
    }

    if (filters.platform && item.platform !== filters.platform) {
      return false;
    }

    if (filters.content_type && item.content_type !== filters.content_type) {
      return false;
    }

    if (filters.source && item.source !== filters.source) {
      return false;
    }

    if (
      filters.topic &&
      item.topic?.toLowerCase() !== filters.topic.toLowerCase()
    ) {
      return false;
    }

    if (
      filters.tag &&
      !item.tags.some((tag) => tag.toLowerCase() === filters.tag?.toLowerCase())
    ) {
      return false;
    }

    if (
      filters.published_from &&
      (!item.published_at ||
        item.published_at.slice(0, 10) < filters.published_from)
    ) {
      return false;
    }

    if (
      filters.published_to &&
      (!item.published_at || item.published_at.slice(0, 10) > filters.published_to)
    ) {
      return false;
    }

    const latestViews = item.latest_snapshot?.views;

    if (
      typeof filters.min_views === "number" &&
      (latestViews === null ||
        latestViews === undefined ||
        latestViews < filters.min_views)
    ) {
      return false;
    }

    if (
      typeof filters.max_views === "number" &&
      (latestViews === null ||
        latestViews === undefined ||
        latestViews > filters.max_views)
    ) {
      return false;
    }

    if (filters.search) {
      return (
        includesIgnoreCase(item.title, filters.search) ||
        includesIgnoreCase(item.url, filters.search) ||
        includesIgnoreCase(item.topic, filters.search) ||
        includesIgnoreCase(item.notes, filters.search) ||
        includesIgnoreCase(item.hook_text, filters.search) ||
        includesIgnoreCase(item.cta_keyword, filters.search) ||
        item.tags.some((tag) => includesIgnoreCase(tag, filters.search ?? ""))
      );
    }

    return true;
  });
}

function sortContentItems(items: ContentWithTags[], sort: ContentFilters["sort"]) {
  return [...items].sort((first, second) => {
    if (sort === "created_at_desc") {
      return (
        new Date(second.created_at).getTime() -
        new Date(first.created_at).getTime()
      );
    }

    if (sort === "title_asc") {
      return first.title.localeCompare(second.title);
    }

    if (sort === "latest_views_desc") {
      return (
        (second.latest_snapshot?.views ?? -1) -
        (first.latest_snapshot?.views ?? -1)
      );
    }

    if (sort === "latest_snapshot_desc") {
      return (
        snapshotTime(second.latest_snapshot) - snapshotTime(first.latest_snapshot)
      );
    }

    return publishedTime(second.published_at) - publishedTime(first.published_at);
  });
}

function paginateContentItems(items: ContentWithTags[], filters: ContentFilters) {
  const start = (filters.page - 1) * filters.page_size;

  return items.slice(start, start + filters.page_size);
}

async function getLatestSnapshotsByContentId(
  supabase: Supabase,
  contentItemIds: string[],
) {
  if (contentItemIds.length === 0) {
    return new Map<string, LatestSnapshot>();
  }

  const { data, error } = await supabase
    .from("stat_snapshots")
    .select(
      "content_item_id, snapshot_date, views, likes, comments, shares, saves, followers_or_subscribers_gained, average_view_duration_seconds, watch_time_minutes",
    )
    .in("content_item_id", contentItemIds)
    .order("snapshot_date", { ascending: false });

  if (error) {
    throw error;
  }

  const snapshots = new Map<string, LatestSnapshot>();

  data.forEach((snapshot) => {
    if (!snapshots.has(snapshot.content_item_id)) {
      snapshots.set(snapshot.content_item_id, {
        snapshot_date: snapshot.snapshot_date,
        views: snapshot.views,
        likes: snapshot.likes,
        comments: snapshot.comments,
        shares: snapshot.shares,
        saves: snapshot.saves,
        followers_or_subscribers_gained:
          snapshot.followers_or_subscribers_gained,
        average_view_duration_seconds: snapshot.average_view_duration_seconds,
        watch_time_minutes: snapshot.watch_time_minutes,
      });
    }
  });

  return snapshots;
}

async function replaceTags(
  supabase: Supabase,
  userId: string,
  contentItemId: string,
  tags: string[],
) {
  const normalizedTags = normalizeTags(tags);

  await supabase
    .from("content_tags")
    .delete()
    .eq("content_item_id", contentItemId);

  if (normalizedTags.length === 0) {
    return;
  }

  const { error: tagError } = await supabase.from("tags").upsert(
    normalizedTags.map((tag) => ({
      user_id: userId,
      name: tag.name,
      slug: tag.slug,
    })),
    {
      onConflict: "user_id,slug",
    },
  );

  if (tagError) {
    throw tagError;
  }

  const { data: tagRows, error: selectError } = await supabase
    .from("tags")
    .select("id")
    .eq("user_id", userId)
    .in(
      "slug",
      normalizedTags.map((tag) => tag.slug),
    );

  if (selectError) {
    throw selectError;
  }

  const { error: joinError } = await supabase.from("content_tags").insert(
    tagRows.map((tag) => ({
      content_item_id: contentItemId,
      tag_id: tag.id,
    })),
  );

  if (joinError) {
    throw joinError;
  }
}

export async function createContentItem(
  supabase: Supabase,
  userId: string,
  input: ContentCreateInput,
) {
  const { tags, ...contentInput } = input;
  const { data, error } = await supabase
    .from("content_items")
    .insert({
      ...contentInput,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  await replaceTags(supabase, userId, data.id, tags);

  return getContentItemById(supabase, data.id);
}

export async function listContentItems(
  supabase: Supabase,
  filters?: ContentFilters,
) {
  const { data, error } = await supabase
    .from("content_items")
    .select("*, content_tags(tags(name))")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = data as unknown as Array<
    ContentItem & {
      content_tags?: ContentTagRow[] | null;
    }
  >;
  const snapshots = await getLatestSnapshotsByContentId(
    supabase,
    rows.map((row) => row.id),
  );
  const items = rows.map((row) => rowWithTags(row, snapshots.get(row.id) ?? null));

  if (!filters) {
    return items;
  }

  return paginateContentItems(
    sortContentItems(filterContentItems(items, filters), filters.sort),
    filters,
  );
}

export async function countContentItems(
  supabase: Supabase,
  filters: ContentFilters,
) {
  const allMatching = filterContentItems(await listContentItems(supabase), filters);

  return allMatching.length;
}

export async function getContentItemById(supabase: Supabase, id: string) {
  const { data, error } = await supabase
    .from("content_items")
    .select("*, content_tags(tags(name))")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw error;
  }

  const snapshots = await getLatestSnapshotsByContentId(supabase, [id]);

  return rowWithTags(
    data as ContentItem & {
      content_tags?: ContentTagRow[] | null;
    },
    snapshots.get(id) ?? null,
  );
}

export async function updateContentItem(
  supabase: Supabase,
  userId: string,
  id: string,
  input: ContentUpdateInput,
) {
  const { tags, ...contentInput } = input;

  if (Object.keys(contentInput).length > 0) {
    const { error } = await supabase
      .from("content_items")
      .update(contentInput)
      .eq("id", id);

    if (error) {
      throw error;
    }
  }

  if (tags) {
    await replaceTags(supabase, userId, id, tags);
  }

  return getContentItemById(supabase, id);
}

export async function deleteContentItem(supabase: Supabase, id: string) {
  const { error } = await supabase.from("content_items").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteImportedYouTubeContent(
  supabase: Supabase,
  userId: string,
  filters: Pick<
    ContentFilters,
    "content_type" | "published_from" | "published_to"
  >,
) {
  let query = supabase
    .from("content_items")
    .delete({ count: "exact" })
    .eq("user_id", userId)
    .eq("platform", "youtube")
    .eq("source", "youtube_sync");

  if (filters.content_type) {
    query = query.eq("content_type", filters.content_type);
  }

  if (filters.published_from) {
    query = query.gte("published_at", `${filters.published_from}T00:00:00.000Z`);
  }

  if (filters.published_to) {
    query = query.lte("published_at", `${filters.published_to}T23:59:59.999Z`);
  }

  const { error, count } = await query.select("id");

  if (error) {
    throw error;
  }

  return count ?? 0;
}
