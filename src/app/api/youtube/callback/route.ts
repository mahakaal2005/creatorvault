import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { getOwnYouTubeChannel } from "@/lib/youtube/api";
import { saveYouTubeAccount } from "@/lib/youtube/account";
import { exchangeCodeForTokens } from "@/lib/youtube/oauth";

const STATE_COOKIE = "creatorvault_youtube_oauth_state";

function settingsRedirect(request: NextRequest, status: string) {
  return NextResponse.redirect(
    new URL(`/settings?youtube=${status}`, request.nextUrl.origin),
  );
}

export async function GET(request: NextRequest) {
  const { user, response } = await requireApiUser();

  if (response || !user) {
    return settingsRedirect(request, "auth-required");
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return settingsRedirect(request, "invalid-state");
  }

  try {
    const tokens = await exchangeCodeForTokens({
      code,
      origin: request.nextUrl.origin,
    });
    const channel = await getOwnYouTubeChannel(tokens.access_token);
    const admin = createAdminClient();

    await saveYouTubeAccount({
      supabase: admin,
      userId: user.id,
      providerAccountId: channel.id,
      accountName: channel.title,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
    });

    const redirect = settingsRedirect(request, "connected");
    redirect.cookies.delete(STATE_COOKIE);

    return redirect;
  } catch {
    const redirect = settingsRedirect(request, "error");
    redirect.cookies.delete(STATE_COOKIE);

    return redirect;
  }
}
