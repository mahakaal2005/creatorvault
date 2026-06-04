import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api/auth";
import { apiError } from "@/lib/api/responses";
import { createAdminClient } from "@/lib/supabase/server";
import { getYouTubeAccount } from "@/lib/youtube/account";

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
    });
  }

  try {
    const account = await getYouTubeAccount(createAdminClient(), user.id);

    return NextResponse.json({
      configured: true,
      connected: Boolean(account),
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
