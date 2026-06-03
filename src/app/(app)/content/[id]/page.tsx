import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { ContentActions } from "@/components/content/content-actions";
import { ContentForm } from "@/components/content/content-form";
import { ContentPerformanceCharts } from "@/components/content/content-performance-charts";
import { SnapshotHistory } from "@/components/content/snapshot-history";
import { StatsSnapshotForm } from "@/components/content/stats-snapshot-form";
import { buildContentPerformanceSeries } from "@/lib/analytics/chart-data";
import { getContentItemById } from "@/lib/content/repository";
import { listStatSnapshots, type StatSnapshot } from "@/lib/content/snapshots";
import { createClient } from "@/lib/supabase/server";

type ContentDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
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
    return null;
  }

  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function ContentDetailPage({
  params,
}: ContentDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const content = await getContentItemById(supabase, id);

  if (!content) {
    notFound();
  }

  const snapshots = await listStatSnapshots(supabase, id);
  const latestSnapshot = snapshots.at(-1) ?? null;
  const performanceSeries = buildContentPerformanceSeries(snapshots);

  return (
    <div className="space-y-6 pb-16 sm:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/content"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Back to library
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal">
            {content.title}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-md border px-2 py-1">
              {contentTypeLabel(content.content_type)}
            </span>
            <span className="rounded-md border px-2 py-1 capitalize">
              {content.platform}
            </span>
            <span className="rounded-md border px-2 py-1 capitalize">
              {content.status}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={content.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
          >
            Open URL
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
          <ContentActions contentId={content.id} />
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4 rounded-lg border bg-card p-5">
          <h2 className="text-base font-semibold tracking-normal">Metadata</h2>
          <MetadataRow label="Topic" value={content.topic} />
          <MetadataRow label="Hook type" value={content.hook_type} />
          <MetadataRow label="CTA" value={content.cta_keyword} />
          <MetadataRow label="External ID" value={content.external_id} />
          <MetadataRow
            label="Published"
            value={formatDate(content.published_at)}
          />
          <MetadataRow
            label="Tags"
            value={content.tags.length ? content.tags.join(", ") : null}
          />
          {content.hook_text ? (
            <div>
              <p className="text-sm font-medium">Hook</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {content.hook_text}
              </p>
            </div>
          ) : null}
          {content.notes ? (
            <div>
              <p className="text-sm font-medium">Notes</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {content.notes}
              </p>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <LatestSnapshotCard snapshot={latestSnapshot} />
          <StatsSnapshotForm contentId={content.id} />
        </div>
      </section>

      <SnapshotHistory snapshots={snapshots} />
      <ContentPerformanceCharts series={performanceSeries} />

      <section>
        <h2 className="mb-3 text-base font-semibold tracking-normal">
          Edit content
        </h2>
        <ContentForm mode="edit" content={content} />
      </section>
    </div>
  );
}

function LatestSnapshotCard({ snapshot }: { snapshot: StatSnapshot | null }) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="text-base font-semibold tracking-normal">
        Latest snapshot
      </h2>
      {snapshot ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Date" value={formatDate(snapshot.snapshot_date)} />
          <Metric label="Views" value={formatNumber(snapshot.views)} />
          <Metric label="Likes" value={formatNumber(snapshot.likes)} />
          <Metric label="Comments" value={formatNumber(snapshot.comments)} />
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          No performance snapshot has been saved yet.
        </p>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value ?? "-"}</p>
    </div>
  );
}

function MetadataRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">{value ?? "Not set"}</p>
    </div>
  );
}
