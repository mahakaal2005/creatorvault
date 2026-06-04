import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api/auth";
import { apiError, validationError } from "@/lib/api/responses";
import { createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import {
  buildYouTubeAnalyticsSnapshotPayload,
  fetchYouTubeAnalyticsByVideo,
  recommendedAnalyticsDateRange,
} from "@/lib/youtube/analytics";
import {
  getYouTubeVideos,
  listUploadVideoIds,
  getOwnYouTubeChannel,
} from "@/lib/youtube/api";
import { getValidAccessToken, getYouTubeAccount } from "@/lib/youtube/account";
import { hasRequiredYouTubeScopes } from "@/lib/youtube/oauth";
import { saveImportedVideos } from "@/lib/youtube/sync";
import type { YouTubeSyncFilters } from "@/lib/youtube/sync";
import { youtubeSyncSchema } from "@/lib/youtube/validation";

function today() {
  return new Date().toISOString().slice(0, 10);
}

type AdminClient = ReturnType<typeof createAdminClient>;
type ContentRow = Pick<
  Database["public"]["Tables"]["content_items"]["Row"],
  "id" | "external_id" | "published_at" | "content_type"
>;

function dayStart(date: string) {
  return `${date}T00:00:00.000Z`;
}

function dayEnd(date: string) {
  return `${date}T23:59:59.999Z`;
}

async function listImportedYouTubeContent({
  supabase,
  userId,
  filters,
}: {
  supabase: AdminClient;
  userId: string;
  filters: YouTubeSyncFilters;
}) {
  let query = supabase
    .from("content_items")
    .select("id, external_id, published_at, content_type")
    .eq("user_id", userId)
    .eq("platform", "youtube")
    .eq("source", "youtube_sync")
    .not("external_id", "is", null)
    .order("published_at", { ascending: false });

  if (filters.content_type) {
    query = query.eq("content_type", filters.content_type);
  }

  if (filters.published_from) {
    query = query.gte("published_at", dayStart(filters.published_from));
  }

  if (filters.published_to) {
    query = query.lte("published_at", dayEnd(filters.published_to));
  }

  if (filters.max_results) {
    query = query.limit(filters.max_results);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as ContentRow[];
}

async function refreshYouTubeAnalytics({
  supabase,
  userId,
  accessToken,
  filters,
  syncedAt,
  snapshotDate,
}: {
  supabase: AdminClient;
  userId: string;
  accessToken: string;
  filters: YouTubeSyncFilters;
  syncedAt: string;
  snapshotDate: string;
}) {
  const contentItems = await listImportedYouTubeContent({
    supabase,
    userId,
    filters,
  });
  const summary = {
    fetched: contentItems.length,
    imported: 0,
    created: 0,
    updated: 0,
    skipped_existing: 0,
    skipped_missing: 0,
    snapshots: 0,
    analytics: 0,
  };
  const groupedByRange = new Map<string, ContentRow[]>();

  contentItems.forEach((item) => {
    const range = recommendedAnalyticsDateRange({
      publishedAt: item.published_at,
      today: snapshotDate,
    });
    const rangeKey = `${range.startDate}|${range.endDate}`;
    const rangeItems = groupedByRange.get(rangeKey) ?? [];

    rangeItems.push(item);
    groupedByRange.set(rangeKey, rangeItems);
  });

  for (const [rangeKey, rangeItems] of groupedByRange.entries()) {
    const [startDate, endDate] = rangeKey.split("|");
    const analyticsByVideo = await fetchYouTubeAnalyticsByVideo({
      accessToken,
      videoIds: rangeItems
        .map((item) => item.external_id)
        .filter((externalId): externalId is string => Boolean(externalId)),
      startDate,
      endDate,
    });

    for (const item of rangeItems) {
      if (!item.external_id) {
        summary.skipped_missing += 1;
        continue;
      }

      const analytics = analyticsByVideo.get(item.external_id);

      if (!analytics) {
        summary.skipped_missing += 1;
        continue;
      }

      const { error: snapshotError } = await supabase
        .from("stat_snapshots")
        .upsert(
          buildYouTubeAnalyticsSnapshotPayload({
            contentItemId: item.id,
            snapshotDate,
            analytics,
          }),
          { onConflict: "content_item_id,snapshot_date" },
        );

      if (snapshotError) {
        throw snapshotError;
      }

      const { error: contentError } = await supabase
        .from("content_items")
        .update({ last_synced_at: syncedAt })
        .eq("id", item.id)
        .eq("user_id", userId);

      if (contentError) {
        throw contentError;
      }

      summary.updated += 1;
      summary.imported += 1;
      summary.snapshots += 1;
      summary.analytics += 1;
    }
  }

  return summary;
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireApiUser();

  if (response || !user) {
    return response;
  }

  const body = await request.json().catch(() => ({}));
  const parsed = youtubeSyncSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    const admin = createAdminClient();
    const account = await getYouTubeAccount(admin, user.id);

    if (!account) {
      return apiError(
        400,
        "YOUTUBE_NOT_CONNECTED",
        "Connect YouTube before syncing.",
      );
    }

    const accessToken = await getValidAccessToken({ supabase: admin, account });
    const syncedAt = new Date().toISOString();
    const snapshotDate = today();

    if (parsed.data.mode === "refresh_analytics") {
      if (!hasRequiredYouTubeScopes(account.scopes)) {
        return apiError(
          400,
          "YOUTUBE_RECONNECT_REQUIRED",
          "Reconnect YouTube once to allow analytics refresh.",
        );
      }

      const summary = await refreshYouTubeAnalytics({
        supabase: admin,
        userId: user.id,
        accessToken,
        filters: parsed.data,
        syncedAt,
        snapshotDate,
      });

      return NextResponse.json({ summary });
    }

    const channel = await getOwnYouTubeChannel(accessToken);
    const videoIds = await listUploadVideoIds({
      accessToken,
      uploadsPlaylistId: channel.uploadsPlaylistId,
    });
    const limitedVideoIds = parsed.data.max_results
      ? videoIds.slice(0, parsed.data.max_results)
      : videoIds;
    const videos = await getYouTubeVideos({
      accessToken,
      videoIds: limitedVideoIds,
    });
    const summary = await saveImportedVideos({
      supabase: admin,
      userId: user.id,
      accountId: account.id,
      videos,
      filters: parsed.data,
      syncedAt,
      snapshotDate,
    });

    return NextResponse.json({ summary });
  } catch {
    return apiError(
      500,
      "YOUTUBE_SYNC_FAILED",
      "Could not sync YouTube uploads.",
    );
  }
}
