import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api/auth";
import { buildDashboardSummary } from "@/lib/analytics/dashboard";
import { listContentItems } from "@/lib/content/repository";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const { response } = await requireApiUser();

  if (response) {
    return response;
  }

  const supabase = await createClient();
  const items = await listContentItems(supabase);
  const summary = buildDashboardSummary(items);

  return NextResponse.json({ summary });
}
