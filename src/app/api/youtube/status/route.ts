import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api/auth";
import { apiError } from "@/lib/api/responses";
import { createAdminClient } from "@/lib/supabase/server";
import { getYouTubeAccount } from "@/lib/youtube/account";
import { hasRequiredYouTubeScopes } from "@/lib/youtube/oauth";

function isConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY) &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.YOUTUBE_SYNC_TOKEN_SECRET,
  );
}

export async function GET() {
  const { user, response } = await requireApiUser();

  if (response || !user) {
    return response;
  }

  if (!isConfigured()) {
    return NextResponse.json({
      configured: false,
      connected: false,
      account: null,
      last_synced_at: null,
    });
  }

  try {
    const admin = createAdminClient();
    const account = await getYouTubeAccount(admin, user.id);
    const { data: latestSync } = await admin
      .from("content_items")
      .select("last_synced_at")
      .eq("user_id", user.id)
      .eq("platform", "youtube")
      .eq("source", "youtube_sync")
      .not("last_synced_at", "is", null)
      .order("last_synced_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      configured: true,
      connected: Boolean(account),
      needs_reconnect: account ? !hasRequiredYouTubeScopes(account.scopes) : false,
      last_synced_at: latestSync?.last_synced_at ?? null,
      account: account
        ? {
            id: account.id,
            name: account.account_name,
            provider_account_id: account.provider_account_id,
            token_expires_at: account.token_expires_at,
            updated_at: account.updated_at,
          }
        : null,
    });
  } catch {
    return apiError(
      500,
      "YOUTUBE_STATUS_FAILED",
      "Could not load YouTube connection status.",
    );
  }
}
