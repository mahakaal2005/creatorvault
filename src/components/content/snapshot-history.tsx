import type { StatSnapshot } from "@/lib/content/snapshots";

type SnapshotHistoryProps = {
  snapshots: StatSnapshot[];
};

const metricLabels: Array<{
  key: keyof Pick<
    StatSnapshot,
    | "views"
    | "likes"
    | "comments"
    | "shares"
    | "saves"
    | "followers_or_subscribers_gained"
    | "average_view_duration_seconds"
    | "watch_time_minutes"
  >;
  label: string;
}> = [
  { key: "views", label: "Views" },
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Comments" },
  { key: "shares", label: "Shares" },
  { key: "saves", label: "Saves" },
  { key: "followers_or_subscribers_gained", label: "Audience" },
  { key: "average_view_duration_seconds", label: "Avg sec" },
  { key: "watch_time_minutes", label: "Watch min" },
];

function formatNumber(value: number | null) {
  if (value === null) {
    return "-";
  }

  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function SnapshotHistory({ snapshots }: SnapshotHistoryProps) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold tracking-normal">
          Snapshot history
        </h2>
        <p className="text-sm text-muted-foreground">
          {snapshots.length} saved {snapshots.length === 1 ? "snapshot" : "snapshots"}
        </p>
      </div>

      {snapshots.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm font-medium">No snapshots yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add the first manual stats snapshot to start tracking performance.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {snapshots.map((snapshot) => (
            <article key={snapshot.id} className="rounded-lg border p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium">{formatDate(snapshot.snapshot_date)}</p>
                  {snapshot.notes ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {snapshot.notes}
                    </p>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  Saved {formatDate(snapshot.created_at.slice(0, 10))}
                </p>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {metricLabels.map((metric) => (
                  <div key={metric.key} className="rounded-md bg-muted p-2">
                    <dt className="text-xs text-muted-foreground">
                      {metric.label}
                    </dt>
                    <dd className="text-sm font-semibold">
                      {formatNumber(snapshot[metric.key])}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
