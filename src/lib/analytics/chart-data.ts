import type { ContentWithTags } from "@/lib/content/repository";
import type { StatSnapshot } from "@/lib/content/snapshots";

export type ContentPerformancePoint = {
  snapshot_date: string;
  views: number | null;
  engagement_count: number;
  engagement_rate: number | null;
  audience_gained: number | null;
  watch_time_minutes: number | null;
};

export type DashboardGroupChartPoint = {
  label: string;
  content_count: number;
  total_views: number;
  average_views: number;
  average_engagement_rate: number | null;
};

export type DashboardGroupChartData = {
  platforms: DashboardGroupChartPoint[];
  topics: DashboardGroupChartPoint[];
};

function valueOrZero(value: number | null | undefined) {
  return value ?? 0;
}

function engagementCount(snapshot: {
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
}) {
  return (
    valueOrZero(snapshot.likes) +
    valueOrZero(snapshot.comments) +
    valueOrZero(snapshot.shares) +
    valueOrZero(snapshot.saves)
  );
}

function engagementRate(snapshot: {
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
}) {
  if (!snapshot.views) {
    return null;
  }

  return engagementCount(snapshot) / snapshot.views;
}

function platformLabel(platform: ContentWithTags["platform"]) {
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

function averageEngagementRate(items: ContentWithTags[]) {
  const rates = items
    .map((item) =>
      item.latest_snapshot ? engagementRate(item.latest_snapshot) : null,
    )
    .filter((rate): rate is number => rate !== null);

  if (rates.length === 0) {
    return null;
  }

  return rates.reduce((total, rate) => total + rate, 0) / rates.length;
}

function groupedChartPoints(
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

  return Array.from(groups.entries())
    .map(([label, groupItems]) => {
      const totalViews = groupItems.reduce(
        (total, item) => total + valueOrZero(item.latest_snapshot?.views),
        0,
      );

      return {
        label,
        content_count: groupItems.length,
        total_views: totalViews,
        average_views: totalViews / groupItems.length,
        average_engagement_rate: averageEngagementRate(groupItems),
      };
    })
    .sort((first, second) => {
      if (second.total_views !== first.total_views) {
        return second.total_views - first.total_views;
      }

      return first.label.localeCompare(second.label);
    });
}

export function buildContentPerformanceSeries(
  snapshots: StatSnapshot[],
): ContentPerformancePoint[] {
  return [...snapshots]
    .sort((first, second) =>
      first.snapshot_date.localeCompare(second.snapshot_date),
    )
    .map((snapshot) => ({
      snapshot_date: snapshot.snapshot_date,
      views: snapshot.views,
      engagement_count: engagementCount(snapshot),
      engagement_rate: engagementRate(snapshot),
      audience_gained: snapshot.followers_or_subscribers_gained,
      watch_time_minutes: snapshot.watch_time_minutes,
    }));
}

export function buildDashboardGroupChartData(
  items: ContentWithTags[],
): DashboardGroupChartData {
  const activeItems = items.filter((item) => item.status === "active");

  return {
    platforms: groupedChartPoints(activeItems, (item) =>
      platformLabel(item.platform),
    ),
    topics: groupedChartPoints(activeItems, (item) => normalizedTopic(item.topic)),
  };
}
