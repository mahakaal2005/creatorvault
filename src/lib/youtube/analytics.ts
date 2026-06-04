import type { Database } from "@/lib/supabase/database.types";

const ANALYTICS_URL = "https://youtubeanalytics.googleapis.com/v2/reports";
const ANALYTICS_METRICS = [
  "estimatedMinutesWatched",
  "averageViewDuration",
  "averageViewPercentage",
  "subscribersGained",
  "shares",
] as const;

type SnapshotInsert =
  Database["public"]["Tables"]["stat_snapshots"]["Insert"];

type Fetcher = typeof fetch;

type YouTubeAnalyticsResponse = {
  columnHeaders?: Array<{
    name?: string;
  }>;
  rows?: Array<Array<string | number | null>>;
};

export type YouTubeVideoAnalytics = {
  externalId: string;
  watchTimeMinutes: number | null;
  averageViewDurationSeconds: number | null;
  averageViewPercentage: number | null;
  subscribersGained: number | null;
  shares: number | null;
};

function dateOnly(value: string) {
  return value.slice(0, 10);
}

function addDays(date: string, days: number) {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);

  return parsed.toISOString().slice(0, 10);
}

export function recommendedAnalyticsDateRange({
  publishedAt,
  today,
}: {
  publishedAt: string | null;
  today: string;
}) {
  const publishedDate = publishedAt ? dateOnly(publishedAt) : null;
  const startDate =
    publishedDate && publishedDate <= today ? publishedDate : addDays(today, -30);

  return {
    startDate,
    endDate: today,
  };
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function numberAt(
  row: Array<string | number | null>,
  indexes: Map<string, number>,
  key: string,
) {
  const index = indexes.get(key);

  if (index === undefined) {
    return null;
  }

  const value = row[index];
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function mapAnalyticsResponse(data: YouTubeAnalyticsResponse) {
  const columnIndexes = new Map(
    data.columnHeaders?.map((header, index) => [header.name ?? "", index]) ?? [],
  );
  const videoIndex = columnIndexes.get("video");
  const rows = new Map<string, YouTubeVideoAnalytics>();

  if (videoIndex === undefined) {
    return rows;
  }

  data.rows?.forEach((row) => {
    const externalId = row[videoIndex];

    if (typeof externalId !== "string" || !externalId) {
      return;
    }

    rows.set(externalId, {
      externalId,
      watchTimeMinutes: numberAt(row, columnIndexes, "estimatedMinutesWatched"),
      averageViewDurationSeconds: numberAt(
        row,
        columnIndexes,
        "averageViewDuration",
      ),
      averageViewPercentage: numberAt(row, columnIndexes, "averageViewPercentage"),
      subscribersGained: numberAt(row, columnIndexes, "subscribersGained"),
      shares: numberAt(row, columnIndexes, "shares"),
    });
  });

  return rows;
}

export async function fetchYouTubeAnalyticsByVideo({
  accessToken,
  videoIds,
  startDate,
  endDate,
  fetcher = fetch,
}: {
  accessToken: string;
  videoIds: string[];
  startDate: string;
  endDate: string;
  fetcher?: Fetcher;
}) {
  const analyticsByVideo = new Map<string, YouTubeVideoAnalytics>();

  for (const videoIdBatch of chunk(videoIds, 500)) {
    if (videoIdBatch.length === 0) {
      continue;
    }

    const url = new URL(ANALYTICS_URL);
    url.searchParams.set("ids", "channel==MINE");
    url.searchParams.set("startDate", startDate);
    url.searchParams.set("endDate", endDate);
    url.searchParams.set("metrics", ANALYTICS_METRICS.join(","));
    url.searchParams.set("dimensions", "video");
    url.searchParams.set("filters", `video==${videoIdBatch.join(",")}`);

    const response = await fetcher(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("YouTube Analytics request failed.");
    }

    const mappedRows = mapAnalyticsResponse(
      (await response.json()) as YouTubeAnalyticsResponse,
    );

    mappedRows.forEach((analytics, externalId) => {
      analyticsByVideo.set(externalId, analytics);
    });
  }

  return analyticsByVideo;
}

export function buildYouTubeAnalyticsSnapshotPayload({
  contentItemId,
  snapshotDate,
  analytics,
}: {
  contentItemId: string;
  snapshotDate: string;
  analytics: YouTubeVideoAnalytics;
}): SnapshotInsert {
  return {
    content_item_id: contentItemId,
    snapshot_date: snapshotDate,
    shares: analytics.shares,
    followers_or_subscribers_gained: analytics.subscribersGained,
    average_view_duration_seconds: analytics.averageViewDurationSeconds,
    watch_time_minutes: analytics.watchTimeMinutes,
    notes: "Refreshed from YouTube Analytics.",
  };
}
