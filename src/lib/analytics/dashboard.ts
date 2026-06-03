import type { ContentWithTags } from "@/lib/content/repository";
import type { Database } from "@/lib/supabase/database.types";

type Platform = Database["public"]["Enums"]["platform"];
type ContentType = Database["public"]["Enums"]["content_type"];

type DashboardGroupSummary = {
  label: string;
  content_count: number;
  total_views: number;
  average_engagement_rate: number | null;
};

export type DashboardContentSummary = {
  id: string;
  title: string;
  url: string;
  platform: Platform;
  content_type: ContentType;
  topic: string | null;
  published_at: string | null;
  created_at: string;
  latest_views: number | null;
  engagement_rate: number | null;
};

export type DashboardSummary = {
  cards: {
    total_content: number;
    total_views: number;
    best_platform: DashboardGroupSummary | null;
    best_topic: DashboardGroupSummary | null;
  };
  top_content: DashboardContentSummary[];
  recent_uploads: DashboardContentSummary[];
};

function valueOrZero(value: number | null | undefined) {
  return value ?? 0;
}

function engagementCount(item: ContentWithTags) {
  const snapshot = item.latest_snapshot;

  return (
    valueOrZero(snapshot?.likes) +
    valueOrZero(snapshot?.comments) +
    valueOrZero(snapshot?.shares) +
    valueOrZero(snapshot?.saves)
  );
}

function latestViews(item: ContentWithTags) {
  return item.latest_snapshot?.views ?? null;
}

function engagementRate(item: ContentWithTags) {
  const views = latestViews(item);

  if (!views) {
    return null;
  }

  return engagementCount(item) / views;
}

function timestamp(value: string | null | undefined) {
  if (!value) {
    return 0;
  }

  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}

function toContentSummary(item: ContentWithTags): DashboardContentSummary {
  return {
    id: item.id,
    title: item.title,
    url: item.url,
    platform: item.platform,
    content_type: item.content_type,
    topic: item.topic,
    published_at: item.published_at,
    created_at: item.created_at,
    latest_views: latestViews(item),
    engagement_rate: engagementRate(item),
  };
}

function averageEngagementRate(items: ContentWithTags[]) {
  const rates = items
    .map((item) => engagementRate(item))
    .filter((rate): rate is number => rate !== null);

  if (rates.length === 0) {
    return null;
  }

  return rates.reduce((total, rate) => total + rate, 0) / rates.length;
}

function bestGroup(
  items: ContentWithTags[],
  labelFor: (item: ContentWithTags) => string | null,
) {
  const groups = new Map<string, ContentWithTags[]>();

  items.forEach((item) => {
    const label = labelFor(item);

    if (!label) {
      return;
    }

    groups.set(label, [...(groups.get(label) ?? []), item]);
  });

  const ranked = Array.from(groups.entries())
    .map(([label, groupItems]) => ({
      label,
      content_count: groupItems.length,
      total_views: groupItems.reduce(
        (total, item) => total + valueOrZero(latestViews(item)),
        0,
      ),
      average_engagement_rate: averageEngagementRate(groupItems),
    }))
    .sort((first, second) => {
      if (second.total_views !== first.total_views) {
        return second.total_views - first.total_views;
      }

      return first.label.localeCompare(second.label);
    });

  return ranked[0] ?? null;
}

function platformLabel(platform: Platform) {
  return platform === "youtube" ? "YouTube" : "Instagram";
}

function normalizedTopic(value: string | null) {
  const topic = value?.trim();

  if (!topic) {
    return null;
  }

  return topic
    .split(/\s+/)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function buildDashboardSummary(items: ContentWithTags[]): DashboardSummary {
  const activeItems = items.filter((item) => item.status === "active");
  const totalViews = activeItems.reduce(
    (total, item) => total + valueOrZero(latestViews(item)),
    0,
  );
  const rankedContent = [...activeItems]
    .sort((first, second) => {
      const viewDelta =
        valueOrZero(latestViews(second)) - valueOrZero(latestViews(first));

      if (viewDelta !== 0) {
        return viewDelta;
      }

      const rateDelta =
        valueOrZero(engagementRate(second)) - valueOrZero(engagementRate(first));

      if (rateDelta !== 0) {
        return rateDelta;
      }

      return timestamp(second.published_at) - timestamp(first.published_at);
    })
    .map(toContentSummary);
  const recentUploads = [...activeItems]
    .sort(
      (first, second) =>
        timestamp(second.published_at ?? second.created_at) -
        timestamp(first.published_at ?? first.created_at),
    )
    .map(toContentSummary);

  return {
    cards: {
      total_content: activeItems.length,
      total_views: totalViews,
      best_platform: bestGroup(activeItems, (item) =>
        platformLabel(item.platform),
      ),
      best_topic: bestGroup(activeItems, (item) => normalizedTopic(item.topic)),
    },
    top_content: rankedContent.slice(0, 5),
    recent_uploads: recentUploads.slice(0, 5),
  };
}
