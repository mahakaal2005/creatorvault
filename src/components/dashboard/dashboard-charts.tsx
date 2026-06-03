"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip } from "@/components/charts/chart-tooltip";
import type { DashboardGroupChartPoint } from "@/lib/analytics/chart-data";

type DashboardChartsProps = {
  platforms: DashboardGroupChartPoint[];
  topics: DashboardGroupChartPoint[];
};

export function DashboardCharts({ platforms, topics }: DashboardChartsProps) {
  if (platforms.length === 0 && topics.length === 0) {
    return (
      <section className="rounded-lg border border-dashed bg-card p-6 text-center">
        <h2 className="text-base font-semibold tracking-normal">
          No chart data yet
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Save content with snapshots and topics to compare platform and topic
          performance.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <GroupChart
        data={platforms}
        emptyText="Add snapshots to compare platforms."
        title="Platform performance"
      />
      <GroupChart
        data={topics}
        emptyText="Add topics to compare content themes."
        title="Topic performance"
      />
    </section>
  );
}

function GroupChart({
  data,
  emptyText,
  title,
}: {
  data: DashboardGroupChartPoint[];
  emptyText: string;
  title: string;
}) {
  return (
    <article className="rounded-lg border bg-card p-4">
      <div>
        <h2 className="text-base font-semibold tracking-normal">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Total latest views by group.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          {emptyText}
        </div>
      ) : (
        <div className="mt-4 h-72 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -24, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} />
              <YAxis tickLine={false} width={54} />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="total_views"
                name="Views"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="content_count"
                name="Items"
                fill="#16a34a"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
}
