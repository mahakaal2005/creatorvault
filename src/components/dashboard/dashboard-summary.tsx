import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Library,
  Medal,
  Tags,
  Timer,
  TrendingUp,
} from "lucide-react";

import type {
  DashboardContentSummary,
  DashboardSummary,
} from "@/lib/analytics/dashboard";

type DashboardSummaryProps = {
  summary: DashboardSummary;
};

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("en").format(value);
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "-";
  }

  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    style: "percent",
  }).format(value);
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

function formatDurationSeconds(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.round(value % 60);

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
}

function contentTypeLabel(type: DashboardContentSummary["content_type"]) {
  if (type === "youtube_video") {
    return "YouTube video";
  }

  if (type === "youtube_short") {
    return "YouTube Short";
  }

  return "Instagram Reel";
}

export function DashboardSummaryView({ summary }: DashboardSummaryProps) {
  const isEmpty = summary.cards.total_content === 0;

  if (isEmpty) {
    return (
      <section className="rounded-lg border border-dashed bg-card p-8 text-center">
        <Library className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
        <h2 className="mt-3 text-base font-semibold tracking-normal">
          Your dashboard is waiting for content
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Save your first published YouTube video, Short, or Instagram Reel to
          start seeing performance summaries here.
        </p>
        <Link
          href="/content/new"
          className="mt-5 inline-flex h-8 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Add content
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryCard
          icon={<Library className="size-4" aria-hidden="true" />}
          label="Total content"
          value={formatNumber(summary.cards.total_content)}
          detail="Active saved items"
        />
        <SummaryCard
          icon={<TrendingUp className="size-4" aria-hidden="true" />}
          label="Total views"
          value={formatNumber(summary.cards.total_views)}
          detail="Latest snapshot total"
        />
        <SummaryCard
          icon={<Timer className="size-4" aria-hidden="true" />}
          label="Watch time"
          value={formatNumber(summary.cards.total_watch_time_minutes)}
          detail="Latest YouTube Analytics"
        />
        <SummaryCard
          icon={<Medal className="size-4" aria-hidden="true" />}
          label="Best retention"
          value={
            summary.cards.best_retention_content
              ? formatDurationSeconds(
                  summary.cards.best_retention_content
                    .average_view_duration_seconds,
                )
              : "None"
          }
          detail={summary.cards.best_retention_content?.title ?? "No analytics yet"}
        />
        <SummaryCard
          icon={<Medal className="size-4" aria-hidden="true" />}
          label="Best platform"
          value={summary.cards.best_platform?.label ?? "None"}
          detail={
            summary.cards.best_platform
              ? `${formatNumber(summary.cards.best_platform.total_views)} views`
              : "No snapshots yet"
          }
        />
        <SummaryCard
          icon={<Tags className="size-4" aria-hidden="true" />}
          label="Best topic"
          value={summary.cards.best_topic?.label ?? "None"}
          detail={
            summary.cards.best_topic
              ? `${formatNumber(summary.cards.best_topic.total_views)} views`
              : "Add topics to compare"
          }
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <DashboardList
          title="Top content"
          description="Ranked by latest views, then engagement rate."
          items={summary.top_content}
          emptyText="Add snapshots to rank your saved content."
          metricLabel="Views"
          metricFor={(item) => formatNumber(item.latest_views)}
        />
        <DashboardList
          title="Recent uploads"
          description="Active content ordered by published date."
          items={summary.recent_uploads}
          emptyText="New saved content will appear here."
          metricLabel="Published"
          metricFor={(item) => formatDate(item.published_at)}
        />
      </section>
    </>
  );
}

function SummaryCard({
  detail,
  icon,
  label,
  value,
}: {
  detail: string;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-normal">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </article>
  );
}

function DashboardList({
  description,
  emptyText,
  items,
  metricFor,
  metricLabel,
  title,
}: {
  description: string;
  emptyText: string;
  items: DashboardContentSummary[];
  metricFor: (item: DashboardContentSummary) => string;
  metricLabel: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-normal">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <CalendarDays className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          {emptyText}
        </div>
      ) : (
        <div className="mt-5 divide-y rounded-lg border">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/content/${item.id}`}
              className="grid gap-3 p-4 transition-colors hover:bg-muted/60 sm:grid-cols-[1fr_auto]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{contentTypeLabel(item.content_type)}</span>
                  <span className="capitalize">{item.platform}</span>
                  {item.topic ? <span>{item.topic}</span> : null}
                  <span>Engagement {formatPercent(item.engagement_rate)}</span>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-muted-foreground">{metricLabel}</p>
                <p className="text-sm font-semibold">{metricFor(item)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
