import Link from "next/link";
import { Plus } from "lucide-react";

import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { DashboardSummaryView } from "@/components/dashboard/dashboard-summary";
import { buttonVariants } from "@/components/ui/button";
import { buildDashboardGroupChartData } from "@/lib/analytics/chart-data";
import { buildDashboardSummary } from "@/lib/analytics/dashboard";
import { listContentItems } from "@/lib/content/repository";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const items = await listContentItems(supabase);
  const summary = buildDashboardSummary(items);
  const chartData = buildDashboardGroupChartData(items);

  return (
    <div className="space-y-6 pb-16 sm:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Dashboard</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            A private performance overview from your latest manual stats
            snapshots.
          </p>
        </div>
        <Link href="/content/new" className={buttonVariants()}>
          <Plus className="size-4" aria-hidden="true" />
          Add content
        </Link>
      </div>

      <DashboardSummaryView summary={summary} />
      <DashboardCharts
        platforms={chartData.platforms}
        topics={chartData.topics}
      />
    </div>
  );
}
