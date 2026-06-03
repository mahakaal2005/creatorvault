"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip } from "@/components/charts/chart-tooltip";
import type { ContentPerformancePoint } from "@/lib/analytics/chart-data";

type ContentPerformanceChartsProps = {
  series: ContentPerformancePoint[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}

function percentTick(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function ContentPerformanceCharts({
  series,
}: ContentPerformanceChartsProps) {
  if (series.length === 0) {
    return (
      <section className="rounded-lg border border-dashed bg-card p-6 text-center">
        <h2 className="text-base font-semibold tracking-normal">
          No chart data yet
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Add a stats snapshot to start building a visual performance history.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold tracking-normal">
          Performance charts
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {series.length === 1
            ? "One snapshot saved. Trends will appear as more snapshots are added."
            : "Trends from your manual snapshot history."}
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartPanel title="Views over time">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ left: -24, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="snapshot_date"
                tickFormatter={formatDate}
                tickLine={false}
              />
              <YAxis tickLine={false} width={52} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="views"
                name="Views"
                stroke="#2563eb"
                fill="#93c5fd"
                fillOpacity={0.45}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Engagement count">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ left: -24, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="snapshot_date"
                tickFormatter={formatDate}
                tickLine={false}
              />
              <YAxis tickLine={false} width={52} />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="engagement_count"
                name="Engagement"
                fill="#16a34a"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Engagement rate">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ left: -18, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="snapshot_date"
                tickFormatter={formatDate}
                tickLine={false}
              />
              <YAxis tickFormatter={percentTick} tickLine={false} width={46} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="engagement_rate"
                name="Engagement rate"
                stroke="#dc2626"
                strokeWidth={2}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Audience and watch time">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ left: -18, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="snapshot_date"
                tickFormatter={formatDate}
                tickLine={false}
              />
              <YAxis tickLine={false} width={46} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="audience_gained"
                name="Audience gained"
                stroke="#7c3aed"
                strokeWidth={2}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="watch_time_minutes"
                name="Watch minutes"
                stroke="#ea580c"
                strokeWidth={2}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
    </section>
  );
}

function ChartPanel({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <article className="rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold tracking-normal">{title}</h3>
      <div className="mt-4 h-64 min-w-0">{children}</div>
    </article>
  );
}
