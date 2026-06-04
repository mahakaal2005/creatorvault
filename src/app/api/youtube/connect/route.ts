import crypto from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { requireApiUser } from "@/lib/api/auth";
import { apiError } from "@/lib/api/responses";
import { buildAuthorizationUrl } from "@/lib/youtube/oauth";

const STATE_COOKIE = "creatorvault_youtube_oauth_state";

export async function GET(request: NextRequest) {
  const { response } = await requireApiUser();

  if (response) {
    return response;
  }

  try {
    const state = crypto.randomBytes(32).toString("base64url");
    const authorizationUrl = buildAuthorizationUrl({
      origin: request.nextUrl.origin,
      state,
    });
    const redirect = NextResponse.redirect(authorizationUrl);

    redirect.cookies.set(STATE_COOKIE, state, {
      httpOnly: true,
      maxAge: 600,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return redirect;
  } catch {
    return apiError(
      500,
      "YOUTUBE_CONNECT_FAILED",
      "Could not start YouTube connection.",
    );
  }
}

export { STATE_COOKIE };
