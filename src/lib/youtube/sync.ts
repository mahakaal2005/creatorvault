import type { SupabaseClient } from "@supabase/supabase-js";

import type { ImportedYouTubeVideo } from "@/lib/youtube/api";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;
type ContentInsert = Database["public"]["Tables"]["content_items"]["Insert"];
type ContentRow = Database["public"]["Tables"]["content_items"]["Row"];
type SnapshotInsert =
  Database["public"]["Tables"]["stat_snapshots"]["Insert"];

export type YouTubeSyncFilters = {
  mode?: "sync_all" | "new_uploads" | "refresh_stats";
  content_type?: "youtube_video" | "youtube_short";
  published_from?: string;
  published_to?: string;
  max_results?: number;
  include_existing?: boolean;
};

export type YouTubeSyncSummary = {
  fetched: number;
  imported: number;
  created: number;
  updated: number;
  skipped_existing: number;
  skipped_missing: number;
  snapshots: number;
};

type SyncAction =
  | "create"
  | "update"
  | "snapshot_only"
  | "skip_existing"
  | "skip_missing";

function datePart(value: string | null) {
  return value?.slice(0, 10) ?? null;
}

export function filterImportedVideos(
  videos: ImportedYouTubeVideo[],
  filters: YouTubeSyncFilters,
) {
  const filtered = videos.filter((video) => {
    if (filters.content_type && video.contentType !== filters.content_type) {
      return false;
    }

    const published = datePart(video.publishedAt);

    if (filters.published_from && (!published || published < filters.published_from)) {
      return false;
    }

    if (filters.published_to && (!published || published > filters.published_to)) {
      return false;
    }

    return true;
  });

  return typeof filters.max_results === "number"
    ? filtered.slice(0, filters.max_results)
    : filtered;
}

export function getSyncAction(
  exists: boolean,
  filters: Pick<YouTubeSyncFilters, "mode" | "include_existing">,
): SyncAction {
  const mode = filters.mode ?? "sync_all";

  if (mode === "new_uploads") {
    return exists ? "skip_existing" : "create";
  }

  if (mode === "refresh_stats") {
    return exists ? "snapshot_only" : "skip_missing";
  }

  if (exists && filters.include_existing === false) {
    return "skip_existing";
  }

  return exists ? "update" : "create";
}

export function buildContentPayload({
  video,
  userId,
  accountId,
  syncedAt,
}: {
  video: ImportedYouTubeVideo;
  userId: string;
  accountId: string;
  syncedAt: string;
}): ContentInsert {
  return {
    user_id: userId,
    title: video.title,
    url: video.url,
    platform: "youtube",
    content_type: video.contentType,
    external_id: video.externalId,
    thumbnail_url: video.thumbnailUrl,
    published_at: video.publishedAt,
    notes: video.description,
    source: "youtube_sync",
    source_account_id: accountId,
    last_synced_at: syncedAt,
  };
}

export function buildSnapshotPayload({
  contentItemId,
  video,
  snapshotDate,
}: {
  contentItemId: string;
  video: ImportedYouTubeVideo;
  snapshotDate: string;
}): SnapshotInsert {
  return {
    content_item_id: contentItemId,
    snapshot_date: snapshotDate,
    views: video.views,
    likes: video.likes,
    comments: video.comments,
    notes: "Imported from YouTube sync.",
  };
}

async function findExistingContent(
  supabase: Supabase,
  userId: string,
  externalId: string,
): Promise<ContentRow | null> {
  const { data, error } = await supabase
    .from("content_items")
    .select("*")
    .eq("user_id", userId)
    .eq("platform", "youtube")
    .eq("external_id", externalId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function upsertSnapshot(
  supabase: Supabase,
  snapshot: SnapshotInsert,
) {
  const { error } = await supabase.from("stat_snapshots").upsert(snapshot, {
    onConflict: "content_item_id,snapshot_date",
  });

  if (error) {
    throw error;
  }
}

export async function saveImportedVideos({
  supabase,
  userId,
  accountId,
  videos,
  filters,
  syncedAt,
  snapshotDate,
}: {
  supabase: Supabase;
  userId: string;
  accountId: string;
  videos: ImportedYouTubeVideo[];
  filters: YouTubeSyncFilters;
  syncedAt: string;
  snapshotDate: string;
}): Promise<YouTubeSyncSummary> {
  const filteredVideos = filterImportedVideos(videos, filters);
  const summary: YouTubeSyncSummary = {
    fetched: videos.length,
    imported: 0,
    created: 0,
    updated: 0,
    skipped_existing: 0,
    skipped_missing: 0,
    snapshots: 0,
  };

  for (const video of filteredVideos) {
    const existing = await findExistingContent(supabase, userId, video.externalId);

    const action = getSyncAction(Boolean(existing), filters);

    if (action === "skip_existing") {
      summary.skipped_existing += 1;
      continue;
    }

    if (action === "skip_missing") {
      summary.skipped_missing += 1;
      continue;
    }

    const payload = buildContentPayload({
      video,
      userId,
      accountId,
      syncedAt,
    });

    const contentId = existing?.id;

    if (action === "snapshot_only" && contentId) {
      await upsertSnapshot(
        supabase,
        buildSnapshotPayload({
          contentItemId: contentId,
          video,
          snapshotDate,
        }),
      );
      summary.updated += 1;
      summary.snapshots += 1;
      summary.imported += 1;
      continue;
    }

    if (contentId) {
      const { error } = await supabase
        .from("content_items")
        .update(payload)
        .eq("user_id", userId)
        .eq("id", contentId);

      if (error) {
        throw error;
      }

      summary.updated += 1;
    } else {
      const { data, error } = await supabase
        .from("content_items")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      summary.created += 1;
      await upsertSnapshot(
        supabase,
        buildSnapshotPayload({
          contentItemId: data.id,
          video,
          snapshotDate,
        }),
      );
      summary.snapshots += 1;
      summary.imported += 1;
      continue;
    }

    await upsertSnapshot(
      supabase,
      buildSnapshotPayload({
        contentItemId: contentId,
        video,
        snapshotDate,
      }),
    );
    summary.snapshots += 1;
    summary.imported += 1;
  }

  return summary;
}
